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

type ListExpensesParams struct {
	SpaceID int `json:"spaceId" db:"finance_space_id"`
	UserID  int `json:"userId" db:"user_id"`
}

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

type CreateGoalParams struct {
	SpaceID           int    `json:"spaceId" db:"finance_space_id"`
	UserID            int    `json:"userId" db:"user_id"`
	Name              string `json:"name" db:"name"`
	Amount            int    `json:"amount" db:"amount"`
	MonthlyCommitment int    `json:"monthlyCommitment" db:"monthly_commitment"`
}

type ListGoalsParams struct {
	SpaceID int `json:"spaceId" db:"finance_space_id"`
	UserID  int `json:"userId" db:"user_id"`
}

type GetGoalParams struct {
	ID      int `json:"id" db:"id"`
	SpaceID int `json:"spaceId" db:"finance_space_id"`
	UserID  int `json:"userId" db:"user_id"`
}

type GoalContribution struct {
	ID        int       `json:"id" db:"id"`
	SpaceID   int       `json:"spaceId" db:"finance_space_id"`
	GoalID    int       `json:"goalId" db:"finance_space_goal_id"`
	UserID    int       `json:"userId" db:"user_id"`
	Amount    int       `json:"amount" db:"amount"`
	Note      *string   `json:"note" db:"note"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type CreateGoalContributionParams struct {
	SpaceID int     `json:"spaceId" db:"finance_space_id"`
	GoalID  int     `json:"goalId" db:"finance_space_goal_id"`
	UserID  int     `json:"userId" db:"user_id"`
	Amount  int     `json:"amount" db:"amount"`
	Note    *string `json:"note" db:"note"`
}

type DeleteExpenseParams struct {
	ID      int `json:"id" db:"id"`
	SpaceID int `json:"spaceId" db:"finance_space_id"`
	UserID  int `json:"userId" db:"user_id"`
}
