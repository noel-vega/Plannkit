// Package finances
package finances

import "time"

type Space struct {
	ID        int       `json:"id" db:"id"`
	UserID    int       `json:"userId" db:"user_id"`
	Name      string    `json:"name" db:"name"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type SpaceMember struct {
	ID        int       `json:"id" db:"id"`
	SpaceID   int       `json:"spaceId" db:"finance_space_id"`
	UserID    int       `json:"userId" db:"user_id"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type Expense struct {
	ID        int       `json:"id" db:"id"`
	SpaceID   int       `json:"spaceID" db:"finance_space_id"`
	UserID    int       `json:"userId" db:"user_id"`
	Name      string    `json:"name" db:"name"`
	Amount    int       `json:"amount" db:"amount"`
	Category  *string   `json:"category" db:"category"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type Goal struct{}
