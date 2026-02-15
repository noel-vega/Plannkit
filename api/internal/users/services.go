package users

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

func NewUserService(db *sqlx.DB, storageService storage.Service, finfinancesService *finances.Service) *Service {
	return &Service{
		userRepo:        NewRepository(db),
		storageService:  storageService,
		financesService: finfinancesService,
	}
}

func (svc *Service) CreateUser(params CreateUserParams) (*UserNoPassword, error) {
	existingUser, err := svc.userRepo.GetByEmail(params.Email)
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			return nil, err
		}
	}

	if existingUser != nil {
		return nil, fmt.Errorf("%s:%w", params.Email, ErrEmailExists)
	}

	newUser, err := svc.userRepo.Create(params)
	if err != nil {
		return nil, err
	}

	_, err = svc.financesService.CreateSpace(finances.CreateSpaceParams{
		UserID: newUser.ID,
		Name:   "My Finances",
	})
	if err != nil {
		return nil, err
	}

	return newUser, nil
}

func (svc *Service) GetUserByEmailWithPassword(email string) (*User, error) {
	user, err := svc.userRepo.GetByEmailWithPassword(email)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (svc *Service) GetUserByID(ID int) (*UserNoPassword, error) {
	user, err := svc.userRepo.GetByID(ID)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (svc *Service) UpdateAvatar(userID int, ext string, file io.Reader) (string, error) {
	fileName, err := svc.storageService.Put("avatars", ext, file)
	if err != nil {
		return "", err
	}

	err = svc.userRepo.UpdateAvatar(userID, fileName)
	if err != nil {
		return "", err
	}

	return fileName, nil
}
