package main

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type PostgresRepository struct {
	Habits        *HabitsRepo
	Contributions *ContributionsRepo
}

func NewPostgresRepository(db *sqlx.DB) *PostgresRepository {
	return &PostgresRepository{
		Habits:        NewHabitsRepository(db),
		Contributions: NewContributionsRepo(db),
	}
}

func main() {
	db, err := sqlx.Connect("postgres", "user=habits dbname=habits password=habits sslmode=disable")
	if err != nil {
		log.Fatalln(err)
	}

	repo := NewPostgresRepository(db)

	// Create a Gin router with default middleware (logger and recovery)
	r := gin.Default()
	r.Use(cors.Default())

	// Define a simple GET endpoint
	r.GET("/ping", func(c *gin.Context) {
		// Return JSON response
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	r.GET("/habits", func(c *gin.Context) {
		// Return JSON response
		habitsWithContributions := []HabitWithContributions{}
		habits := repo.Habits.List()
		for _, habit := range habits {
			contributions, err := repo.Contributions.List(habit.ID)
			if err != nil {
				c.AbortWithError(http.StatusInternalServerError, err)
				return
			}
			habitsWithContributions = append(habitsWithContributions, HabitWithContributions{
				ID:                habit.ID,
				Name:              habit.Name,
				Description:       habit.Description,
				CompletionType:    habit.CompletionType,
				CompletionsPerDay: habit.CompletionsPerDay,
				Contributions:     contributions,
			})
		}
		c.JSON(http.StatusOK, habitsWithContributions)
	})

	r.GET("/habits/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		habit, err := repo.Habits.GetByID(id)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		contributions, err := repo.Contributions.List(habit.ID)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		habitWithContributions := HabitWithContributions{
			ID:                habit.ID,
			Name:              habit.Name,
			Description:       habit.Description,
			CompletionType:    habit.CompletionType,
			CompletionsPerDay: habit.CompletionsPerDay,
			Contributions:     contributions,
		}
		c.JSON(http.StatusOK, habitWithContributions)
	})

	r.PATCH("/habits/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		params := UpdateHabitParams{ID: id}
		c.Bind(&params)
		err = repo.Habits.Update(params)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
		}
	})

	r.POST("/habits", func(c *gin.Context) {
		var data CreateHabitParams
		c.Bind(&data)

		habit, err := repo.Habits.Create(data)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		c.JSON(http.StatusOK, HabitWithContributions{
			ID:                habit.ID,
			Description:       habit.Description,
			Name:              habit.Name,
			CompletionType:    habit.CompletionType,
			CompletionsPerDay: habit.CompletionsPerDay,
			Contributions:     []Contribution{},
		})
	})

	r.POST("/habits/:habit_id/contributions", func(c *gin.Context) {
		habitID, err := strconv.Atoi(c.Param("habit_id"))
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		params := CreateContributionParams{
			HabitID: habitID,
		}
		c.Bind(&params)
		err = repo.Contributions.Create(params)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
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
}
