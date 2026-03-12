// Package server
package server

import (
	"github.com/gin-gonic/gin"
	"github.com/noel-vega/habits/api/internal/auth"
	"github.com/noel-vega/habits/api/internal/finances"
	"github.com/noel-vega/habits/api/internal/habits"
	"github.com/noel-vega/habits/api/internal/mail"
	"github.com/noel-vega/habits/api/internal/network"
	"github.com/noel-vega/habits/api/internal/todos"
	"github.com/noel-vega/habits/api/internal/user"
)

type Services struct {
	Auth     *auth.Service
	User     *user.Service
	Network  *network.Service
	Finances *finances.Service
	Todos    *todos.Service
	Habits   *habits.Service
}

func AddRoutes(router *gin.Engine, services *Services) *gin.Engine {
	authHandler := auth.NewHandler(services.Auth, services.User, services.Finances)
	habitsHandler := habits.NewHandler(services.Habits)
	todosHandler := todos.NewHandler(services.Todos)
	userHandler := user.NewHandler(services.User)
	networkHandler := network.NewHandler(services.Network)
	financesHandler := finances.NewHandler(services.Finances)

	router.GET("/flags", FlagsHandler)

	router.POST("/auth/signup", authHandler.SignUp)
	router.POST("/auth/signin", authHandler.SignIn)
	router.GET("/auth/signout", authHandler.SignOut)
	router.GET("/auth/me", authHandler.GetMe)

	protected := router.Group("/")
	protected.Use(auth.AuthenticateUser(services.Auth))

	protected.GET("/auth/refresh", authHandler.RefreshAccessToken)

	protected.GET("/network/profile/:username", networkHandler.GetUserProfile)
	protected.GET("/network/users", networkHandler.ListUsers)
	protected.POST("/network/users/:userID/follow", networkHandler.RequestFollow)
	protected.PATCH("/network/users/:userID/follow", networkHandler.AcceptFollow)
	protected.DELETE("/network/users/:userID/follow", networkHandler.RemoveFollow)
	protected.POST("/network/users/:userID/connection", networkHandler.RequestConnection)
	protected.PATCH("/network/users/:userID/connection", networkHandler.AcceptConnection)
	protected.DELETE("/network/users/:userID/connection", networkHandler.RemoveConnection)

	protected.PUT("/user/avatar", userHandler.UpdateAvatar)

	protected.GET("/finances/spaces", financesHandler.ListSpaces)
	protected.POST("/finances/spaces", financesHandler.CreateSpace)
	protected.PATCH("/finances/spaces/:spaceID/members", financesHandler.AcceptSpaceInvite)
	financeSpace := protected.Group("/finances/spaces/:spaceID").Use(finances.VerifySpaceMembership(services.Finances))
	financeSpace.DELETE("", financesHandler.DeleteSpace)
	financeSpace.POST("/members", financesHandler.InviteToSpace)
	financeSpace.GET("/members", financesHandler.ListSpaceMembers)
	financeSpace.DELETE("/members/:userID", financesHandler.DeleteSpaceMember)
	financeSpace.POST("/incomes", financesHandler.CreateIncomeSource)
	financeSpace.GET("/incomes", financesHandler.ListIncomes)
	financeSpace.DELETE("/incomes/:incomeSourceID", financesHandler.DeleteIncome)
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
