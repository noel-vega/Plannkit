package habit

import (
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func AttachRoutes(r *gin.RouterGroup, db *sqlx.DB) {
	h := NewHandler(db)

	// habit routes
	r.GET("/habits", h.ListHabits)
	r.POST("/habits", h.CreateHabit)
	r.GET("/habits/:id", h.GetHabitByID)
	r.PATCH("/habits/:id", h.UpdateHabit)
	r.DELETE("/habits/:id", h.DeleteHabit)
	r.POST("/habits/:id/contributions", h.CreateHabitContribution)
	r.DELETE("/habits/contributions/:id", h.DeleteHabitContribution)
	r.PATCH("/habits/contributions/:id", h.UpdateHabitContribution)
}
