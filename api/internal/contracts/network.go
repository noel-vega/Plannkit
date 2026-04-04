// Package contracts
package contracts

import "errors"

var ErrNotConnected = errors.New("users are not connected")

type ConnectionChecker interface {
	AreConnected(userA, userB int32) (bool, error)
}
