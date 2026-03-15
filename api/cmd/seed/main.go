package main

import (
	"log"
	"os"

	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/noel-vega/habits/api/internal/server"
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

	if err := db.Ping(); err != nil {
		panic("Failed to connect to database")
	}

	services := server.NewServices(&server.NewServicesParams{
		DB:          db,
		JwtSecret:   "DUMMY_SECRET",
		StoragePath: "./plannkit",
	})

	seeder := NewSeeder(services)
	if err := seeder.ResetDB(); err != nil {
		log.Fatalf("failed to reset database: %v", err)
	}

	testUser := seeder.SeedTestUser()
	users := seeder.SeedUsers(50)
	seeder.SeedConnections(testUser, users, 20)
}
