package user

import (
	"database/sql"
	"errors"
	"fmt"
	"io"

	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/finances"
	"github.com/noel-vega/habits/api/internal/storage"
)

type Service struct {
	userRepo        *Repository
	financesService *finances.Service
	storageService  storage.Service
}

func NewUserService(db *sqlx.DB, storageService storage.Service, financesService *finances.Service) *Service {
	return &Service{
		userRepo:        NewRepository(db),
		storageService:  storageService,
		financesService: financesService,
	}
}

func (s *Service) CreateUser(params CreateUserParams) (*UserNoPassword, error) {
	existingUser, err := s.userRepo.GetByEmail(params.Email)
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			return nil, err
		}
	}

	if existingUser != nil {
		return nil, fmt.Errorf("%s:%w", params.Email, ErrEmailExists)
	}

	newUser, err := s.userRepo.Create(params)
	if err != nil {
		return nil, err
	}

	_, err = s.financesService.CreateSpace(&finances.CreateSpaceParams{
		UserID: newUser.ID,
		Name:   "My Finances",
	})
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

func (s *Service) ListUsers(params *ListUsersParams) ([]UserNoPassword, error) {
	return s.userRepo.ListUsers(params)
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
