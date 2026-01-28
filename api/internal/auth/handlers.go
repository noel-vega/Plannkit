// Package auth
package auth

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/users"
)

type Handler struct {
	UserService *users.UserService
	AuthService *AuthService
}

func NewHandler(db *sqlx.DB) *Handler {
	return &Handler{
		AuthService: NewAuthService(db),
	}
}

func (h *Handler) SignUp(c *gin.Context) {
	data := users.CreateUserParams{}
	err := c.Bind(&data)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	token, err := h.AuthService.SignUp(data)
	if err != nil {
		if errors.Is(err, users.ErrEmailExists) {
			c.AbortWithError(http.StatusConflict, err)
			return
		}
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
	})
}

func (h *Handler) SignIn(c *gin.Context) {
	data := SignInParams{}
	c.Bind(&data)
	token, err := h.AuthService.SignIn(data)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.SetCookie(
		"refreshToken",     // name
		token.RefreshToken, // value
		60*60*24*7,         // maxAge (seconds) - e.g., 7 days
		"/",                // path
		"",                 // domain (empty = current domain)
		false,              // secure (HTTPS only)
		true,               // httpOnly
	)

	c.JSON(http.StatusOK, gin.H{
		"accessToken": token.AccessToken,
	})
}
