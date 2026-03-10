package network

import (
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/apperrors"
	"github.com/noel-vega/habits/api/internal/user"
)

type Service struct {
	userService *user.Service
	repository  *Repository
}

func NewService(db *sqlx.DB, userService *user.Service) *Service {
	return &Service{
		userService: userService,
		repository:  NewRepository(db),
	}
}

func (s *Service) ListUsers(params *ListUsersParams) ([]NetworkUser, error) {
	switch params.QueryParams.Filter {
	case "followers":
		return s.repository.ListFollowers(params)
	case "following":
		return s.repository.ListFollowing(params)
	default:
		return s.repository.ListUsers(params)
	}
}

func (s *Service) IsFollowing(params *GetFollowerParams) (bool, error) {
	_, err := s.repository.GetFollow(params)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return false, nil
		}
		return false, err
	}

	return true, nil
}

func (s *Service) GetUserProfile(params *GetUserProfileParams) (*UserProfile, error) {
	user, err := s.userService.GetUserByUsername(params.Username)
	if err != nil {
		return nil, err
	}

	follow, err := s.repository.GetFollow(&GetFollowerParams{
		FollowerUserID:  params.UserID,
		FollowingUserID: user.ID,
	})
	if err != nil {
		if !errors.Is(err, apperrors.ErrNotFound) {
			return nil, err
		}
	}

	connection, err := s.GetConnection(params.UserID, user.ID)
	if err != nil {
		if !errors.Is(err, apperrors.ErrNotFound) {
			return nil, err
		}
	}

	profile := &UserProfile{
		User:       user,
		Follow:     follow,
		Connection: connection,
	}

	return profile, nil
}

func (s *Service) RequestFollow(params *RequestFollowParams) error {
	if params.FollowerUserID == params.FollowingUserID {
		return ErrFollowSelf
	}

	followingUser, err := s.userService.GetUserByID(params.FollowingUserID)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return ErrUserNotFound
		}
		return err
	}

	var status string
	if followingUser.IsPrivate {
		status = "pending"
	} else {
		status = "accepted"
	}

	return s.repository.InsertFollow(&InsertFollowParams{
		FollowerUserID:  params.FollowerUserID,
		FollowingUserID: followingUser.ID,
		Status:          status,
	})
}

func (s *Service) RemoveFollow(params *RemoveFollowParams) error {
	if params.FollowerUserID == params.FollowingUserID {
		return ErrUnFollowSelf
	}

	isFollowing, err := s.IsFollowing(&GetFollowerParams{
		FollowerUserID:  params.FollowerUserID,
		FollowingUserID: params.FollowingUserID,
	})
	if err != nil {
		return err
	}

	if !isFollowing {
		return apperrors.ErrNotFound
	}
	return s.repository.DeleteFollow(params)
}

func OrderUserIDs(user1ID, user2ID int) (int, int) {
	if user1ID > user2ID {
		temp := user1ID
		user1ID = user2ID
		user2ID = temp
	}
	return user1ID, user2ID
}

func (s *Service) GetConnection(user1ID, user2ID int) (*Connection, error) {
	u1, u2 := OrderUserIDs(user1ID, user2ID)
	return s.repository.GetConnection(u1, u2)
}

func (s *Service) RequestConnection(params *RequestConnectionParams) (*Connection, error) {
	if params.RequestedByUserID == params.TargerUserID {
		return nil, ErrConnectSelf
	}

	_, err := s.userService.GetUserByID(params.TargerUserID)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	userID1, userID2 := OrderUserIDs(params.RequestedByUserID, params.TargerUserID)

	connection, err := s.GetConnection(userID1, userID2)
	if err != nil {
		if !errors.Is(err, apperrors.ErrNotFound) {
			return nil, err
		}
	}

	if connection != nil {
		return nil, ErrConnectionRequestExists
	}

	return s.repository.InsertConnection(&InsertConnectionParams{
		User1ID:           userID1,
		User2ID:           userID2,
		RequestedByUserID: params.RequestedByUserID,
	})
}

func (s *Service) AcceptConnection(user1ID, user2ID int) error {
	connection, err := s.GetConnection(user1ID, user2ID)
	if err != nil {
		return err
	}

	if connection.Status == "accepted" {
		return nil
	}

	return s.repository.AcceptConnection(connection.ID)
}

func (s *Service) RemoveConnection(user1ID, user2ID int) error {
	connection, err := s.GetConnection(user1ID, user2ID)
	if err != nil {
		return err
	}

	return s.repository.DeleteConnection(connection.ID)
}
