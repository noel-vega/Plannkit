// Package user
package user

import "time"

type User struct {
	ID        int32     `json:"id" db:"id"`
	Username  string    `json:"username" db:"username"`
	FirstName string    `json:"firstName" db:"first_name"`
	LastName  string    `json:"lastName" db:"last_name"`
	Password  string    `json:"-" db:"password"`
	Email     string    `json:"email" db:"email"`
	IsPrivate bool      `json:"isPrivate" db:"is_private"`
	Avatar    *string   `json:"avatar" db:"avatar"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type UserNoPassword struct {
	ID        int32     `json:"id" db:"id"`
	Username  string    `json:"username" db:"username"`
	FirstName string    `json:"firstName" db:"first_name"`
	LastName  string    `json:"lastName" db:"last_name"`
	Email     string    `json:"email" db:"email"`
	IsPrivate bool      `json:"isPrivate" db:"is_private"`
	Avatar    *string   `json:"avatar" db:"avatar"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

func (u *User) WithoutPassword() *UserNoPassword {
	return &UserNoPassword{
		ID:        u.ID,
		Username:  u.Username,
		FirstName: u.FirstName,
		LastName:  u.LastName,
		Email:     u.Email,
		IsPrivate: u.IsPrivate,
		Avatar:    u.Avatar,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

type CreateUserParams struct {
	Username  string  `json:"username" db:"username"`
	FirstName string  `json:"firstName" db:"first_name"`
	LastName  string  `json:"lastName" db:"last_name"`
	Email     string  `json:"email" db:"email"`
	Password  string  `json:"password" db:"password"`
	Avatar    *string `json:"avatar" db:"avatar"`
}
