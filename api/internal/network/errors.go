package network

import "errors"

var (
	ErrFollowSelf              = errors.New("cannot follow self")
	ErrUnFollowSelf            = errors.New("cannot unfollow self")
	ErrFollowExists            = errors.New("already following user")
	ErrConnectionRequestExists = errors.New("connection request already exists")
	ErrConnectSelf             = errors.New("cannot connect with self")
)
