package server

import (
	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/auth"
	"github.com/noel-vega/habits/api/internal/finances"
	"github.com/noel-vega/habits/api/internal/habits"
	"github.com/noel-vega/habits/api/internal/network"
	"github.com/noel-vega/habits/api/internal/storage"
	"github.com/noel-vega/habits/api/internal/todos"
	"github.com/noel-vega/habits/api/internal/user"
)

type Services struct {
	Auth     *auth.Service
	User     *user.Service
	Network  *network.Service
	Finances *finances.Service
	Todos    *todos.Service
	Habits   *habits.Service
}

type NewServicesParams struct {
	DB          *sqlx.DB
	JwtSecret   string
	StoragePath string
}

func NewServices(params *NewServicesParams) *Services {
	storageService := storage.NewLocalStorage(params.StoragePath)
	userService := user.NewService(params.DB, storageService)
	networkService := network.NewService(params.DB, userService)
	financesService := finances.NewService(params.DB, networkService)
	todosService := todos.NewService(params.DB)
	habitsService := habits.NewService(params.DB)
	authService := auth.NewService(params.JwtSecret)

	return &Services{
		User:     userService,
		Auth:     authService,
		Network:  networkService,
		Finances: financesService,
		Todos:    todosService,
		Habits:   habitsService,
	}
}
