package main

import (
	"log"
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

	router := gin.Default()
	router.Use(cors.Default())

	AddRoutes(router, db)

	if err := router.Run(); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
