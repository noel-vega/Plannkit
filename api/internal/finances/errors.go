package finances

import "errors"

var (
	ErrSpaceMemberNotFound        = errors.New("space member not found")
	ErrSpaceInviteAlreadyAccepted = errors.New("space invite already accepted")
	ErrSpaceInviteNotFound        = errors.New("space invite not found")
	ErrNotSpaceOwner              = errors.New("not space owner")
)
