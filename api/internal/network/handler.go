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

func (h *Handler) GetProfile(c *gin.Context) {
	user, err := h.service.GetProfile(c.Param("username"))
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	if user == nil {
		c.AbortWithStatus(http.StatusNotFound)
		return
	}

	c.JSON(http.StatusOK, user)
}
