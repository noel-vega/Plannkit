package auth

import (
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func AttachRoutes(r *gin.Engine, db *sqlx.DB) {
	h := NewHandler(db)

	r.POST("/auth/signup", h.SignUp)
	r.POST("/auth/signin", h.SignIn)
	r.GET("/auth/refresh", h.RefreshAccessToken)
	r.GET("/auth/me", h.Me)
}
