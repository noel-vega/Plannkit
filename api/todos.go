package main

import "github.com/jmoiron/sqlx"

type TodosRepo struct {
	DB *sqlx.DB
}

func newTodosRepo(db *sqlx.DB) *TodosRepo {
	return &TodosRepo{
		DB: db,
	}
}
