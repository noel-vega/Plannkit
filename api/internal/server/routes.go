// Package server
package server

import (
	"github.com/gin-gonic/gin"
	"github.com/noel-vega/habits/api/internal/auth"
	"github.com/noel-vega/habits/api/internal/finances"
	"github.com/noel-vega/habits/api/internal/habits"
	"github.com/noel-vega/habits/api/internal/network"
	"github.com/noel-vega/habits/api/internal/todos"
	"github.com/noel-vega/habits/api/internal/user"
)

func AddRoutes(router *gin.Engine, services *Services) *gin.Engine {
	authHandler := auth.NewHandler(services.Auth, services.User, services.Finances)
	habitsHandler := habits.NewHandler(services.Habits)
	todosHandler := todos.NewHandler(services.Todos)
	userHandler := user.NewHandler(services.User, services.Storage)
	networkHandler := network.NewHandler(services.Network)
	financesHandler := finances.NewHandler(services.Finances)

	router.GET("/flags", FlagsHandler)

	router.POST("/auth/signup", authHandler.SignUp)
	router.POST("/auth/signin", authHandler.SignIn)
	router.GET("/auth/signout", authHandler.SignOut)
	router.GET("/auth/refresh", authHandler.RefreshAccessToken)

	protected := router.Group("/")
	protected.Use(auth.AuthenticateUser(services.Auth))

	protected.GET("/auth/me", authHandler.GetMe)

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
	financeSpace.Use(finances.RequireRole(finances.RoleOwner)).DELETE("", financesHandler.DeleteSpace)
	financeSpace.Use(finances.RequireRole(finances.RoleOwner)).POST("/members", financesHandler.InviteToSpace)
	financeSpace.Use(finances.RequireRole(finances.RoleOwner)).DELETE("/members/:userID", financesHandler.DeleteSpaceMember)
	financeSpace.Use(finances.RequireRole(finances.RoleOwner, finances.RoleEditor)).POST("/incomes", financesHandler.CreateIncomeSource)
	financeSpace.Use(finances.RequireRole(finances.RoleOwner, finances.RoleEditor)).DELETE("/incomes/:incomeSourceID", financesHandler.DeleteIncome)
	financeSpace.Use(finances.RequireRole(finances.RoleOwner, finances.RoleEditor)).POST("/goals", financesHandler.CreateGoal)
	financeSpace.Use(finances.RequireRole(finances.RoleOwner, finances.RoleEditor)).POST("/goals/:goalID/contributions", financesHandler.CreateGoalContribution)
	financeSpace.Use(finances.RequireRole(finances.RoleOwner, finances.RoleEditor)).DELETE("/expenses/:expenseID", financesHandler.DeleteExpense)
	financeSpace.Use(finances.RequireRole(finances.RoleOwner, finances.RoleEditor)).POST("/expenses", financesHandler.CreateExpense)
	financeSpace.Use(finances.RequireRole(finances.RoleOwner, finances.RoleEditor)).DELETE("/goals/:goalID/contributions/:contributionID", financesHandler.DeleteGoalContribution)
	financeSpace.GET("/members", financesHandler.ListSpaceMembersWithUsers)
	financeSpace.GET("/incomes", financesHandler.ListIncomes)
	financeSpace.GET("/goals", financesHandler.ListGoals)
	financeSpace.GET("/goals/:goalID", financesHandler.GetGoal)
	financeSpace.GET("/goals/:goalID/contributions", financesHandler.ListGoalContributions)
	financeSpace.GET("/expenses", financesHandler.ListExpenses)

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

	return router
}
