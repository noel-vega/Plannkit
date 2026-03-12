package network

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/noel-vega/habits/api/internal/apperrors"
	"github.com/noel-vega/habits/api/internal/httputil"
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
		UserID:      httputil.UserID(c),
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
		UserID:   httputil.UserID(c),
		Username: username,
	}
	profile, err := h.service.GetUserProfile(params)
	if err != nil {
		switch {
		case errors.Is(err, apperrors.ErrNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
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
		FollowerUserID:  httputil.UserID(c),
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
		FollowerUserID:  httputil.UserID(c),
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
	followerUserID, err := strconv.Atoi(c.Param("userID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	params := &AcceptFollowParams{
		FollowingUserID: httputil.UserID(c),
		FollowerUserID:  followerUserID,
	}

	err = h.service.AcceptFollow(params)
	if err != nil {
		switch {
		case errors.Is(err, ErrFollowNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) RequestConnection(c *gin.Context) {
	requestedByUserID := httputil.UserID(c)
	targetUserID, err := strconv.Atoi(c.Param("userID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	connection, err := h.service.RequestConnection(&RequestConnectionParams{
		RequestedByUserID: requestedByUserID,
		TargetUserID:      targetUserID,
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
	user1ID := httputil.UserID(c)
	user2ID, err := strconv.Atoi(c.Param("userID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &AcceptConnectionParams{
		AcceptedByUserID:  user1ID,
		RequestedByUserID: user2ID,
	}

	err = h.service.AcceptConnection(params)
	if err != nil {
		switch {
		case errors.Is(err, ErrConnectionNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		case errors.Is(err, ErrCannotAcceptOwnConnectionRequest):
			c.AbortWithError(http.StatusForbidden, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) RemoveConnection(c *gin.Context) {
	user1ID := httputil.UserID(c)
	user2ID, err := strconv.Atoi(c.Param("userID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = h.service.RemoveConnection(user1ID, user2ID)
	if err != nil {
		switch {
		case errors.Is(err, ErrConnectionNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}

	c.Status(http.StatusNoContent)
}
