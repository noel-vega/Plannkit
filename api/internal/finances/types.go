package finances

import (
	"time"

	"github.com/noel-vega/habits/api/internal/user"
)

const (
	RoleOwner  = "owner"
	RoleEditor = "editor"
	RoleViewer = "viewer"
)

const (
	MemberInvitePending  = "pending"
	MemberInviteAccepted = "accepted"
)

type Space struct {
	ID        int32     `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type SpaceMember struct {
	ID        int32     `json:"id" db:"id"`
	SpaceID   int32     `json:"spaceId" db:"finance_space_id"`
	UserID    int32     `json:"userId" db:"user_id"`
	Role      string    `json:"role" db:"role"`
	Status    string    `json:"status" db:"status"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type SpaceWithMembership struct {
	Space
	Membership SpaceMember         `json:"membership" db:"membership"`
	Owner      user.UserNoPassword `json:"owner" db:"owner"`
}

type SpaceMemberWithUser struct {
	SpaceMember
	User *user.UserNoPassword `json:"user" db:"user"`
}

type Goal struct {
	ID                 int32     `json:"id" db:"id"`
	SpaceID            int32     `json:"spaceId" db:"finance_space_id"`
	UserID             int32     `json:"userId" db:"user_id"`
	Name               string    `json:"name" db:"name"`
	Amount             int32     `json:"amount" db:"amount"`
	MonthlyCommitment  int32     `json:"monthlyCommitment" db:"monthly_commitment"`
	TotalContributions int32     `json:"totalContributions" db:"total_contributions"`
	CreatedAt          time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt          time.Time `json:"updatedAt" db:"updated_at"`
}

type UpdateGoalParams struct {
	ID                int32  `db:"id"`
	Name              string `db:"name"`
	Amount            int32  `db:"amount"`
	MonthlyCommitment int32  `db:"monthly_commitment"`
}

type GoalContribution struct {
	ID        int32     `json:"id" db:"id"`
	SpaceID   int32     `json:"spaceId" db:"finance_space_id"`
	GoalID    int32     `json:"goalId" db:"finance_space_goal_id"`
	UserID    int32     `json:"userId" db:"user_id"`
	Amount    int32     `json:"amount" db:"amount"`
	Note      *string   `json:"note" db:"note"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type Expense struct {
	ID          int32     `json:"id" db:"id"`
	SpaceID     int32     `json:"spaceId" db:"finance_space_id"`
	UserID      int32     `json:"userId" db:"user_id"`
	Name        string    `json:"name" db:"name"`
	Amount      int32     `json:"amount" db:"amount"`
	Category    *string   `json:"category" db:"category"`
	Description *string   `json:"description" db:"description"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}

type IncomeSource struct {
	ID        int32     `json:"id" db:"id"`
	SpaceID   int32     `json:"spaceId" db:"finance_space_id"`
	UserID    int32     `json:"userId" db:"user_id"`
	Name      string    `json:"name" db:"name"`
	Amount    int32     `json:"amount" db:"amount"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

// Request bodies

type InviteToSpaceBody struct {
	UserID int32  `json:"userId"`
	Role   string `json:"role"`
}

type InviteToSpaceParams struct {
	UserID          int32
	NewMemberUserID int32
	SpaceID         int32
	Role            string
}

type UpdateSpaceNameBody struct {
	Name string `json:"name"`
}

type CreateSpaceBody struct {
	Name string `json:"name"`
}

type CreateExpenseBody struct {
	Name        string  `json:"name"`
	Amount      int32   `json:"amount"`
	Category    *string `json:"category"`
	Description *string `json:"description"`
}

type CreateGoalBody struct {
	Name              string `json:"name"`
	Amount            int32  `json:"amount"`
	MonthlyCommitment int32  `json:"monthlyCommitment"`
}

type CreateGoalContributionBody struct {
	Amount int32   `json:"amount"`
	Note   *string `json:"note"`
}

type CreateIncomeSourceBody struct {
	Name   string `json:"name"`
	Amount int32  `json:"amount"`
}

// Repository params

type CreateSpaceParams struct {
	Name string `db:"name"`
}

type CreateSpaceMemberParams struct {
	UserID         int32  `db:"user_id"`
	FinanceSpaceID int32  `db:"finance_space_id"`
	Role           string `db:"role"`
	Status         string `db:"status"`
}

type SpaceMemberRelationship struct {
	UserID         int32 `db:"user_id"`
	FinanceSpaceID int32 `db:"finance_space_id"`
}

type (
	GetSpaceMemberParams    = SpaceMemberRelationship
	DeleteSpaceMemberParams = SpaceMemberRelationship
)

type UpdateSpaceMemberStatusParams struct {
	SpaceMemberRelationship
	Status string `db:"status"`
}

type UpdateSpaceNameParams struct {
	ID   int32  `db:"id"`
	Name string `db:"name"`
}

type CreateGoalParams struct {
	FinanceSpaceID    int32  `db:"finance_space_id"`
	UserID            int32  `db:"user_id"`
	Name              string `db:"name"`
	Amount            int32  `db:"amount"`
	MonthlyCommitment int32  `db:"monthly_commitment"`
}

type GoalIdent struct {
	ID             int32 `db:"id"`
	FinanceSpaceID int32 `db:"finance_space_id"`
}

type CreateGoalContributionParams struct {
	FinanceSpaceID     int32   `db:"finance_space_id"`
	FinanceSpaceGoalID int32   `db:"finance_space_goal_id"`
	UserID             int32   `db:"user_id"`
	Amount             int32   `db:"amount"`
	Note               *string `db:"note"`
}

type ListGoalContributionsParams struct {
	UserID             int32 `db:"user_id"`
	FinanceSpaceID     int32 `db:"finance_space_id"`
	FinanceSpaceGoalID int32 `db:"finance_space_goal_id"`
}

type CreateExpenseParams struct {
	FinanceSpaceID int32   `db:"finance_space_id"`
	UserID         int32   `db:"user_id"`
	Name           string  `db:"name"`
	Amount         int32   `db:"amount"`
	Category       *string `db:"category"`
	Description    *string `db:"description"`
}

type ListExpensesParams struct {
	FinanceSpaceID int32 `db:"finance_space_id"`
	UserID         int32 `db:"user_id"`
}

type CreateIncomeSourceParams struct {
	FinanceSpaceID int32  `db:"finance_space_id"`
	UserID         int32  `db:"user_id"`
	Name           string `db:"name"`
	Amount         int32  `db:"amount"`
}
