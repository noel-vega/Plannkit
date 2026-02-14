// Package auth
package auth

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/noel-vega/habits/api/internal/users"
)

const (
	refreshTokenMaxAge             = 60 * 60 * 24 * 7
	refreshTokenInvalidateTokenAge = -1
	emptyRefreshToken              = ""
)

type Handler struct {
	AuthService *Service
}

func NewHandler(authService *Service) *Handler {
	return &Handler{
		AuthService: authService,
	}
}

func (h *Handler) SetCookieRefreshToken(c *gin.Context, refreshToken string, maxAge int) {
	c.SetCookie(
		"refresh_token",
		refreshToken,
		maxAge,
		"/",
		"",
		false,
		true,
	)
}

func (h *Handler) SignUp(c *gin.Context) {
	data := users.CreateUserParams{}
	err := c.Bind(&data)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	tokens, user, err := h.AuthService.SignUp(data)
	if err != nil {
		if errors.Is(err, users.ErrEmailExists) {
			c.AbortWithError(http.StatusConflict, err)
			return
		}
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	h.SetCookieRefreshToken(c, tokens.RefreshToken, refreshTokenMaxAge)

	authResponse := AuthResposne{
		AccessToken: tokens.AccessToken,
		Me:          user,
	}

	c.JSON(http.StatusOK, authResponse)
}

func (h *Handler) SignIn(c *gin.Context) {
	data := SignInParams{}
	c.Bind(&data)
	tokens, user, err := h.AuthService.SignIn(data)

	if errors.Is(err, ErrInvalidCredentials) {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	h.SetCookieRefreshToken(c, tokens.RefreshToken, refreshTokenMaxAge)

	authResponse := AuthResposne{
		AccessToken: tokens.AccessToken,
		Me:          user,
	}

	c.JSON(http.StatusOK, authResponse)
}

func (h *Handler) SignOut(c *gin.Context) {
	h.SetCookieRefreshToken(c, emptyRefreshToken, refreshTokenInvalidateTokenAge)
}

func (h *Handler) RefreshAccessToken(c *gin.Context) {
	refreshTokenStr, err := c.Cookie("refresh_token")
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token: " + err.Error()})
		return
	}

	accessToken, err := h.AuthService.RefreshAccessToken(refreshTokenStr)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accessToken": accessToken,
	})
}

func (h *Handler) Me(c *gin.Context) {
	refreshTokenStr, err := c.Cookie("refresh_token")
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token: " + err.Error()})
		return
	}

	refreshTokenClaims, err := h.AuthService.ValidateToken(refreshTokenStr)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token: " + err.Error()})
		return
	}

	accessToken, err := h.AuthService.RefreshAccessToken(refreshTokenStr)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token: " + err.Error()})
		return
	}

	user, err := h.AuthService.userService.GetUserByID(refreshTokenClaims.UserID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	authResponse := AuthResposne{
		AccessToken: accessToken,
		Me:          user,
	}

	c.JSON(http.StatusOK, authResponse)
}
