package user

import (
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/apperrors"
)

type Service struct {
	userRepo *Repository
}

func NewService(db *sqlx.DB) *Service {
	return &Service{
		userRepo: NewRepository(db),
	}
}

func (s *Service) CreateUser(params CreateUserParams) (*UserNoPassword, error) {
	user, err := s.userRepo.GetByEmail(params.Email)
	if err != nil {
		if !errors.Is(err, apperrors.ErrNotFound) {
			return nil, err
		}
	}

	if user != nil {
		return nil, ErrEmailExists
	}

	newUser, err := s.userRepo.Create(params)
	if err != nil {
		return nil, err
	}

	return newUser, nil
}

func (s *Service) GetUserByEmailWithPassword(email string) (*User, error) {
	user, err := s.userRepo.GetByEmailWithPassword(email)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *Service) GetUserByID(ID int) (*UserNoPassword, error) {
	user, err := s.userRepo.GetByID(ID)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *Service) GetUserByUsername(username string) (*UserNoPassword, error) {
	return s.userRepo.GetUserByUsername(username)
}

func (s *Service) UpdateAvatar(userID int, fileName string) error {
	err := s.userRepo.UpdateAvatar(userID, fileName)
	if err != nil {
		return err
	}

	return err
}
