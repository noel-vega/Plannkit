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
	owner := finances.RequireRole(finances.RoleOwner)
	editor := finances.RequireRole(finances.RoleOwner, finances.RoleEditor)
	financeSpace := protected.Group("/finances/spaces/:spaceID").Use(finances.VerifySpaceMembership(services.Finances))
	financeSpace.DELETE("", owner, financesHandler.DeleteSpace)
	financeSpace.PATCH("/name", owner, financesHandler.UpdateSpaceName)
	financeSpace.POST("/members", owner, financesHandler.InviteToSpace)
	financeSpace.DELETE("/members/:userID", owner, financesHandler.DeleteSpaceMember)
	financeSpace.POST("/incomes", editor, financesHandler.CreateIncomeSource)
	financeSpace.DELETE("/incomes/:incomeSourceID", editor, financesHandler.DeleteIncome)
	financeSpace.POST("/goals", editor, financesHandler.CreateGoal)
	financeSpace.DELETE("/goals/:goalID", editor, financesHandler.DeleteGoal)
	financeSpace.POST("/goals/:goalID/contributions", editor, financesHandler.CreateGoalContribution)
	financeSpace.DELETE("/goals/:goalID/contributions/:contributionID", editor, financesHandler.DeleteGoalContribution)
	financeSpace.DELETE("/expenses/:expenseID", editor, financesHandler.DeleteExpense)
	financeSpace.POST("/expenses", editor, financesHandler.CreateExpense)
	financeSpace.GET("/members", financesHandler.ListSpaceMembersWithUsers)
	financeSpace.GET("/incomes", financesHandler.ListIncomes)
	financeSpace.GET("/goals", financesHandler.ListGoals)
	financeSpace.GET("/goals/:goalID", financesHandler.GetGoal)
	financeSpace.PATCH("/goals/:goalID", financesHandler.UpdateGoal)
	financeSpace.GET("/goals/:goalID/contributions", financesHandler.ListGoalContributions)
	financeSpace.GET("/expenses", financesHandler.ListExpenses)

	protected.GET("/habits/routines", habitsHandler.ListRoutines)
	protected.POST("/habits/routines", habitsHandler.CreateRoutine)
	protected.PATCH("/habits/routines/:routineID", habitsHandler.UpdateRoutine)
	protected.DELETE("/habits/routines/:routineID", habitsHandler.DeleteRoutine)
	protected.PATCH("/habits/routines/:routineID/position", habitsHandler.UpdateRoutinePosition)
	protected.GET("/habits", habitsHandler.ListHabitsWithContributions)
	protected.POST("/habits", habitsHandler.CreateHabit)
	protected.DELETE("/habits/contributions/:contributionID", habitsHandler.DeleteHabitContribution)
	protected.PATCH("/habits/contributions/:contributionID", habitsHandler.UpdateHabitContribution)
	protected.GET("/habits/:habitID", habitsHandler.GetHabitWithContributions)
	protected.PATCH("/habits/:habitID", habitsHandler.UpdateHabit)
	protected.DELETE("/habits/:habitID", habitsHandler.DeleteHabit)
	protected.POST("/habits/:habitID/contributions", habitsHandler.CreateHabitContribution)

	protected.GET("/todos", todosHandler.ListTodos)
	protected.GET("/todos/board", todosHandler.GetTodosBoard)
	protected.POST("/todos", todosHandler.CreateTodo)
	protected.GET("/todos/:todoID", todosHandler.GetTodo)
	protected.DELETE("/todos/:todoID", todosHandler.DeleteTodo)
	protected.PATCH("/todos/:todoID/position", todosHandler.UpdateTodoPosition)

	return router
}
