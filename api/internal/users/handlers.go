package users

import (
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type Handler struct {
	UserRepo *UserRepo
}

func NewHandler(db *sqlx.DB) *Handler {
	return &Handler{
		NewUserRepo(db),
	}
}

func (handler *Handler) ListUsers(c *gin.Context) {
}
