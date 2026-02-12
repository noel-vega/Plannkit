package auth

import (
	"errors"

	"github.com/golang-jwt/jwt/v5"
	"github.com/noel-vega/habits/api/internal/users"
)

type AuthResposne struct {
	AccessToken string                `json:"accessToken"`
	Me          *users.UserNoPassword `json:"me"`
}

type TokenPair struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refresh_token"`
}

var ErrInvalidCredentials = errors.New("invalid email or password")

type SignInParams struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Claims struct {
	UserID int `json:"user_id"`
	jwt.RegisteredClaims
}
