package user

import (
	"errors"
	"io"

	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/apperrors"
	"github.com/noel-vega/habits/api/internal/finances"
	"github.com/noel-vega/habits/api/internal/storage"
)

type Service struct {
	userRepo        *Repository
	financesService *finances.Service
	storageService  storage.Service
}

func NewService(db *sqlx.DB, storageService storage.Service) *Service {
	return &Service{
		userRepo:       NewRepository(db),
		storageService: storageService,
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

func (s *Service) UpdateAvatar(userID int, ext string, file io.Reader) (string, error) {
	fileName, err := s.storageService.Put("avatars", ext, file)
	if err != nil {
		return "", err
	}

	err = s.userRepo.UpdateAvatar(userID, fileName)
	if err != nil {
		return "", err
	}

	return fileName, nil
}
