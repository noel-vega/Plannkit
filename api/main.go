package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	postgresConnectionString := os.Getenv("POSTGRES_CONNECTION_STRING")
	db, err := sqlx.Connect("postgres", postgresConnectionString)
	if err != nil {
		log.Fatalln(err)
	}

	allowOrigin := os.Getenv("ALLOW_ORIGIN")

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{allowOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	router.GET("/health", func(c *gin.Context) {
		if err := db.Ping(); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "unhealthy", "reason": "database unreachable"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	AddRoutes(router, db)

	if err := router.Run(); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
