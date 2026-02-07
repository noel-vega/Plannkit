// Package todos
package todos

import (
	"time"
)

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
