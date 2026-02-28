package habits

import "github.com/jmoiron/sqlx"

type Service struct {
	db sqlx.DB
}

func NewService(db sqlx.DB) *Service {
	return &Service{
		db: db,
	}
}

func (s *Service) CreateHabit()             {}
func (s *Service) ListHabits()              {}
func (s *Service) GetHabit()                {}
func (s *Service) UpdateHabit()             {}
func (s *Service) DeleteHabit()             {}
func (s *Service) CreateHabitContribution() {}
func (s *Service) UpdateHabitContribution() {}
func (s *Service) DeleteHabitContribution() {}
