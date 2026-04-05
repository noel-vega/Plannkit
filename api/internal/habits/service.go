package habits

import (
	"context"
	"errors"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/noel-vega/habits/api/db"
	"roci.dev/fracdex"
)

type Service struct {
	queries *db.Queries
}

func NewService(queries *db.Queries) *Service {
	return &Service{
		queries: queries,
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
	contributions, err := s.queries.ListHabitsContributions(ctx, params.UserID)
	if err != nil {
		return nil, err
	}
	return &HabitWithContributions{
		Habit:         habit,
		Contributions: contributions,
	}, nil
}

func (s *Service) UpdateHabitPosition(ctx context.Context, params UpdateHabitPositionParams) (*db.Habit, error) {
	newPosition, err := fracdex.KeyBetween(params.AfterPosition, params.BeforePosition)
	if err != nil {
		return nil, err
	}

	habit, err := s.queries.UpdateHabitPosition(ctx, db.UpdateHabitPositionParams{
		ID:        params.ID,
		RoutineID: params.RoutineID,
		UserID:    params.UserID,
		Position:  newPosition,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrHabitNotFound
		}
		return nil, err
	}

	return &habit, nil
}

func (s *Service) CreateContribution(ctx context.Context, params db.CreateHabitContributionParams) (db.HabitsContribution, error) {
	return s.queries.CreateHabitContribution(ctx, params)
}

func (s *Service) UpdateContributionCompletions(ctx context.Context, params db.UpdateHabitContributionCompletionsParams) (*db.HabitsContribution, error) {
	contrib, err := s.queries.UpdateHabitContributionCompletions(ctx, params)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrContributionNotFound
		}
		return nil, err
	}

	return &contrib, nil
}

func (s *Service) DeleteContribution(ctx context.Context, params db.DeleteHabitContributionParams) error {
	err := s.queries.DeleteHabitContribution(ctx, params)
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrContributionNotFound
	}
	return err
}

func (s *Service) ListHabitsWithContributions(ctx context.Context, userID int32) ([]HabitWithContributions, error) {
	habits, err := s.queries.ListHabits(ctx, userID)
	if err != nil {
		return nil, err
	}

	contributions, err := s.queries.ListHabitsContributions(ctx, userID)
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

func (s *Service) CreateRoutine(ctx context.Context, params db.CreateRoutineParams) (db.HabitsRoutine, error) {
	trimmedName := strings.TrimSpace(params.Name)
	if trimmedName == "" {
		return db.HabitsRoutine{}, ErrValidationNameRequired
	}
	params.Name = trimmedName

	lastRoutine, err := s.queries.GetLastRoutine(ctx, params.UserID)
	noRows := errors.Is(err, pgx.ErrNoRows)
	if err != nil && !noRows {
		return db.HabitsRoutine{}, err
	}

	var position string

	if noRows {
		position, err = fracdex.KeyBetween("", "")
	} else {
		position, err = fracdex.KeyBetween(lastRoutine.Position, "")
	}
	params.Position = position

	if err != nil {
		return db.HabitsRoutine{}, err
	}

	routine, err := s.queries.CreateRoutine(ctx, params)
	if err != nil {
		return db.HabitsRoutine{}, err
	}

	return routine, nil
}

func (s *Service) ListRoutinesWithHabits(ctx context.Context, userID int32) (HabitGroups, error) {
	routinesList, err := s.queries.ListRoutines(ctx, userID)
	if err != nil {
		return HabitGroups{}, err
	}

	habitsList, err := s.ListHabitsWithContributions(ctx, userID)
	if err != nil {
		return HabitGroups{}, err
	}

	habits := []HabitWithContributions{}
	routines := map[int32]*RoutineWithHabits{}

	for _, r := range routinesList {
		routines[r.ID] = &RoutineWithHabits{
			HabitsRoutine: r,
			Habits:        []HabitWithContributions{},
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

func (s *Service) UpdateRoutine(ctx context.Context, params db.UpdateRoutineParams) (db.HabitsRoutine, error) {
	trimmedName := strings.TrimSpace(params.Name)
	if trimmedName == "" {
		return db.HabitsRoutine{}, ErrValidationNameRequired
	}

	routine, err := s.queries.UpdateRoutine(ctx, db.UpdateRoutineParams{
		ID:     params.ID,
		UserID: params.UserID,
		Name:   trimmedName,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return db.HabitsRoutine{}, ErrRoutineNotFound
		}
		return db.HabitsRoutine{}, err
	}

	return routine, nil
}

func (s *Service) UpdateRoutinePosition(ctx context.Context, params UpdateRoutinePositionParams) (db.HabitsRoutine, error) {
	newPosition, err := fracdex.KeyBetween(params.AfterPosition, params.BeforePosition)
	if err != nil {
		return db.HabitsRoutine{}, err
	}

	routine, err := s.queries.UpdateRoutinePosition(ctx, db.UpdateRoutinePositionParams{
		ID:       params.ID,
		UserID:   params.UserID,
		Position: newPosition,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return db.HabitsRoutine{}, ErrRoutineNotFound
		}
		return db.HabitsRoutine{}, err
	}

	return routine, nil
}

func (s *Service) DeleteRoutine(ctx context.Context, params db.DeleteRoutineParams) error {
	count, err := s.queries.DeleteRoutine(ctx, params)
	if err != nil {
		return err
	}

	if count == 0 {
		return ErrRoutineNotFound
	}

	return nil
}
