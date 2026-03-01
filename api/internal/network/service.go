package network

// TODO: add operations for followeing and making connections with other users
//
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

func (s *Service) Discover(params *user.ListUsersParams) ([]user.UserNoPassword, error) {
	return s.userService.ListUsers(params)
}

func (s *Service) IsFollowing(params *GetFollowerParams) (bool, error) {
	_, err := s.repository.GetFollower(params)
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

	isFollowing, err := s.IsFollowing(&GetFollowerParams{
		UserID:          params.UserID,
		FollowingUserID: user.ID,
	})
	if err != nil {
		return nil, err
	}

	profile := &UserProfile{
		User:        user,
		IsFollowing: isFollowing,
	}

	return profile, nil
}

func (s *Service) FollowUser(params *FollowUserParams) error {
	if params.UserID == params.FollowingUserID {
		return ErrFollowSelf
	}

	followingUser, err := s.userService.GetUserByID(params.FollowingUserID)
	if err != nil {
		return err
	}

	var status string
	if followingUser.IsPrivate {
		status = "pending"
	} else {
		status = "accepted"
	}

	return s.repository.InsertFollow(&InsertFollowParams{
		UserID:          params.UserID,
		FollowingUserID: followingUser.ID,
		Status:          status,
	})
}

func (s *Service) UnFollowUser(params *DeleteFollowParams) error {
	if params.UserID == params.FollowingUserID {
		return ErrUnFollowSelf
	}

	isFollowing, err := s.IsFollowing(&GetFollowerParams{
		UserID:          params.UserID,
		FollowingUserID: params.FollowingUserID,
	})
	if err != nil {
		return err
	}

	if !isFollowing {
		return ErrFollowNotFound
	}
	return s.repository.DeleteFollow(params)
}
