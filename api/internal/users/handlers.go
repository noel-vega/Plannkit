package users

import (
	"net/http"

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
	file, header, err := c.Request.FormFile("avatar")
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	defer file.Close()

	_, err = handler.UserService.UploadAvatar(header.Filename, file)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
}
