package network

import "errors"

var (
	ErrFollowSelf     = errors.New("cannot follow self")
	ErrUnFollowSelf   = errors.New("cannot unfollow self")
	ErrFollowExists   = errors.New("already following user")
	ErrFollowNotFound = errors.New("cannot find follow")
)
