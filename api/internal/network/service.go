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
	case "connections":
		return s.repository.ListConnections(params)
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
	if err != nil && !errors.Is(err, apperrors.ErrNotFound) {
		return nil, err
	}

	connection, err := s.GetConnection(params.UserID, user.ID)
	if err != nil && !errors.Is(err, ErrConnectionNotFound) {
		return nil, err
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
		FollowRelationship: FollowRelationship{
			FollowerUserID:  params.FollowerUserID,
			FollowingUserID: followingUser.ID,
		},
		Status: status,
	})
}

func (s *Service) AcceptFollow(params *AcceptFollowParams) error {
	if params.FollowerUserID == params.FollowingUserID {
		return ErrFollowSelf
	}

	follow, err := s.repository.GetFollow(&GetFollowerParams{
		FollowerUserID:  params.FollowerUserID,
		FollowingUserID: params.FollowingUserID,
	})
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return ErrFollowNotFound
		}
		return err
	}

	if follow.Status == "accepted" {
		return nil
	}

	return s.repository.AcceptFollow(params)
}

func (s *Service) RemoveFollow(params *RemoveFollowParams) error {
	if params.FollowerUserID == params.FollowingUserID {
		return ErrUnFollowSelf
	}

	err := s.repository.DeleteFollow(params)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrFollowNotFound
	}
	return err
}

func OrderUserIDs(user1ID, user2ID int32) (int32, int32) {
	if user1ID > user2ID {
		temp := user1ID
		user1ID = user2ID
		user2ID = temp
	}
	return user1ID, user2ID
}

func (s *Service) GetConnection(user1ID, user2ID int32) (*Connection, error) {
	u1, u2 := OrderUserIDs(user1ID, user2ID)
	connection, err := s.repository.GetConnection(u1, u2)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, ErrConnectionNotFound
		}
		return nil, err
	}
	return connection, err
}

func (s *Service) AreConnected(user1ID, user2ID int32) (bool, error) {
	_, err := s.GetConnection(user1ID, user2ID)
	if err != nil {
		if errors.Is(err, ErrConnectionNotFound) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (s *Service) RequestConnection(params *RequestConnectionParams) (*Connection, error) {
	if params.RequestedByUserID == params.TargetUserID {
		return nil, ErrConnectSelf
	}

	_, err := s.userService.GetUserByID(params.TargetUserID)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	userID1, userID2 := OrderUserIDs(params.RequestedByUserID, params.TargetUserID)

	connection, err := s.GetConnection(userID1, userID2)
	if err != nil && !errors.Is(err, ErrConnectionNotFound) {
		return nil, err
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

func (s *Service) AcceptConnection(params *AcceptConnectionParams) error {
	connection, err := s.GetConnection(params.AcceptedByUserID, params.RequestedByUserID)
	if err != nil {
		return err
	}

	if params.AcceptedByUserID == connection.RequestedByUserID {
		return ErrCannotAcceptOwnConnectionRequest
	}

	if connection.Status == "accepted" {
		return nil
	}

	return s.repository.AcceptConnection(connection.ID)
}

func (s *Service) RemoveConnection(user1ID, user2ID int32) error {
	connection, err := s.GetConnection(user1ID, user2ID)
	if err != nil {
		return err
	}

	err = s.repository.DeleteConnection(connection.ID)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrConnectionNotFound
	}
	return err
}
