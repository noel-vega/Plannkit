package network

import "errors"

var (
	ErrFollowSelf                       = errors.New("cannot follow self")
	ErrUnFollowSelf                     = errors.New("cannot unfollow self")
	ErrFollowExists                     = errors.New("already following user")
	ErrFollowNotFound                   = errors.New("follow not found")
	ErrConnectionRequestExists          = errors.New("connection request already exists")
	ErrConnectSelf                      = errors.New("cannot connect with self")
	ErrConnectionNotFound               = errors.New("connection not found")
	ErrUserNotFound                     = errors.New("user does not exist")
	ErrCannotAcceptOwnConnectionRequest = errors.New("cannot accept own connection request")
)
