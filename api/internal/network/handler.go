package network

import (
	"net/http"

	"github.com/gin-gonic/gin"
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
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	if profile == nil {
		c.AbortWithStatus(http.StatusNotFound)
		return
	}

	c.JSON(http.StatusOK, profile)
}

func (h *Handler) Follow(c *gin.Context)       {}
func (h *Handler) UnFollow(c *gin.Context)     {}
func (h *Handler) AcceptFollow(c *gin.Context) {}
