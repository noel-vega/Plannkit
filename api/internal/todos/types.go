// Package todos
package todos

import "time"

type Todo struct {
	ID          int       `json:"id" db:"id"`
	UserID      int       `json:"userId" db:"user_id"`
	Name        string    `json:"name" db:"name"`
	Status      string    `json:"status" db:"status"`
	Position    string    `json:"position" db:"position"`
	Description string    `json:"description" db:"description"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}

type CreateTodoBody struct {
	Name        string `json:"name"`
	Status      string `json:"status"`
	Description string `json:"description"`
	Position    string `json:"position"`
}

type CreateTodoParams struct {
	UserID      int    `json:"userId" db:"user_id"`
	Name        string `json:"name" db:"name"`
	Status      string `json:"status" db:"status"`
	Description string `json:"description" db:"description"`
	Position    string `json:"position" db:"position"`
}

type GetTodoParams struct {
	ID     int `json:"id" db:"id"`
	UserID int `json:"userId" db:"user_id"`
}

type GetLastParams struct {
	UserID int    `json:"userId" db:"user_id"`
	Status string `json:"status" db:"status"`
}

type UpdateTodoParams struct {
	ID          int    `json:"id" db:"id"`
	UserID      int    `json:"userId" db:"user_id"`
	Name        string `json:"name" db:"name"`
	Status      string `json:"status" db:"status"`
	Description string `json:"description" db:"description"`
	Position    string `json:"position" db:"position"`
}

type UpdatePositionBody struct {
	Status         string `json:"status"`
	AfterPosition  string `json:"afterPosition"`
	BeforePosition string `json:"beforePosition"`
}
type UpdatePositionParams struct {
	ID             int    `json:"id" db:"id"`
	UserID         int    `json:"userId" db:"user_id"`
	Status         string `json:"status" db:"status"`
	AfterPosition  string `json:"afterPosition"`
	BeforePosition string `json:"beforePosition"`
}

type DeleteTodoParams struct {
	ID     int `json:"id" db:"id"`
	UserID int `json:"userId" db:"user_id"`
}
