package main

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/auth"
	"github.com/noel-vega/habits/api/internal/finances"
	"github.com/noel-vega/habits/api/internal/habits"
	"github.com/noel-vega/habits/api/internal/mail"
	"github.com/noel-vega/habits/api/internal/storage"
	"github.com/noel-vega/habits/api/internal/todos"
	"github.com/noel-vega/habits/api/internal/users"
)

func AddRoutes(router *gin.Engine, db *sqlx.DB, storageService storage.Service) *gin.Engine {
	router.GET("/health", func(c *gin.Context) {
		if err := db.Ping(); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "unhealthy", "reason": "database unreachable"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	jwtSecret := os.Getenv("JWT_SECRET")

	financesService := finances.NewService(db)
	usersService := users.NewUserService(db, storageService, financesService)
	authService := auth.NewService(db, jwtSecret, usersService)

	authHandler := auth.NewHandler(authService)
	habitsHandler := habits.NewHandler(db)
	todosHandler := todos.NewHandler(db)
	usersHandler := users.NewHandler(usersService)
	financesHandler := finances.NewHandler(financesService)

	protected := router.Group("/")
	protected.Use(Authentication(authService))

	router.GET("/flags", FlagsHandler)

	router.POST("/auth/signup", authHandler.SignUp)
	router.POST("/auth/signin", authHandler.SignIn)
	router.GET("/auth/signout", authHandler.SignOut)
	router.GET("/auth/me", authHandler.Me)
	protected.GET("/auth/refresh", authHandler.RefreshAccessToken)

	protected.PUT("/users/avatar", usersHandler.UpdateAvatar)

	protected.GET("/finances/spaces", financesHandler.ListSpaces)
	protected.POST("/finances/spaces", financesHandler.CreateSpace)
	protected.DELETE("/finances/spaces/:spaceID", financesHandler.DeleteSpace)
	protected.POST("/finances/spaces/:spaceID/goals", financesHandler.CreateGoal)
	protected.GET("/finances/spaces/:spaceID/expenses", financesHandler.ListExpenses)
	protected.POST("/finances/spaces/:spaceID/expenses", financesHandler.CreateExpense)
	protected.DELETE("/finances/spaces/:spaceID/expenses/:expenseID", financesHandler.DeleteExpense)

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
