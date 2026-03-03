// Package user
package user

import "time"

type User struct {
	ID        int       `json:"id" db:"id"`
	Username  string    `json:"username" db:"username"`
	FirstName string    `json:"firstName" db:"first_name"`
	LastName  string    `json:"lastName" db:"last_name"`
	Password  string    `json:"password" db:"password"`
	Email     string    `json:"email" db:"email"`
	IsPrivate bool      `json:"isPrivate" db:"is_private"`
	Avatar    *string   `json:"avatar" db:"avatar"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type UserNoPassword struct {
	ID        int       `json:"id" db:"id"`
	Username  string    `json:"username" db:"username"`
	FirstName string    `json:"firstName" db:"first_name"`
	LastName  string    `json:"lastName" db:"last_name"`
	Email     string    `json:"email" db:"email"`
	IsPrivate bool      `json:"isPrivate" db:"is_private"`
	Avatar    *string   `json:"avatar" db:"avatar"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type CreateUserParams struct {
	Username  string `json:"username" db:"username"`
	FirstName string `json:"firstName" db:"first_name"`
	LastName  string `json:"lastName" db:"last_name"`
	Email     string `json:"email" db:"email"`
	Password  string `json:"password" db:"password"`
}
