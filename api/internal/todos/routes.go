package todos

import (
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func AttachRoutes(r *gin.RouterGroup, db *sqlx.DB) {
	h := NewHandler(db)

	r.GET("/todos", h.ListTodos)
	r.GET("/todos/board", h.GetTodosBoard)
	r.POST("/todos", h.CreateTodo)
	r.GET("/todos/:id", h.GetTodoByID)
	r.DELETE("/todos/:id", h.DeleteTodo)
	r.PATCH("/todos/:id/position", h.UpdateTodoPosition)
}
