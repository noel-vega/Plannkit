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
	ID          int       `json:"id" db:"id"`
	SpaceID     int       `json:"spaceId" db:"finance_space_id"`
	UserID      int       `json:"userId" db:"user_id"`
	Name        string    `json:"name" db:"name"`
	Amount      int       `json:"amount" db:"amount"`
	Category    *string   `json:"category" db:"category"`
	Description *string   `json:"description" db:"description"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}

type CreateExpenseParams struct {
	SpaceID     int     `json:"spaceId" db:"finance_space_id"`
	UserID      int     `json:"userId" db:"user_id"`
	Name        string  `json:"name" db:"name"`
	Amount      int     `json:"amount" db:"amount"`
	Category    *string `json:"category" db:"category"`
	Description *string `json:"description" db:"description"`
}

// CREATE TABLE IF NOT EXISTS finance_spaces_goals (
//   id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
//   finance_space_id INT NOT NULL REFERENCES finance_spaces(id) ON DELETE CASCADE,
//   user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   name TEXT NOT NULL,
//   amount INT NOT NULL,
//   monthly_commitment INT NOT NULL,
//   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
// );

type Goal struct {
	ID                int       `json:"id" db:"id"`
	SpaceID           int       `json:"spaceId" db:"finance_space_id"`
	UserID            int       `json:"userId" db:"user_id"`
	Name              string    `json:"name" db:"name"`
	Amount            int       `json:"amount" db:"amount"`
	MonthlyCommitment int       `json:"monthlyCommitment" db:"monthly_commitment"`
	CreatedAt         time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt         time.Time `json:"updatedAt" db:"updated_at"`
}

type DeleteExpenseParams struct {
	ID      int `json:"id" db:"id"`
	SpaceID int `json:"spaceId" db:"finance_space_id"`
	UserID  int `json:"userId" db:"user_id"`
}
