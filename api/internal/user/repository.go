package user

import (
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/apperrors"
)

type Repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		db: db,
	}
}

func (r *Repository) Create(params CreateUserParams) (*UserNoPassword, error) {
	user := &UserNoPassword{}
	query := `
	   INSERT INTO users (username, first_name, last_name, email, password) 
	   VALUES (:username, :first_name, :last_name, :email, :password) 
	   RETURNING id, username, first_name, last_name, email, created_at, updated_at
	`

	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}

	query = r.db.Rebind(query)

	err = r.db.Get(user, query, args...)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *Repository) GetByID(ID int) (*UserNoPassword, error) {
	user := &UserNoPassword{}
	query := `SELECT id, is_private, username, first_name, last_name, email, created_at, updated_at, avatar FROM users WHERE id = $1`
	err := r.db.Get(user, query, ID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}

	return user, nil
}

func (r *Repository) GetByEmail(email string) (*UserNoPassword, error) {
	user := &UserNoPassword{}
	query := `SELECT id, is_private, username, first_name, last_name, email, created_at, updated_at FROM users WHERE email = $1`
	err := r.db.Get(user, query, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}

	return user, nil
}

func (r *Repository) GetByEmailWithPassword(email string) (*User, error) {
	user := &User{}
	query := `SELECT * FROM users WHERE email = $1`
	err := r.db.Get(user, query, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}
	return user, nil
}

func (r *Repository) GetUserByUsername(username string) (*UserNoPassword, error) {
	user := &UserNoPassword{}
	query := `SELECT id, is_private, username, first_name, last_name, email, created_at, updated_at, avatar FROM users WHERE username = $1`
	err := r.db.Get(user, query, username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}
	return user, nil
}

func (r *Repository) UpdateAvatar(userID int, filename string) error {
	query := `UPDATE users SET avatar = $1 WHERE id = $2`
	_, err := r.db.Exec(query, filename, userID)
	return err
}
