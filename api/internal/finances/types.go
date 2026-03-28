// Package finances
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
	ID        int       `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type SpaceMember struct {
	ID        int       `json:"id" db:"id"`
	SpaceID   int       `json:"spaceId" db:"finance_space_id"`
	UserID    int       `json:"userId" db:"user_id"`
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

type InviteToSpaceBody struct {
	UserID int    `json:"userId"`
	Role   string `json:"role"`
}

type InviteToSpaceParams struct {
	UserID          int
	NewMemberUserID int
	SpaceID         int
	Role            string
}

type InsertSpaceMemberParams struct {
	UserID  int    `db:"user_id"`
	SpaceID int    `db:"finance_space_id"`
	Role    string `db:"role"`
	Status  string `db:"status"`
}

type ListSpaceMembersParams struct {
	SpaceID int `json:"spaceId" db:"finance_space_id"`
}

type SpaceMemberRelationship struct {
	UserID  int `db:"user_id"`
	SpaceID int `db:"finance_space_id"`
}

type (
	GetSpaceMemberParams    = SpaceMemberRelationship
	DeleteSpaceMemberParams = SpaceMemberRelationship
)

type UpdateSpaceMemberStatus struct {
	SpaceMemberRelationship
	Status string `db:"status"`
}

type UpdateSpaceNameBody struct {
	Name string `json:"name"`
}

type UpdateSpaceNameParams struct {
	SpaceMemberRelationship
	Name string `db:"name"`
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

type CreateSpaceBody struct {
	Name string `json:"name"`
}

type CreateSpaceParams struct {
	UserID int    `json:"userId" db:"user_id"`
	Name   string `json:"name" db:"name"`
}

type CreateExpenseBody struct {
	Name        string  `json:"name"`
	Amount      int     `json:"amount"`
	Category    *string `json:"category"`
	Description *string `json:"description"`
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
	ID                 int       `json:"id" db:"id"`
	SpaceID            int       `json:"spaceId" db:"finance_space_id"`
	UserID             int       `json:"userId" db:"user_id"`
	Name               string    `json:"name" db:"name"`
	Amount             int       `json:"amount" db:"amount"`
	MonthlyCommitment  int       `json:"monthlyCommitment" db:"monthly_commitment"`
	TotalContributions int       `json:"totalContributions" db:"total_contributions"`
	CreatedAt          time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt          time.Time `json:"updatedAt" db:"updated_at"`
}

type CreateGoalBody struct {
	Name              string `json:"name"`
	Amount            int    `json:"amount"`
	MonthlyCommitment int    `json:"monthlyCommitment"`
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
}

type GetGoalParams struct {
	GoalID  int `json:"id" db:"goal_id"`
	SpaceID int `json:"spaceId" db:"finance_space_id"`
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

type ListGoalContributionsParams struct {
	UserID  int `json:"userId" db:"user_id"`
	SpaceID int `json:"spaceId" db:"finance_space_id"`
	GoalID  int `json:"goalId" db:"finance_space_goal_id"`
}

type CreateGoalContributionBody struct {
	Amount int     `json:"amount"`
	Note   *string `json:"note"`
}

type CreateGoalContributionParams struct {
	SpaceID int     `db:"finance_space_id"`
	GoalID  int     `db:"finance_space_goal_id"`
	UserID  int     `db:"user_id"`
	Amount  int     `db:"amount"`
	Note    *string `db:"note"`
}

type DeleteGoalContributionParams struct {
	ID int `db:"id"`
}

type DeleteExpenseParams struct {
	ID      int `json:"id" db:"id"`
	SpaceID int `json:"spaceId" db:"finance_space_id"`
	UserID  int `json:"userId" db:"user_id"`
}

type IncomeSource struct {
	ID        int       `json:"id" db:"id"`
	SpaceID   int       `json:"spaceId" db:"finance_space_id"`
	UserID    int       `json:"userId" db:"user_id"`
	Name      string    `json:"name" db:"name"`
	Amount    int       `json:"amount" db:"amount"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type CreateIncomeSourceBody struct {
	Name   string `json:"name"`
	Amount int    `json:"amount"`
}

type InsertIncomeSourceParams struct {
	SpaceID int    `db:"finance_space_id"`
	UserID  int    `db:"user_id"`
	Name    string `db:"name"`
	Amount  int    `db:"amount"`
}

type ListIncomeSourcesParams struct {
	SpaceID int `db:"finance_space_id"`
}

type DeleteIncomeSourceParams struct {
	ID      int `db:"id"`
	SpaceID int `db:"finance_space_id"`
}
