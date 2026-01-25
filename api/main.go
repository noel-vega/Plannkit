package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/noel-vega/habits/api/internal/habit"
)

type PostgresRepository struct {
	Habits        *habit.HabitRepo
	Contributions *habit.ContributionsRepo
	Todos         *TodosRepo
}

func NewPostgresRepository(db *sqlx.DB) *PostgresRepository {
	return &PostgresRepository{
		Habits:        habit.NewHabitRepo(db),
		Contributions: habit.NewContributionsRepo(db),
		Todos:         newTodosRepo(db),
	}
}

func main() {
	db, err := sqlx.Connect("postgres", "user=habits dbname=habits password=habits sslmode=disable")
	if err != nil {
		log.Fatalln(err)
	}
	Init()

	habitHandler := habit.NewHandler(db)

	repo := NewPostgresRepository(db)

	// Create a Gin router with default middleware (logger and recovery)
	r := gin.Default()
	r.Use(cors.Default())

	r.GET("/habits", habitHandler.ListHabits)
	r.POST("/habits", habitHandler.CreateHabit)

	r.GET("/habits/:id", habitHandler.GetHabitByID)
	r.PATCH("/habits/:id", habitHandler.UpdateHabit)
	r.DELETE("/habits/:id", habitHandler.DeleteHabit)

	r.POST("/habits/:habit_id/contributions", func(c *gin.Context) {
		habitID, err := strconv.Atoi(c.Param("habit_id"))
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		params := habit.CreateContributionParams{
			HabitID: habitID,
		}
		c.Bind(&params)

		if err := repo.Contributions.Create(params); err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
		}
	})

	r.PATCH("/habits/contributions/:id/completions", func(c *gin.Context) {
		fmt.Println("Update Completions")
		contributionID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		params := habit.UpdateCompletionsParams{
			ID: contributionID,
		}
		c.Bind(&params)

		fmt.Printf("%+v", params)

		if err := repo.Contributions.UpdateCompletions(params); err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
	})

	r.DELETE("/contributions/:id", func(c *gin.Context) {
		contributionID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		err = repo.Contributions.Delete(contributionID)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
	})

	// Start server on port 8080 (default)
	// Server will listen on 0.0.0.0:8080 (localhost:8080 on Windows)
	if err := r.Run(); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}

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

	r.GET("/todos", func(c *gin.Context) {
		todos, err := repo.Todos.List()
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		c.JSON(http.StatusOK, todos)
	})

	r.GET("/todos/board", func(c *gin.Context) {
		todos, err := repo.Todos.List()
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		board := map[string][]Todo{}

		for _, todo := range todos {
			todos, exists := board[todo.Status]
			if !exists {
				board[todo.Status] = []Todo{todo}
			} else {
				board[todo.Status] = append(todos, todo)
			}
		}
		c.JSON(http.StatusOK, board)
	})

	r.POST("/todos", func(c *gin.Context) {
		var todo CreateTodoParams
		err := c.Bind(&todo)
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		err = repo.Todos.Create(todo)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
	})

	r.PATCH("/todos/:id/position", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		params := UpdatePositionParams{
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
}
