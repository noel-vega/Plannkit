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

type UserService struct {
	UserRepo       *UserRepo
	StorageService storage.Service
}

func NewUserService(db *sqlx.DB) *UserService {
	return &UserService{
		UserRepo:       NewUserRepo(db),
		StorageService: storage.NewLocalStorage(""),
	}
}

func (svc *UserService) CreateUser(params CreateUserParams) (*UserNoPassword, error) {
	existingUser, err := svc.UserRepo.GetUserByEmail(params.Email)
	fmt.Printf("USER: %v+\n", existingUser)

	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			return nil, err
		}
	}

	if existingUser != nil {
		return nil, fmt.Errorf("%s:%w", params.Email, ErrEmailExists)
	}

	newUser, err := svc.UserRepo.CreateUser(params)
	if err != nil {
		return nil, err
	}
	return newUser, nil
}

func (svc *UserService) GetUserByCredentials(email string, password string) (*User, error) {
	user, err := svc.UserRepo.GetUserByEmailWithPassword(email)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (svc *UserService) GetUserByID(ID int) (*UserNoPassword, error) {
	fmt.Println("GET USER BY ID", ID)
	user, err := svc.UserRepo.GetUserByID(ID)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (svc *UserService) UploadAvatar(fileName string, file io.Reader) (string, error) {
	return svc.StorageService.Put("avatars", filepath.Ext(fileName), file)
}
