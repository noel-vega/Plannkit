package users

import (
	"fmt"

	"github.com/jmoiron/sqlx"
)

type UserRepo struct {
	DB *sqlx.DB
}

func NewUserRepo(db *sqlx.DB) *UserRepo {
	return &UserRepo{
		DB: db,
	}
}

func (r *UserRepo) GetUserByID(ID int) (*UserNoPassword, error) {
	fmt.Printf("GET USER BY ID: %v\n", ID)
	user := &UserNoPassword{}
	query := `SELECT id, first_name, last_name, email, created_at, updated_at FROM users WHERE id = $1`
	err := r.DB.Get(user, query, ID)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *UserRepo) GetUserByEmail(email string) (*UserNoPassword, error) {
	user := &UserNoPassword{}
	query := `SELECT id, first_name, last_name, email, created_at, updated_at FROM users WHERE email = $1`
	err := r.DB.Get(user, query, email)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *UserRepo) GetUserByEmailWithPassword(email string) (*User, error) {
	user := &User{}
	query := `SELECT * FROM users WHERE email = $1`
	err := r.DB.Get(user, query, email)
	if err != nil {
		return nil, err
	}
	return user, nil
}

type CreateUserParams struct {
	FirstName string `json:"firstName" db:"first_name"`
	LastName  string `json:"lastName" db:"last_name"`
	Email     string `json:"email" db:"email"`
	Password  string `json:"password" db:"password"`
}

func (r *UserRepo) CreateUser(params CreateUserParams) (*UserNoPassword, error) {
	user := &UserNoPassword{}
	query := `
	   INSERT INTO users (first_name, last_name, email, password) 
		 VALUES ($1, $2, $3, $4) 
		 RETURNING id, first_name, last_name, email, created_at, updated_at
	`

	err := r.DB.Get(user, query, params.FirstName, params.LastName, params.Email, params.Password)
	if err != nil {
		return nil, err
	}

	return user, nil
}
