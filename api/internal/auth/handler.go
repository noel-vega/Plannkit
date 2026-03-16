// Package auth
package auth

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/noel-vega/habits/api/internal/apperrors"
	"github.com/noel-vega/habits/api/internal/finances"
	"github.com/noel-vega/habits/api/internal/httputil"
	"github.com/noel-vega/habits/api/internal/user"
)

const (
	refreshTokenMaxAge             = 60 * 60 * 24 * 7
	refreshTokenInvalidateTokenAge = -1
	emptyRefreshToken              = ""
)

type Handler struct {
	service         *Service
	userService     *user.Service
	financesService *finances.Service
}

func NewHandler(authService *Service, userService *user.Service, financesService *finances.Service) *Handler {
	return &Handler{
		service:         authService,
		financesService: financesService,
		userService:     userService,
	}
}

func (h *Handler) setCookieRefreshToken(c *gin.Context, refreshToken string, maxAge int) {
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
	data := user.CreateUserParams{}
	err := c.Bind(&data)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	hashedPassword, err := h.service.HashPassword(data.Password)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	data.Password = hashedPassword

	newUser, err := h.userService.CreateUser(data)
	if err != nil {
		if errors.Is(err, user.ErrEmailExists) {
			c.AbortWithError(http.StatusConflict, err)
			return
		}
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	tokens, err := h.service.GenerateTokenPair(newUser.ID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	_, _, err = h.financesService.CreateSpace(&finances.CreateSpaceParams{
		UserID: newUser.ID,
		Name:   "My Finances",
	})
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	h.setCookieRefreshToken(c, tokens.RefreshToken, refreshTokenMaxAge)
	authResponse := AuthResponse{
		AccessToken: tokens.AccessToken,
		Me:          newUser,
	}

	c.JSON(http.StatusOK, authResponse)
}

func (h *Handler) SignIn(c *gin.Context) {
	body := &SignInParams{}
	err := c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	u, err := h.userService.GetUserByEmailWithPassword(body.Email)
	if err != nil {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	err = h.service.ComparePassword(u.Password, body.Password)
	if err != nil {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	tokens, err := h.service.GenerateTokenPair(u.ID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	h.setCookieRefreshToken(c, tokens.RefreshToken, refreshTokenMaxAge)

	authResponse := AuthResponse{
		AccessToken: tokens.AccessToken,
		Me:          u.WithoutPassword(),
	}

	c.JSON(http.StatusOK, authResponse)
}

func (h *Handler) SignOut(c *gin.Context) {
	h.setCookieRefreshToken(c, emptyRefreshToken, refreshTokenInvalidateTokenAge)
}

func (h *Handler) RefreshAccessToken(c *gin.Context) {
	refreshTokenStr, err := c.Cookie("refresh_token")
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token: " + err.Error()})
		return
	}

	accessToken, err := h.service.RefreshAccessToken(refreshTokenStr)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accessToken": accessToken,
	})
}

func (h *Handler) GetMe(c *gin.Context) {
	me, err := h.userService.GetUserByID(httputil.UserID(c))
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			c.AbortWithStatus(http.StatusNotFound)
			return
		}
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, me)
}
