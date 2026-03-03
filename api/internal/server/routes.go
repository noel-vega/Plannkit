// Package server
package server

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/auth"
	"github.com/noel-vega/habits/api/internal/finances"
	"github.com/noel-vega/habits/api/internal/habits"
	"github.com/noel-vega/habits/api/internal/mail"
	"github.com/noel-vega/habits/api/internal/network"
	"github.com/noel-vega/habits/api/internal/storage"
	"github.com/noel-vega/habits/api/internal/todos"
	"github.com/noel-vega/habits/api/internal/user"
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
	userService := user.NewUserService(db, storageService, financesService)
	authService := auth.NewService(jwtSecret, userService)
	todosService := todos.NewService(db)
	habitsService := habits.NewService(db)
	networkService := network.NewService(db, userService)

	authHandler := auth.NewHandler(authService)
	habitsHandler := habits.NewHandler(habitsService)
	todosHandler := todos.NewHandler(todosService)
	usersHandler := user.NewHandler(userService)
	networkHandler := network.NewHandler(networkService)
	financesHandler := finances.NewHandler(financesService)

	router.GET("/flags", FlagsHandler)

	router.POST("/auth/signup", authHandler.SignUp)
	router.POST("/auth/signin", authHandler.SignIn)
	router.GET("/auth/signout", authHandler.SignOut)
	router.GET("/auth/me", authHandler.GetMe)

	protected := router.Group("/")
	protected.Use(Authentication(authService))

	protected.GET("/auth/refresh", authHandler.RefreshAccessToken)
	protected.GET("/finances/spaces", financesHandler.ListSpaces)
	protected.POST("/finances/spaces", financesHandler.CreateSpace)

	protected.GET("/network/profile/:username", networkHandler.GetUserProfile)
	protected.GET("/network/users", networkHandler.ListUsers)
	protected.POST("/network/users/:userID/follow", networkHandler.FollowUser)
	protected.DELETE("/network/users/:userID/follow", networkHandler.UnFollowUser)
	protected.PATCH("/network/users/:userID/follow", networkHandler.AcceptFollowRequest)

	protected.PUT("/user/avatar", usersHandler.UpdateAvatar)

	financeSpace := protected.Group("/finances/spaces/:spaceID").Use(VerifySpaceMembership(financesService))
	financeSpace.DELETE("", financesHandler.DeleteSpace)
	financeSpace.GET("/goals", financesHandler.ListGoals)
	financeSpace.POST("/goals", financesHandler.CreateGoal)
	financeSpace.GET("/goals/:goalID", financesHandler.GetGoal)
	financeSpace.POST("/goals/:goalID/contributions", financesHandler.CreateGoalContribution)
	financeSpace.GET("/goals/:goalID/contributions", financesHandler.ListGoalContributions)
	financeSpace.DELETE("/goals/:goalID/contributions/:contributionID", financesHandler.DeleteGoalContribution)
	financeSpace.POST("/expenses", financesHandler.CreateExpense)
	financeSpace.GET("/expenses", financesHandler.ListExpenses)
	financeSpace.DELETE("/expenses/:expenseID", financesHandler.DeleteExpense)

	protected.GET("/habits", habitsHandler.ListHabitsWithContributions)
	protected.POST("/habits", habitsHandler.CreateHabit)
	protected.GET("/habits/:habitID", habitsHandler.GetHabitWithContributions)
	protected.PATCH("/habits/:habitID", habitsHandler.UpdateHabit)
	protected.DELETE("/habits/:habitID", habitsHandler.DeleteHabit)
	protected.POST("/habits/:habitID/contributions", habitsHandler.CreateHabitContribution)
	protected.DELETE("/habits/:habitID/contributions/:contributionID", habitsHandler.DeleteHabitContribution)
	protected.PATCH("/habits/:habitID/contributions/:contributionID", habitsHandler.UpdateHabitContribution)

	protected.GET("/todos", todosHandler.ListTodos)
	protected.GET("/todos/board", todosHandler.GetTodosBoard)
	protected.POST("/todos", todosHandler.CreateTodo)
	protected.GET("/todos/:todoID", todosHandler.GetTodo)
	protected.DELETE("/todos/:todoID", todosHandler.DeleteTodo)
	protected.PATCH("/todos/:todoID/position", todosHandler.UpdateTodoPosition)

	mail.InitGoogleOAuth()
	router.GET("/auth/google/login", mail.HandleLogin)
	router.GET("/auth/google/callback", mail.HandleCallback)
	router.GET("/emails", mail.HandleListEmails)

	return router
}
