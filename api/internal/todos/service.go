package todos

import "github.com/jmoiron/sqlx"

type Service struct {
	db sqlx.DB
}

func NewService(db sqlx.DB) *Service {
	return &Service{
		db: db,
	}
}

func (s *Service) CreateTodo() {}

func (s *Service) ListTodos() {}

func (s *Service) GetTodo() {}

func (s *Service) UpdateTodoPosition() {}

func (s *Service) DeleteTodo() {}

func (s *Service) GetTodosBoard() {}
