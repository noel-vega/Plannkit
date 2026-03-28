package habits

import (
	"errors"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/apperrors"
	"roci.dev/fracdex"
)

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
	habit, err := s.repository.GetHabit(params)
	if err != nil {
		return nil, err
	}
	contributions, err := s.repository.ListHabitContributions(params)
	if err != nil {
		return nil, err
	}
	return &HabitWithContributions{
		Habit:         habit,
		Contributions: contributions,
	}, nil
}

func (s *Service) UpdateHabit(params *UpdateHabitParams) error {
	return s.repository.UpdateHabit(params)
}

func (s *Service) UpdateHabitPosition(params *UpdateHabitPositionParams) (*Habit, error) {
	newPosition, err := fracdex.KeyBetween(params.AfterPosition, params.BeforePosition)
	if err != nil {
		return nil, err
	}

	return s.repository.UpdateHabitPosition(&UpdateHabitPositionRepoParams{
		ID:        params.ID,
		RoutineID: params.RoutineID,
		Position:  newPosition,
	})
}

func (s *Service) DeleteHabit(params *DeleteHabitParams) error {
	err := s.repository.DeleteHabit(params)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrHabitNotFound
	}
	return err
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
	err := s.repository.DeleteHabitContribution(params)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrContributionNotFound
	}
	return err
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

	for i, habit := range habits {
		contribs := contributionsByHabit[habit.ID]
		if contribs == nil {
			contribs = []HabitContribution{}
		}
		result[i] = HabitWithContributions{
			Habit:         &habit,
			Contributions: contribs,
		}
	}

	return result, nil
}

func (s *Service) CreateRoutine(params *InsertRoutineParams) (*Routine, error) {
	trimmedName := strings.TrimSpace(params.Name)
	if trimmedName == "" {
		return nil, ErrValidationNameRequired
	}
	params.Name = trimmedName

	lastRoutine, err := s.repository.GetLastRoutine(params.UserID)
	if err != nil {
		if !errors.Is(err, apperrors.ErrNotFound) {
			return nil, err
		}
	}

	var position string

	if lastRoutine == nil {
		position, err = fracdex.KeyBetween("", "")
	} else {
		position, err = fracdex.KeyBetween(lastRoutine.Position, "")
	}

	if err != nil {
		return nil, err
	}

	params.Position = position
	return s.repository.InsertRoutine(params)
}

func (s *Service) ListRoutinesWithHabits(userID int) (*HabitGroups, error) {
	routinesList, err := s.repository.ListRoutines(userID)
	if err != nil {
		return nil, err
	}

	habitsList, err := s.ListHabitsWithContributions(userID)
	if err != nil {
		return nil, err
	}

	habits := []HabitWithContributions{}
	routines := map[int]*RoutineWithHabits{}

	for _, routine := range routinesList {
		routines[routine.ID] = &RoutineWithHabits{
			Routine: routine,
			Habits:  []HabitWithContributions{},
		}
	}

	for _, habit := range habitsList {
		if habit.RoutineID == nil {
			habits = append(habits, habit)
		} else {
			routines[*habit.RoutineID].Habits = append(routines[*habit.RoutineID].Habits, habit)
		}
	}

	routineSlice := make([]*RoutineWithHabits, 0, len(routinesList))
	for _, routine := range routinesList {
		routineSlice = append(routineSlice, routines[routine.ID])
	}

	return &HabitGroups{
		Routines: routineSlice,
		Habits:   habits,
	}, nil
}

func (s *Service) UpdateRoutinePosition(params *UpdateRoutinePositionParams) (*Routine, error) {
	newPosition, err := fracdex.KeyBetween(params.AfterPosition, params.BeforePosition)
	if err != nil {
		return nil, err
	}

	return s.repository.UpdateRoutinePosition(&UpdateRoutinePositionRepoParams{
		ID:       params.ID,
		Position: newPosition,
	})
}

type DeleteRoutineParams struct {
	ID     int `db:"id"`
	UserID int `db:"user_id"`
}

func (s *Service) DeleteRoutine(params *DeleteRoutineParams) error {
	err := s.repository.DeleteRoutine(params)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrRoutineNotFound
	}
	return err
}
