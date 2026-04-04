package habits

import (
	"context"
	"errors"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/db"
	"github.com/noel-vega/habits/api/internal/apperrors"
	"roci.dev/fracdex"
)

type Service struct {
	queries    *db.Queries
	repository *Repository
}

func NewService(db *sqlx.DB, queries *db.Queries) *Service {
	return &Service{
		queries:    queries,
		repository: NewRepository(db),
	}
}

func (s *Service) CreateHabit(ctx context.Context, params db.CreateHabitParams) (db.Habit, error) {
	return s.queries.CreateHabit(ctx, params)
}

func (s *Service) ListHabits(c context.Context, userID int32) ([]db.Habit, error) {
	return s.queries.ListHabits(c, userID)
}

func (s *Service) UpdateHabit(ctx context.Context, params db.UpdateHabitParams) error {
	return s.queries.UpdateHabit(ctx, params)
}

func (s *Service) DeleteHabit(ctx context.Context, params db.DeleteHabitParams) error {
	err := s.queries.DeleteHabit(ctx, params)
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrHabitNotFound
	}
	return err
}

func (s *Service) GetHabitWithContributions(ctx context.Context, params db.GetHabitParams) (*HabitWithContributions, error) {
	habit, err := s.queries.GetHabit(ctx, params)
	if err != nil {
		return nil, err
	}
	contributions, err := s.queries.ListContributions(ctx, params.UserID)
	if err != nil {
		return nil, err
	}
	return &HabitWithContributions{
		Habit:         habit,
		Contributions: contributions,
	}, nil
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

func (s *Service) CreateContribution(params *CreateContributionParams) error {
	return s.repository.CreateHabitContribution(params)
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

func (s *Service) ListHabitsWithContributions(ctx context.Context, userID int32) ([]HabitWithContributions, error) {
	habits, err := s.queries.ListHabits(ctx, userID)
	if err != nil {
		return nil, err
	}

	contributions, err := s.queries.ListContributions(ctx, userID)
	if err != nil {
		return nil, err
	}

	contributionsByHabit := make(map[int32][]db.HabitsContribution)

	for _, c := range contributions {
		contributionsByHabit[c.HabitID] = append(contributionsByHabit[c.HabitID], c)
	}

	result := make([]HabitWithContributions, len(habits))

	for i, habit := range habits {
		contribs := contributionsByHabit[habit.ID]
		if contribs == nil {
			contribs = []db.HabitsContribution{}
		}
		result[i] = HabitWithContributions{
			Habit:         habit,
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

func (s *Service) ListRoutinesWithHabits(ctx context.Context, userID int32) (*HabitGroups, error) {
	routinesList, err := s.repository.ListRoutines(userID)
	if err != nil {
		return nil, err
	}

	habitsList, err := s.ListHabitsWithContributions(ctx, userID)
	if err != nil {
		return nil, err
	}

	habits := []HabitWithContributions{}
	routines := map[int32]*RoutineWithHabits{}

	for _, routine := range routinesList {
		routines[routine.ID] = &RoutineWithHabits{
			Routine: routine,
			Habits:  []HabitWithContributions{},
		}
	}

	for _, habit := range habitsList {
		if habit.Habit.RoutineID == nil {
			habits = append(habits, habit)
		} else {
			routines[*habit.Habit.RoutineID].Habits = append(routines[*habit.Habit.RoutineID].Habits, habit)
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

func (s *Service) UpdateRoutine(params *UpdateRoutineParams) error {
	trimmedName := strings.TrimSpace(params.Name)
	if trimmedName == "" {
		return ErrValidationNameRequired
	}
	params.Name = trimmedName

	err := s.repository.UpdateRoutine(params)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrRoutineNotFound
	}
	return err
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
	ID     int   `db:"id"`
	UserID int32 `db:"user_id"`
}

func (s *Service) DeleteRoutine(params *DeleteRoutineParams) error {
	err := s.repository.DeleteRoutine(params)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrRoutineNotFound
	}
	return err
}
