package habits

import "github.com/jmoiron/sqlx"

type Service struct {
	repository *Repository
}

func NewService(db *sqlx.DB) *Service {
	return &Service{
		repository: NewRepository(db),
	}
}

func (s *Service) CreateHabit(params *CreateHabitParams) (*Habit, error) {
	return s.repository.CreateHabit(params)
}

func (s *Service) ListHabits(userID int) ([]Habit, error) {
	return s.repository.ListHabits(userID)
}

func (s *Service) GetHabit(params *GetHabitParams) (*Habit, error) {
	return s.repository.GetHabit(params)
}

func (s *Service) UpdateHabit(params *UpdateHabitParams) error {
	return s.repository.UpdateHabit(params)
}

func (s *Service) DeleteHabit(params *DeleteHabitParams) error {
	return s.repository.DeleteHabit(params)
}

func (s *Service) CreateContribution(params *CreateContributionParams) error {
	return s.repository.CreateContribution(params)
}

func (s *Service) ListContributions(params *GetHabitParams) ([]Contribution, error) {
	return s.repository.ListContributions(params)
}

func (s *Service) UpdateContributionCompletions(params *UpdateContributionCompletionsParams) error {
	return s.repository.UpdateContributionCompletions(params)
}

func (s *Service) DeleteContribution(params *DeleteContributionParams) error {
	return s.repository.DeleteContribution(params)
}
