package main

import (
	"time"

	"github.com/jmoiron/sqlx"
)

type Todo struct {
	ID          int       `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Status      string    `json:"status" db:"status"`
	Description string    `json:"description" db:"description"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}

type TodosRepo struct {
	DB *sqlx.DB
}

func newTodosRepo(db *sqlx.DB) *TodosRepo {
	return &TodosRepo{
		DB: db,
	}
}

func (r *TodosRepo) List() ([]Todo, error) {
	query := `
		SELECT * FROM todos
	`
	var todos []Todo
	err := r.DB.Select(todos, query)
	if err != nil {
		return nil, err
	}
	return todos, nil
}

func (r *TodosRepo) Create() {}

func (r *TodosRepo) Update() {}

func (r *TodosRepo) Delete(id int) error {
	query := `
		DELETE FROM todos WHERE id = $1
	`
	_, err := r.DB.Exec(query, id)
	if err != nil {
		return err
	}
	return nil
}
