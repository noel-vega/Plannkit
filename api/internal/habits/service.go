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

func (s *Service) GetHabitWithContributions(params *GetHabitParams) (*HabitWithContributions, error) {
	h, err := s.repository.GetHabit(params)
	if err != nil {
		return nil, err
	}
	contributions, err := s.repository.ListHabitContributions(params)
	if err != nil {
		return nil, err
	}
	return &HabitWithContributions{
		ID:                h.ID,
		Name:              h.Name,
		Icon:              h.Icon,
		Description:       h.Description,
		CompletionType:    h.CompletionType,
		CompletionsPerDay: h.CompletionsPerDay,
		Contributions:     contributions,
	}, nil
}

func (s *Service) UpdateHabit(params *UpdateHabitParams) error {
	return s.repository.UpdateHabit(params)
}

func (s *Service) DeleteHabit(params *DeleteHabitParams) error {
	return s.repository.DeleteHabit(params)
}

func (s *Service) CreateContribution(params *CreateContributionParams) error {
	return s.repository.CreateHabitContribution(params)
}

func (s *Service) ListContributions(userID int) ([]HabitContribution, error) {
	return s.repository.ListContributions(userID)
}

func (s *Service) UpdateContributionCompletions(params *UpdateContributionCompletionsParams) error {
	return s.repository.UpdateHabitContributionCompletions(params)
}

func (s *Service) DeleteContribution(params *DeleteContributionParams) error {
	return s.repository.DeleteHabitContribution(params)
}

func (s *Service) ListHabitContributions(params *GetHabitParams) ([]HabitContribution, error) {
	return s.repository.ListHabitContributions(params)
}

func (s *Service) ListHabitsWithContributions(userID int) ([]HabitWithContributions, error) {
	habits, contributions, err := s.repository.ListHabitsAndContributions(userID)
	if err != nil {
		return nil, err
	}

	contributionsByHabit := make(map[int][]HabitContribution)

	for _, c := range contributions {
		contributionsByHabit[c.HabitID] = append(contributionsByHabit[c.HabitID], c)
	}

	result := make([]HabitWithContributions, len(habits))

	for i, h := range habits {
		contribs := contributionsByHabit[h.ID]
		if contribs == nil {
			contribs = []HabitContribution{}
		}
		result[i] = HabitWithContributions{
			ID:                h.ID,
			Name:              h.Name,
			Icon:              h.Icon,
			Description:       h.Description,
			CompletionType:    h.CompletionType,
			CompletionsPerDay: h.CompletionsPerDay,
			Contributions:     contribs,
		}
	}

	return result, nil
}

func (s *Service) CreateRoutine(params *InsertRoutineParams) (*Routine, error) {
	return s.repository.InsertRoutine(params)
}
