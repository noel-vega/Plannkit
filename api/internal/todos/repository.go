package todos

import (
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/apperrors"
	"roci.dev/fracdex"
)

type Repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		db: db,
	}
}

func (r *Repository) GetLast(params GetLastParams) (*Todo, error) {
	query := `
		SELECT * FROM todos
	  WHERE status = $1
	  ORDER BY position DESC
	  LIMIT 1
	`

	todo := &Todo{}
	err := r.db.Get(todo, query, params.Status)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}

	return todo, nil
}

func (r *Repository) GetTodo(params *GetTodoParams) (*Todo, error) {
	query := `
	SELECT * FROM todos WHERE id = :id AND user_id = :user_id 
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	query = r.db.Rebind(query)

	todo := &Todo{}
	err = r.db.Get(&todo, query, args...)
	if err != nil {
		return nil, err
	}
	return todo, nil
}

func (r *Repository) ListTodos(userID int32) ([]Todo, error) {
	query := `
		SELECT * FROM todos WHERE user_id = $1 ORDER BY position ASC
	`
	todos := []Todo{}
	err := r.db.Select(&todos, query, userID)
	if err != nil {
		return nil, err
	}
	return todos, nil
}

func (r *Repository) CreateTodo(params *CreateTodoParams) error {
	lastTodo, err := r.GetLast(GetLastParams{
		Status: params.Status,
	})
	if err != nil {
		if !errors.Is(err, apperrors.ErrNotFound) {
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
	_, err = r.db.NamedExec(query, params)
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) Update(params UpdateTodoParams) error {
	query := `
		UPDATE todos
	  SET name = :name, status = :status, description = :description, position = :position
	  WHERE user_id = :user_id AND id = :id
	`
	_, err := r.db.NamedExec(query, params)
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) UpdatePosition(params *UpdatePositionParams) error {
	newPosition, err := fracdex.KeyBetween(params.AfterPosition, params.BeforePosition)
	if err != nil {
		return err
	}

	query := `
		UPDATE todos
	  SET status = $1, position = $2
	  WHERE id = $3 AND user_id = $4
	`
	_, err = r.db.Exec(query, params.Status, newPosition, params.ID, params.UserID)
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) DeleteTodo(params *DeleteTodoParams) error {
	query := `
	  DELETE FROM todos
	  WHERE id = :id and user_id = :user_id
	`
	result, err := r.db.NamedExec(query, params)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}
