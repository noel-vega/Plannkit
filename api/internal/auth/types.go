package auth

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/noel-vega/habits/api/internal/user"
)

type AuthResponse struct {
	AccessToken string               `json:"accessToken"`
	Me          *user.UserNoPassword `json:"me"`
}

type TokenPair struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refresh_token"`
}

type SignInParams struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Claims struct {
	UserID int32 `json:"userID"`
	jwt.RegisteredClaims
}
