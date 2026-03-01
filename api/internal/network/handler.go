package network

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/noel-vega/habits/api/internal/apperrors"
	"github.com/noel-vega/habits/api/internal/user"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) Discover(c *gin.Context) {
	queryParams := &user.ListUsersQueryParams{}
	err := c.BindQuery(queryParams)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &user.ListUsersParams{
		QueryParams: queryParams,
	}

	users, err := h.service.Discover(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, users)
}

func (h *Handler) GetUserProfile(c *gin.Context) {
	username := c.Param("username")

	params := &GetUserProfileParams{
		UserID:   c.MustGet("userID").(int),
		Username: username,
	}
	profile, err := h.service.GetUserProfile(params)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			c.AbortWithStatus(http.StatusNotFound)
			return
		}
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, profile)
}

func (h *Handler) FollowUser(c *gin.Context) {
	followingUserID, err := strconv.Atoi(c.Param("userID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = h.service.FollowUser(&FollowUserParams{
		UserID:          c.MustGet("userID").(int),
		FollowingUserID: followingUserID,
	})
	if err != nil {
		switch {
		case errors.Is(err, apperrors.ErrNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		case errors.Is(err, ErrFollowExists):
			c.AbortWithError(http.StatusBadRequest, err)
		case errors.Is(err, ErrFollowSelf):
			c.AbortWithError(http.StatusBadRequest, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *Handler) UnFollowUser(c *gin.Context) {
	followingUserID, err := strconv.Atoi(c.Param("userID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = h.service.UnFollowUser(&DeleteFollowParams{
		UserID:          c.MustGet("userID").(int),
		FollowingUserID: followingUserID,
	})
	if err != nil {
		switch {
		case errors.Is(err, ErrUnFollowSelf):
			c.AbortWithError(http.StatusBadRequest, err)
		case errors.Is(err, ErrFollowNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) AcceptFollow(c *gin.Context) {}
