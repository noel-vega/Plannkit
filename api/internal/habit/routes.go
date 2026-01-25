package habit

import (
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func AttachRoutes(router *gin.Engine, db *sqlx.DB) {
	r := router.Group("/habits")
	h := NewHandler(db)

	// habit routes
	r.GET("/", h.ListHabits)
	r.POST("/", h.CreateHabit)
	r.GET("/:id", h.GetHabitByID)
	r.PATCH("/:id", h.UpdateHabit)
	r.DELETE("/:id", h.DeleteHabit)
	r.POST("/:id/contributions", h.CreateHabitContribution)
	r.DELETE("/contributions/:id", h.DeleteHabitContribution)
	r.PATCH("/contributions/:id", h.UpdateHabitContribution)
}
