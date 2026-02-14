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

func (handler *Handler) UpdateAvatar(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	file, header, err := c.Request.FormFile("avatar")
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	defer file.Close()

	ext := filepath.Ext(header.Filename)
	filename, err := handler.UserService.UpdateAvatar(userID, ext, file)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"avatar": filename,
	})
}
