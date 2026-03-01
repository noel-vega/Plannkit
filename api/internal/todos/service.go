package todos

import "github.com/jmoiron/sqlx"

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
	return s.repository.DeleteTodo(params)
}
