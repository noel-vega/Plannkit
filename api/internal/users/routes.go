package users

import (
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func AttachRoutes(r *gin.RouterGroup, db *sqlx.DB) {
	h := NewHandler(db)

	r.GET("/users", h.ListUsers)
}
