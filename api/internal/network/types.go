// Package network
package network

import (
	"time"

	"github.com/noel-vega/habits/api/internal/user"
)

type NetworkUser struct {
	ID           int       `json:"id" db:"id"`
	Username     string    `json:"username" db:"username"`
	FirstName    string    `json:"firstName" db:"first_name"`
	LastName     string    `json:"lastName" db:"last_name"`
	Email        string    `json:"email" db:"email"`
	Avatar       *string   `json:"avatar" db:"avatar"`
	IsPrivate    bool      `json:"isPrivate" db:"is_private"`
	FollowStatus *string   `json:"followStatus" db:"follow_status"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
}

type ListUsersQueryParams struct {
	Search string `form:"search"`
	Filter string `form:"filter"`
}

type ListUsersParams struct {
	UserID      int `db:"user_id"`
	QueryParams *ListUsersQueryParams
}

type Follower struct {
	ID              int       `json:"id" db:"id"`
	UserID          int       `json:"userId" db:"user_id"`
	FollowingUserID int       `json:"followingUserId" db:"following_user_id"`
	Status          string    `json:"status" db:"status"`
	CreatedAt       time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt       time.Time `json:"updatedAt" db:"updated_at"`
}

type InsertFollowParams struct {
	UserID          int    `json:"userId" db:"user_id"`
	FollowingUserID int    `json:"followingUserId" db:"following_user_id"`
	Status          string `json:"status" db:"status"`
}

type FollowUserParams struct {
	UserID          int `json:"userId" db:"user_id"`
	FollowingUserID int `json:"followingUserId" db:"following_user_id"`
}

type DeleteFollowParams struct {
	UserID          int `json:"userId" db:"user_id"`
	FollowingUserID int `json:"followingUserId" db:"following_user_id"`
}

type AcceptFollowParams struct {
	UserID          int `json:"userId" db:"user_id"`
	FollowingUserID int `json:"followingUserId" db:"following_user_id"`
}

type GetFollowerParams struct {
	UserID          int `json:"userId" db:"user_id"`
	FollowingUserID int `json:"followingUserId" db:"following_user_id"`
}

type GetUserProfileParams struct {
	UserID   int    `db:"user_id"`
	Username string `db:"username"`
}

type UserProfile struct {
	User         *user.UserNoPassword `json:"user"`
	IsFollowing  bool                 `json:"isFollowing"`
	FollowStatus *string              `json:"followStatus"`
}
