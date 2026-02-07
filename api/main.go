package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func main() {
	db, err := sqlx.Connect("postgres", "user=habits dbname=habits password=habits sslmode=disable")
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
