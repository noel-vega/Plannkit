package users

import (
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type Handler struct {
	UserService *UserService
}

func NewHandler(db *sqlx.DB) *Handler {
	return &Handler{
		NewUserService(db),
	}
}

func (handler *Handler) UpdateAvatar(c *gin.Context) {
	file, header, _ := c.Request.FormFile("avatar")
	defer file.Close()

	handler.UserService.UploadAvatar(header.Filename, file)
}
