package auth

import "github.com/noel-vega/habits/api/internal/users"

type AuthResposne struct {
	AccessToken string                `json:"accessToken"`
	Me          *users.UserNoPassword `json:"me"`
}
