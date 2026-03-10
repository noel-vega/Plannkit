package network

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/noel-vega/habits/api/internal/apperrors"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) ListUsers(c *gin.Context) {
	queryParams := &ListUsersQueryParams{}
	err := c.BindQuery(queryParams)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &ListUsersParams{
		UserID:      c.MustGet("userID").(int),
		QueryParams: queryParams,
	}

	users, err := h.service.ListUsers(params)
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

func (h *Handler) RequestFollow(c *gin.Context) {
	followingUserID, err := strconv.Atoi(c.Param("userID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = h.service.RequestFollow(&RequestFollowParams{
		FollowerUserID:  c.MustGet("userID").(int),
		FollowingUserID: followingUserID,
	})
	if err != nil {
		switch {
		case errors.Is(err, ErrUserNotFound):
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

func (h *Handler) RemoveFollow(c *gin.Context) {
	followingUserID, err := strconv.Atoi(c.Param("userID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = h.service.RemoveFollow(&RemoveFollowParams{
		FollowerUserID:  c.MustGet("userID").(int),
		FollowingUserID: followingUserID,
	})
	if err != nil {
		switch {
		case errors.Is(err, ErrUnFollowSelf):
			c.AbortWithError(http.StatusBadRequest, err)
		case errors.Is(err, apperrors.ErrNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) AcceptFollow(c *gin.Context) {
}

func (h *Handler) RequestConnection(c *gin.Context) {
	requestedByUserID := c.MustGet("userID").(int)
	targetUserID, err := strconv.Atoi(c.Param("userID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	connection, err := h.service.RequestConnection(&RequestConnectionParams{
		RequestedByUserID: requestedByUserID,
		TargerUserID:      targetUserID,
	})
	if err != nil {
		switch {
		case errors.Is(err, ErrConnectionRequestExists):
			c.AbortWithError(http.StatusConflict, err)
		case errors.Is(err, ErrConnectSelf):
			c.AbortWithError(http.StatusBadRequest, err)
		case errors.Is(err, ErrUserNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}
	c.JSON(http.StatusCreated, connection)
}

func (h *Handler) AcceptConnection(c *gin.Context) {
	user1ID := c.MustGet("userID").(int)
	user2ID, err := strconv.Atoi(c.Param("userID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = h.service.AcceptConnection(user1ID, user2ID)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			c.AbortWithError(http.StatusNotFound, err)
			return
		}
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) RemoveConnection(c *gin.Context) {
	user1ID := c.MustGet("userID").(int)
	user2ID, err := strconv.Atoi(c.Param("userID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = h.service.RemoveConnection(user1ID, user2ID)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			c.AbortWithError(http.StatusNotFound, err)
			return
		}
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}
