// Package todos
package todos

import (
	"database/sql"
	"errors"
	"time"

	"github.com/jmoiron/sqlx"
	"roci.dev/fracdex"
)

type Todo struct {
	ID          int       `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Status      string    `json:"status" db:"status"`
	Position    string    `json:"position" db:"position"`
	Description string    `json:"description" db:"description"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}

type TodosRepo struct {
	DB *sqlx.DB
}

func NewTodosRepo(db *sqlx.DB) *TodosRepo {
	return &TodosRepo{
		DB: db,
	}
}

type GetLastParams struct {
	Status string `json:"status" db:"status"`
}

func (r *TodosRepo) GetLast(params GetLastParams) (*Todo, error) {
	query := `
		SELECT * FROM todos
	  WHERE status = $1
	  ORDER BY position DESC
	  LIMIT 1
	`

	todo := &Todo{}
	err := r.DB.Get(todo, query, params.Status)
	if err != nil {
		return nil, err
	}

	return todo, nil
}

func (r *TodosRepo) GetByID(id int) (*Todo, error) {
	query := `
		SELECT * FROM todos WHERE id = :id 
	`
	todo := &Todo{}
	err := r.DB.Get(&todo, query, id)
	if err != nil {
		return nil, err
	}
	return todo, nil
}

func (r *TodosRepo) List() ([]Todo, error) {
	query := `
		SELECT * FROM todos ORDER BY position ASC
	`
	todos := []Todo{}
	err := r.DB.Select(&todos, query)
	if err != nil {
		return nil, err
	}
	return todos, nil
}

type CreateTodoParams struct {
	Name        string `json:"name" db:"name"`
	Status      string `json:"status" db:"status"`
	Description string `json:"description" db:"description"`
	Position    string `json:"position" db:"position"`
}

func (r *TodosRepo) Create(params CreateTodoParams) error {
	lastTodo, err := r.GetLast(GetLastParams{
		Status: params.Status,
	})
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			return err
		}
	}

	var position string

	if lastTodo == nil {
		position, err = fracdex.KeyBetween("", "")
	} else {
		position, err = fracdex.KeyBetween(lastTodo.Position, "")
	}
	if err != nil {
		return err
	}

	params.Position = position

	query := `
	   INSERT INTO todos (name, status, description, position) 
	   VALUES (:name, :status, :description, :position) 
	`
	_, err = r.DB.NamedExec(query, params)
	if err != nil {
		return err
	}
	return nil
}

type UpdateTodoParams struct {
	Name        string `json:"name" db:"name"`
	Status      string `json:"status" db:"status"`
	Description string `json:"description" db:"description"`
	Position    string `json:"position" db:"position"`
}

func (r *TodosRepo) Update(params UpdateTodoParams) error {
	query := `
		UPDATE todos
	  SET name = :name, status = :status, description = :description, position = :position
	`
	_, err := r.DB.NamedExec(query, params)
	if err != nil {
		return err
	}
	return nil
}

type UpdatePositionParams struct {
	ID             int    `json:"id"`
	Status         string `json:"status"`
	AfterPosition  string `json:"afterPosition"`
	BeforePosition string `json:"beforePosition"`
}

func (r *TodosRepo) UpdatePosition(params UpdatePositionParams) error {
	newPosition, err := fracdex.KeyBetween(params.AfterPosition, params.BeforePosition)
	if err != nil {
		return err
	}

	query := `
		UPDATE todos
	  SET status = $1, position = $2
	  WHERE id = $3
	`
	_, err = r.DB.Exec(query, params.Status, newPosition, params.ID)
	if err != nil {
		return err
	}
	return nil
}

func (r *TodosRepo) Delete(id int) error {
	query := `DELETE FROM todos WHERE id = $1`
	_, err := r.DB.Exec(query, id)
	if err != nil {
		return err
	}
	return nil
}
