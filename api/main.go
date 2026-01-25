package main

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/noel-vega/habits/api/internal/habit"
	"github.com/noel-vega/habits/api/internal/todos"
)

type PostgresRepository struct {
	Habits        *habit.HabitRepo
	Contributions *habit.ContributionsRepo
	Todos         *todos.TodosRepo
}

func NewPostgresRepository(db *sqlx.DB) *PostgresRepository {
	return &PostgresRepository{
		Habits:        habit.NewHabitRepo(db),
		Contributions: habit.NewContributionsRepo(db),
		Todos:         todos.NewTodosRepo(db),
	}
}

func main() {
	db, err := sqlx.Connect("postgres", "user=habits dbname=habits password=habits sslmode=disable")
	if err != nil {
		log.Fatalln(err)
	}
	Init()

	habitHandler := habit.NewHandler(db)
	todosHandler := todos.NewHandler(db)

	repo := NewPostgresRepository(db)

	// Create a Gin router with default middleware (logger and recovery)
	r := gin.Default()
	r.Use(cors.Default())

	// habit routes
	r.GET("/habits", habitHandler.ListHabits)
	r.POST("/habits", habitHandler.CreateHabit)
	r.GET("/habits/:id", habitHandler.GetHabitByID)
	r.PATCH("/habits/:id", habitHandler.UpdateHabit)
	r.DELETE("/habits/:id", habitHandler.DeleteHabit)
	r.POST("/habits/:id/contributions", habitHandler.CreateHabitContribution)
	r.DELETE("/habits/contributions/:id", habitHandler.DeleteHabitContribution)
	r.PATCH("/habits/contributions/:id", habitHandler.UpdateHabitContribution)

	r.GET("/auth/google/login", HandleLogin)
	r.GET("/auth/google/callback", HandleCallback)
	r.GET("/emails", HandleListEmails)

	// Define a simple GET endpoint
	r.GET("/ping", func(c *gin.Context) {
		// Return JSON response
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	r.GET("/todos", todosHandler.ListTodos)
	r.GET("/todos/board", todosHandler.GetTodosBoard)
	r.POST("/todos", todosHandler.CreateTodo)

	r.PATCH("/todos/:id/position", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		params := todos.UpdatePositionParams{
			ID: id,
		}
		c.Bind(&params)

		err = repo.Todos.UpdatePosition(params)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
	})

	r.DELETE("/todos/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		err = repo.Todos.Delete(id)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
	})

	r.GET("/todos/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		todo, err := repo.Todos.GetByID(id)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		c.JSON(http.StatusOK, todo)
	})

	// Start server on port 8080 (default)
	// Server will listen on 0.0.0.0:8080 (localhost:8080 on Windows)
	if err := r.Run(); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
