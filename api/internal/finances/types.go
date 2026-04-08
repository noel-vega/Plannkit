// Package finances
package finances

const (
	RoleOwner  = "owner"
	RoleEditor = "editor"
	RoleViewer = "viewer"
)

const (
	MemberInvitePending  = "pending"
	MemberInviteAccepted = "accepted"
)

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
