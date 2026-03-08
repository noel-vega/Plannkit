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

type GetUserProfileParams struct {
	UserID   int    `db:"user_id"`
	Username string `db:"username"`
}

type UserProfile struct {
	User       *user.UserNoPassword `json:"user"`
	Follow     *Follow              `json:"follow"`
	Connection *Connection          `json:"connection"`
}

type Follow struct {
	ID              int       `json:"id" db:"id"`
	FollowerUserID  int       `json:"followerUserId" db:"follower_user_id"`
	FollowingUserID int       `json:"followingUserId" db:"following_user_id"`
	Status          string    `json:"status" db:"status"`
	CreatedAt       time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt       time.Time `json:"updatedAt" db:"updated_at"`
}

type InsertFollowParams struct {
	FollowerUserID  int    `json:"followerUserId" db:"follower_user_id"`
	FollowingUserID int    `json:"followingUserId" db:"following_user_id"`
	Status          string `json:"status" db:"status"`
}

type RequestFollowParams struct {
	FollowerUserID  int `json:"followerUserId" db:"follower_user_id"`
	FollowingUserID int `json:"followingUserId" db:"following_user_id"`
}

type RemoveFollowParams struct {
	FollowerUserID  int `json:"followerUserId" db:"follower_user_id"`
	FollowingUserID int `json:"followingUserId" db:"following_user_id"`
}

type AcceptFollowParams struct {
	FollowerUserID  int `json:"followerUserId" db:"follower_user_id"`
	FollowingUserID int `json:"followingUserId" db:"following_user_id"`
}

type GetFollowerParams struct {
	FollowerUserID  int `json:"followerUserId" db:"follower_user_id"`
	FollowingUserID int `json:"followingUserId" db:"following_user_id"`
}

type Connection struct {
	ID                int       `json:"id" db:"id"`
	User1ID           int       `json:"user1Id" db:"user_1_id"`
	User2ID           int       `json:"user2Id" db:"user_2_id"`
	RequestedByUserID int       `json:"requestedByUserId" db:"requested_by_user_id"`
	Status            string    `json:"status" db:"status"`
	CreatedAt         time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt         time.Time `json:"updatedAt" db:"updated_at"`
}

type RequestConnectionParams struct {
	RequestedByUserID int
	TargerUserID      int
}

type InsertConnectionParams struct {
	User1ID           int `db:"user_1_id"`
	User2ID           int `db:"user_2_id"`
	RequestedByUserID int `db:"requested_by_user_id"`
}

type AcceptConnectionParams struct {
	ID int `json:"id" db:"id"`
}
