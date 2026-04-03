package finances

import "errors"

var (
	ErrSpaceMemberNotFound        = errors.New("space member not found")
	ErrSpaceInviteAlreadyAccepted = errors.New("space invite already accepted")
	ErrSpaceInviteNotFound        = errors.New("space invite not found")
	ErrSpaceNotFound              = errors.New("space not found")
	ErrInvalidRole                = errors.New("not a valid role")
	ErrCannotDeleteOwner          = errors.New("cannot delete space owner")
	ErrValidationRequireName      = errors.New("name required")
	ErrGoalContributionNotFound   = errors.New("goal contribution not found")
	ErrValidationMaxCharacters    = errors.New("max characters")
	ErrExpenseNotFound            = errors.New("expense not found")
	ErrIncomeSourceNotFound       = errors.New("income source not found")
	ErrGoalNotFound               = errors.New("goal not found")
)
