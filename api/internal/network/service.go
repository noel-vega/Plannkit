package network

// TODO: add operations for followeing and making connections with other users
//
import "github.com/noel-vega/habits/api/internal/user"

type Service struct {
	userService *user.Service
}

func NewService(userService *user.Service) *Service {
	return &Service{
		userService: userService,
	}
}

func (s *Service) Discover(params *user.ListUsersParams) ([]user.UserNoPassword, error) {
	return s.userService.ListUsers(params)
}

func (s *Service) GetProfile(username string) (*user.UserNoPassword, error) {
	return s.userService.GetUserByUsername(username)
}
