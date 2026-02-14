package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/noel-vega/habits/api/internal/storage"
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

	// Serve the avatars directory under /avatars URL path
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{allowOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	storageBasePath := os.Getenv("STORAGE_BASE_PATH")
	router.Static("/public", storageBasePath)
	storageService := storage.NewLocalStorage(storageBasePath)

	AddRoutes(router, db, storageService)

	if err := router.Run(); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
