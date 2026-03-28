package todos

import (
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/apperrors"
)

type Service struct {
	repository *Repository
}

func NewService(db *sqlx.DB) *Service {
	return &Service{
		repository: NewRepository(db),
	}
}

func (s *Service) CreateTodo(params *CreateTodoParams) error {
	return s.repository.CreateTodo(params)
}

func (s *Service) ListTodos(userID int) ([]Todo, error) {
	return s.repository.ListTodos(userID)
}

func (s *Service) GetTodo(params *GetTodoParams) (*Todo, error) {
	return s.repository.GetTodo(params)
}

func (s *Service) UpdateTodoPosition(params *UpdatePositionParams) error {
	return s.repository.UpdatePosition(params)
}

func (s *Service) DeleteTodo(params *DeleteTodoParams) error {
	err := s.repository.DeleteTodo(params)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrTodoNotFound
	}
	return err
}
