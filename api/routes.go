package main

import (
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/auth"
	"github.com/noel-vega/habits/api/internal/habits"
	"github.com/noel-vega/habits/api/internal/mail"
	"github.com/noel-vega/habits/api/internal/todos"
	"github.com/noel-vega/habits/api/internal/users"
)

func AddRoutes(router *gin.Engine, db *sqlx.DB) *gin.Engine {
	authHandler := auth.NewHandler(db)
	userHandler := users.NewHandler(db)
	habitsHandler := habits.NewHandler(db)
	todosHandler := todos.NewHandler(db)

	protected := router.Group("/")
	protected.Use(Authentication(db))

	router.POST("/auth/signup", authHandler.SignUp)
	router.POST("/auth/signin", authHandler.SignIn)
	router.GET("/auth/signout", authHandler.SignOut)

	protected.GET("/auth/refresh", authHandler.RefreshAccessToken)
	protected.GET("/auth/me", authHandler.Me)

	protected.GET("/users", userHandler.ListUsers)

	protected.GET("/habits", habitsHandler.ListHabits)
	protected.POST("/habits", habitsHandler.CreateHabit)
	protected.GET("/habits/:id", habitsHandler.GetHabitByID)
	protected.PATCH("/habits/:id", habitsHandler.UpdateHabit)
	protected.DELETE("/habits/:id", habitsHandler.DeleteHabit)
	protected.POST("/habits/:id/contributions", habitsHandler.CreateHabitContribution)
	protected.DELETE("/habits/contributions/:id", habitsHandler.DeleteHabitContribution)
	protected.PATCH("/habits/contributions/:id", habitsHandler.UpdateHabitContribution)

	protected.GET("/todos", todosHandler.ListTodos)
	protected.GET("/todos/board", todosHandler.GetTodosBoard)
	protected.POST("/todos", todosHandler.CreateTodo)
	protected.GET("/todos/:id", todosHandler.GetTodoByID)
	protected.DELETE("/todos/:id", todosHandler.DeleteTodo)
	protected.PATCH("/todos/:id/position", todosHandler.UpdateTodoPosition)

	mail.InitGoogleOAuth()
	router.GET("/auth/google/login", mail.HandleLogin)
	router.GET("/auth/google/callback", mail.HandleCallback)
	router.GET("/emails", mail.HandleListEmails)

	return router
}
