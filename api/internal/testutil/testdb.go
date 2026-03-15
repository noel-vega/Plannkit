package testutil

import (
	"context"
	"fmt"
	"path/filepath"
	"runtime"
	"time"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

func MigrationsPath() string {
	_, filename, _, _ := runtime.Caller(0)
	return filepath.Join(filepath.Dir(filename), "..", "..", "..", "db", "migrations")
}

func SetupTestDB() (*sqlx.DB, func()) {
	ctx := context.Background()

	pgContainer, err := postgres.Run(ctx,
		"postgres:16-alpine",
		postgres.WithDatabase("testdb"),
		postgres.WithUsername("test"),
		postgres.WithPassword("test"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(30*time.Second),
		),
	)
	if err != nil {
		panic(fmt.Sprintf("failed to start postgres container: %s", err))
	}

	connStr, err := pgContainer.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		panic(fmt.Sprintf("failed to get connection string: %s", err))
	}

	db, err := sqlx.Connect("postgres", connStr)
	if err != nil {
		panic(fmt.Sprintf("failed to connect to database: %s", err))
	}

	m, err := migrate.New("file://"+MigrationsPath(), connStr)
	if err != nil {
		panic(fmt.Sprintf("failed to create migrate instance: %s", err))
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		panic(fmt.Sprintf("failed to run migrations: %s", err))
	}

	cleanup := func() {
		db.Close()
		pgContainer.Terminate(ctx)
	}

	return db, cleanup
}

func TruncateAll(db *sqlx.DB) {
	tables := []string{"users"}
	for _, table := range tables {
		db.MustExec(fmt.Sprintf("TRUNCATE TABLE %s CASCADE", table))
	}
}
