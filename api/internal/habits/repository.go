package habits

import (
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/apperrors"
)

type Repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreateHabit(params *CreateHabitParams) (*Habit, error) {
	query := `
		INSERT INTO habits (user_id, routine_id, name, icon, description, completion_type, completions_per_day)
		VALUES (:user_id, :routine_id, :name, :icon, :description, :completion_type, :completions_per_day)
		RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	habit := &Habit{}
	err = r.db.Get(habit, r.db.Rebind(query), args...)
	if err != nil {
		return nil, err
	}
	return habit, nil
}

func (r *Repository) ListHabits(userID int32) ([]Habit, error) {
	query := `SELECT * FROM habits WHERE user_id = $1 ORDER BY position ASC`
	habits := []Habit{}
	err := r.db.Select(&habits, query, userID)
	if err != nil {
		return nil, err
	}
	return habits, nil
}

func (r *Repository) GetHabit(params *GetHabitParams) (*Habit, error) {
	query := `SELECT * FROM habits WHERE id = :id AND user_id = :user_id`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	habit := &Habit{}
	err = r.db.Get(habit, r.db.Rebind(query), args...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}
	return habit, nil
}

func (r *Repository) UpdateHabit(params *UpdateHabitParams) error {
	query := `
		UPDATE habits
		SET name = :name, icon = :icon, description = :description,
		    completion_type = :completion_type, completions_per_day = :completions_per_day
		WHERE id = :id AND user_id = :user_id
	`
	result, err := r.db.NamedExec(query, params)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *Repository) DeleteHabit(params *DeleteHabitParams) error {
	query := `DELETE FROM habits WHERE id = :id AND user_id = :user_id`
	result, err := r.db.NamedExec(query, params)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *Repository) UpdateHabitPosition(params *UpdateHabitPositionRepoParams) (*Habit, error) {
	query := `
		UPDATE habits
		SET position = :position, routine_id = :routine_id
		WHERE id = :id AND user_id = :user_id
		RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	habit := &Habit{}
	err = r.db.Get(habit, r.db.Rebind(query), args...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}
	return habit, nil
}

func (r *Repository) GetLastRoutineHabit(userID int32, routineID *int32) (*Habit, error) {
	query := `
		SELECT * FROM habits
		WHERE user_id = $1 AND routine_id = $2
		ORDER BY position DESC
		LIMIT 1
	`
	habit := &Habit{}
	err := r.db.Get(habit, query, userID, routineID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}
	return habit, nil
}

func (r *Repository) CreateContribution(params *CreateContributionParams) (*HabitContribution, error) {
	query := `
		INSERT INTO habits_contributions (habit_id, user_id, completions, date)
		VALUES (:habit_id, :user_id, :completions, :date)
		RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	contrib := &HabitContribution{}
	err = r.db.Get(contrib, r.db.Rebind(query), args...)
	if err != nil {
		return nil, err
	}
	return contrib, nil
}

func (r *Repository) ListContributions(userID int32) ([]HabitContribution, error) {
	query := `SELECT * FROM habits_contributions WHERE user_id = $1`
	contribs := []HabitContribution{}
	err := r.db.Select(&contribs, query, userID)
	if err != nil {
		return nil, err
	}
	return contribs, nil
}

func (r *Repository) UpdateContributionCompletions(params *UpdateContributionCompletionsParams) (*HabitContribution, error) {
	query := `
		UPDATE habits_contributions
		SET completions = :completions
		WHERE id = :id AND user_id = :user_id
		RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	contrib := &HabitContribution{}
	err = r.db.Get(contrib, r.db.Rebind(query), args...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}
	return contrib, nil
}

func (r *Repository) DeleteContribution(params *DeleteContributionParams) error {
	query := `DELETE FROM habits_contributions WHERE id = :id AND user_id = :user_id`
	result, err := r.db.NamedExec(query, params)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *Repository) InsertRoutine(params *InsertRoutineParams) (*Routine, error) {
	query := `
		INSERT INTO habits_routines (user_id, name, position)
		VALUES (:user_id, :name, :position)
		RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	routine := &Routine{}
	err = r.db.Get(routine, r.db.Rebind(query), args...)
	if err != nil {
		return nil, err
	}
	return routine, nil
}

func (r *Repository) ListRoutines(userID int32) ([]Routine, error) {
	query := `SELECT * FROM habits_routines WHERE user_id = $1 ORDER BY position ASC`
	routines := []Routine{}
	err := r.db.Select(&routines, query, userID)
	if err != nil {
		return nil, err
	}
	return routines, nil
}

func (r *Repository) GetLastRoutine(userID int32) (*Routine, error) {
	query := `
		SELECT * FROM habits_routines
		WHERE user_id = $1
		ORDER BY position DESC
		LIMIT 1
	`
	routine := &Routine{}
	err := r.db.Get(routine, query, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}
	return routine, nil
}

func (r *Repository) UpdateRoutine(params *UpdateRoutineParams) (*Routine, error) {
	query := `
		UPDATE habits_routines
		SET name = :name
		WHERE id = :id AND user_id = :user_id
		RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	routine := &Routine{}
	err = r.db.Get(routine, r.db.Rebind(query), args...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}
	return routine, nil
}

func (r *Repository) UpdateRoutinePosition(params *UpdateRoutinePositionRepoParams) (*Routine, error) {
	query := `
		UPDATE habits_routines
		SET position = :position
		WHERE id = :id AND user_id = :user_id
		RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	routine := &Routine{}
	err = r.db.Get(routine, r.db.Rebind(query), args...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}
	return routine, nil
}

func (r *Repository) DeleteRoutine(params *DeleteRoutineParams) error {
	query := `DELETE FROM habits_routines WHERE id = :id AND user_id = :user_id`
	result, err := r.db.NamedExec(query, params)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}
