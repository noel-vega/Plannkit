package main

import (
	"log"
	"net/http"

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

	// Create a Gin router with default middleware (logger and recovery)
	router := gin.Default()
	router.Use(cors.Default())

	// Define a simple GET endpoint
	router.GET("/ping", func(c *gin.Context) {
		// Return JSON response
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})
	habit.AttachRoutes(router, db)
	todos.AttachRoutes(router, db)

	router.GET("/auth/google/login", HandleLogin)
	router.GET("/auth/google/callback", HandleCallback)
	router.GET("/emails", HandleListEmails)

	// Start server on port 8080 (default)
	// Server will listen on 0.0.0.0:8080 (localhost:8080 on Windows)
	if err := router.Run(); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
