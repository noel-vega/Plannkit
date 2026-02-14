package users

import (
	"github.com/jmoiron/sqlx"
)

type Repository struct {
	DB *sqlx.DB
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		DB: db,
	}
}

func (r *Repository) Create(params CreateUserParams) (*UserNoPassword, error) {
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

func (r *Repository) GetByID(ID int) (*UserNoPassword, error) {
	user := &UserNoPassword{}
	query := `SELECT id, first_name, last_name, email, created_at, updated_at FROM users WHERE id = $1`
	err := r.DB.Get(user, query, ID)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *Repository) GetByEmail(email string) (*UserNoPassword, error) {
	user := &UserNoPassword{}
	query := `SELECT id, first_name, last_name, email, created_at, updated_at FROM users WHERE email = $1`
	err := r.DB.Get(user, query, email)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *Repository) GetByEmailWithPassword(email string) (*User, error) {
	user := &User{}
	query := `SELECT * FROM users WHERE email = $1`
	err := r.DB.Get(user, query, email)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *Repository) UpdateAvatar(userID int, filename string) error {
	query := `UPDATE users SET avatar = $1 WHERE id = $2`
	_, err := r.DB.Exec(query, filename, userID)
	if err != nil {
		return err
	}
	return nil
}
