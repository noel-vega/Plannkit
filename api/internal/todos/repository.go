package todos

import (
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
	"roci.dev/fracdex"
)

type TodosRepo struct {
	DB *sqlx.DB
}

func NewTodosRepo(db *sqlx.DB) *TodosRepo {
	return &TodosRepo{
		DB: db,
	}
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

func (r *TodosRepo) GetTodo(params *GetTodoParams) (*Todo, error) {
	query := `
	SELECT * FROM todos WHERE id = :id AND user_id = :user_id 
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	query = r.DB.Rebind(query)

	todo := &Todo{}
	err = r.DB.Get(&todo, query, args...)
	if err != nil {
		return nil, err
	}
	return todo, nil
}

func (r *TodosRepo) List(userID int) ([]Todo, error) {
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

func (r *TodosRepo) Create(params *CreateTodoParams) error {
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
	   INSERT INTO todos (user_id, name, status, description, position) 
		 VALUES (:user_id, :name, :status, :description, :position) 
	`
	_, err = r.DB.NamedExec(query, params)
	if err != nil {
		return err
	}
	return nil
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

func (r *TodosRepo) UpdatePosition(params *UpdatePositionParams) error {
	newPosition, err := fracdex.KeyBetween(params.AfterPosition, params.BeforePosition)
	if err != nil {
		return err
	}

	query := `
		UPDATE todos
	  SET status = $1, position = $2
	  WHERE id = $3 AND user_id = $4
	`
	_, err = r.DB.Exec(query, params.Status, newPosition, params.ID, params.UserID)
	if err != nil {
		return err
	}
	return nil
}

func (r *TodosRepo) Delete(params *DeleteTodoParams) error {
	query := `DELETE FROM todos WHERE id = :id and user_id = :user_id`
	_, err := r.DB.NamedExec(query, params)
	if err != nil {
		return err
	}
	return nil
}
