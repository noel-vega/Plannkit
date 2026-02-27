package network

// TODO: add operations for followeing and making connections with other users
//
import (
	"github.com/jmoiron/sqlx"
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
	follower, err := s.repository.GetFollower(params)
	if err != nil {
		return false, err
	}

	if follower == nil {
		return false, nil
	}

	return true, nil
}

func (s *Service) GetUserProfile(params *GetUserProfileParams) (*UserProfile, error) {
	user, err := s.userService.GetUserByUsername(params.Username)
	if err != nil {
		return nil, err
	}

	if user == nil {
		return nil, nil
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
