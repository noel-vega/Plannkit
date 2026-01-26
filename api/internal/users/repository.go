package users

import "github.com/jmoiron/sqlx"

type UserRepo struct {
	DB *sqlx.DB
}

func NewUserRepo(db *sqlx.DB) *UserRepo {
	return &UserRepo{
		DB: db,
	}
}

func (r *UserRepo) GetUserByEmail(email string) (*UserNoPassword, error) {
	user := &UserNoPassword{}
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

func (r *UserRepo) CreateUser(params CreateUserParams) error {
	query := `
	   INSERT INTO users (first_name, last_name, email, password) 
		 VALUES (:first_name, :last_name, :email, :password) 
	`

	_, err := r.DB.NamedExec(query, params)
	if err != nil {
		return err
	}
	return nil
}
