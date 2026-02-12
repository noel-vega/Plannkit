package users

import (
	"database/sql"
	"errors"
	"fmt"
	"io"
	"path/filepath"

	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/storage"
)

type Service struct {
	userRepo       *UserRepo
	storageService storage.Service
}

func NewUserService(db *sqlx.DB, storageService storage.Service) *Service {
	return &Service{
		userRepo:       NewUserRepo(db),
		storageService: storageService,
	}
}

func (svc *Service) CreateUser(params CreateUserParams) (*UserNoPassword, error) {
	existingUser, err := svc.userRepo.GetUserByEmail(params.Email)
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			return nil, err
		}
	}

	if existingUser != nil {
		return nil, fmt.Errorf("%s:%w", params.Email, ErrEmailExists)
	}

	newUser, err := svc.userRepo.CreateUser(params)
	if err != nil {
		return nil, err
	}
	return newUser, nil
}

func (svc *Service) GetUserByEmailWithPassword(email string) (*User, error) {
	user, err := svc.userRepo.GetUserByEmailWithPassword(email)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (svc *Service) GetUserByID(ID int) (*UserNoPassword, error) {
	user, err := svc.userRepo.GetUserByID(ID)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (svc *Service) UploadAvatar(fileName string, file io.Reader) (string, error) {
	return svc.storageService.Put("avatars", filepath.Ext(fileName), file)
}
