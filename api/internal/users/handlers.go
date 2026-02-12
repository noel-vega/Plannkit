package users

import (
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
	file, header, _ := c.Request.FormFile("avatar")
	defer file.Close()

	handler.UserService.UploadAvatar(header.Filename, file)
}
