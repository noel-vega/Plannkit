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

func (s *Service) CreateHabit(params CreateHabitParams) (*Habit, error) {
	return s.repository.CreateHabit(&params)
}

func (s *Service) ListHabits(userID int32) ([]Habit, error) {
	return s.repository.ListHabits(userID)
}

func (s *Service) UpdateHabit(params UpdateHabitParams) error {
	return s.repository.UpdateHabit(&params)
}

func (s *Service) DeleteHabit(params DeleteHabitParams) error {
	err := s.repository.DeleteHabit(&params)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrHabitNotFound
	}
	return err
}

func (s *Service) GetHabitWithContributions(params GetHabitParams) (*HabitWithContributions, error) {
	habit, err := s.repository.GetHabit(&params)
	if err != nil {
		return nil, err
	}
	contributions, err := s.repository.ListContributions(params.UserID)
	if err != nil {
		return nil, err
	}
	return &HabitWithContributions{
		Habit:         *habit,
		Contributions: contributions,
	}, nil
}

func (s *Service) UpdateHabitPosition(params UpdateHabitPositionParams) (*Habit, error) {
	newPosition, err := fracdex.KeyBetween(params.AfterPosition, params.BeforePosition)
	if err != nil {
		return nil, err
	}

	habit, err := s.repository.UpdateHabitPosition(&UpdateHabitPositionRepoParams{
		ID:        params.ID,
		UserID:    params.UserID,
		RoutineID: params.RoutineID,
		Position:  newPosition,
	})
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, ErrHabitNotFound
		}
		return nil, err
	}

	return habit, nil
}

func (s *Service) CreateContribution(params CreateContributionParams) (*HabitContribution, error) {
	return s.repository.CreateContribution(&params)
}

func (s *Service) UpdateContributionCompletions(params UpdateContributionCompletionsParams) (*HabitContribution, error) {
	contrib, err := s.repository.UpdateContributionCompletions(&params)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, ErrContributionNotFound
		}
		return nil, err
	}
	return contrib, nil
}

func (s *Service) DeleteContribution(params DeleteContributionParams) error {
	err := s.repository.DeleteContribution(&params)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrContributionNotFound
	}
	return err
}

func (s *Service) ListHabitsWithContributions(userID int32) ([]HabitWithContributions, error) {
	habits, err := s.repository.ListHabits(userID)
	if err != nil {
		return nil, err
	}

	contributions, err := s.repository.ListContributions(userID)
	if err != nil {
		return nil, err
	}

	contributionsByHabit := make(map[int32][]HabitContribution)
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
			Habit:         habit,
			Contributions: contribs,
		}
	}

	return result, nil
}

func (s *Service) CreateRoutine(params InsertRoutineParams) (*Routine, error) {
	trimmedName := strings.TrimSpace(params.Name)
	if trimmedName == "" {
		return nil, ErrValidationNameRequired
	}
	params.Name = trimmedName

	lastRoutine, err := s.repository.GetLastRoutine(params.UserID)
	noRows := errors.Is(err, apperrors.ErrNotFound)
	if err != nil && !noRows {
		return nil, err
	}

	var position string
	if noRows {
		position, err = fracdex.KeyBetween("", "")
	} else {
		position, err = fracdex.KeyBetween(lastRoutine.Position, "")
	}
	if err != nil {
		return nil, err
	}
	params.Position = position

	routine, err := s.repository.InsertRoutine(&params)
	if err != nil {
		return nil, err
	}

	return routine, nil
}

func (s *Service) ListRoutinesWithHabits(userID int32) (HabitGroups, error) {
	routinesList, err := s.repository.ListRoutines(userID)
	if err != nil {
		return HabitGroups{}, err
	}

	habitsList, err := s.ListHabitsWithContributions(userID)
	if err != nil {
		return HabitGroups{}, err
	}

	habits := []HabitWithContributions{}
	routines := map[int32]*RoutineWithHabits{}

	for _, r := range routinesList {
		routines[r.ID] = &RoutineWithHabits{
			Routine: r,
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

	return HabitGroups{
		Routines: routineSlice,
		Habits:   habits,
	}, nil
}

func (s *Service) UpdateRoutine(params UpdateRoutineParams) (*Routine, error) {
	trimmedName := strings.TrimSpace(params.Name)
	if trimmedName == "" {
		return nil, ErrValidationNameRequired
	}
	params.Name = trimmedName

	routine, err := s.repository.UpdateRoutine(&params)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, ErrRoutineNotFound
		}
		return nil, err
	}

	return routine, nil
}

func (s *Service) UpdateRoutinePosition(params UpdateRoutinePositionParams) (*Routine, error) {
	newPosition, err := fracdex.KeyBetween(params.AfterPosition, params.BeforePosition)
	if err != nil {
		return nil, err
	}

	routine, err := s.repository.UpdateRoutinePosition(&UpdateRoutinePositionRepoParams{
		ID:       params.ID,
		UserID:   params.UserID,
		Position: newPosition,
	})
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, ErrRoutineNotFound
		}
		return nil, err
	}

	return routine, nil
}

func (s *Service) DeleteRoutine(params DeleteRoutineParams) error {
	err := s.repository.DeleteRoutine(&params)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrRoutineNotFound
	}
	return err
}
