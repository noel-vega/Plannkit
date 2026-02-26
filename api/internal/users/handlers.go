package users

import (
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	UserService *Service
}

func NewHandler(userService *Service) *Handler {
	return &Handler{
		userService,
	}
}

func (h *Handler) UpdateAvatar(c *gin.Context) {
	userID := c.MustGet("userID").(int)
	file, header, err := c.Request.FormFile("avatar")
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	defer file.Close()

	ext := filepath.Ext(header.Filename)
	filename, err := h.UserService.UpdateAvatar(userID, ext, file)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"avatar": filename,
	})
}

func (h *Handler) ListUsers(c *gin.Context) {
	queryParams := &ListUsersQueryParams{}
	err := c.BindQuery(queryParams)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &ListUsersParams{
		QueryParams: queryParams,
	}

	users, err := h.UserService.ListUsers(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, users)
}

func (h *Handler) GetUserProfile(c *gin.Context) {
	user, err := h.UserService.GetUserByUsername(c.Param("username"))
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
