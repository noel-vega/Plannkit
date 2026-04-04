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
	return &Repository{
		db: db,
	}
}

func (r *Repository) InsertRoutine(params *InsertRoutineParams) (*Routine, error) {
	query := `
		INSERT INTO
	  habits_routines (user_id, name, position)
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

func (r *Repository) CreateHabitContribution(params *CreateContributionParams) error {
	query := `
		INSERT INTO 
		habits_contributions (habit_id, completions, date, user_id) 
		VALUES (:habit_id, :completions, :date, :user_id)
	`
	_, err := r.db.NamedExec(query, params)
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) UpdateHabitContributionCompletions(params *UpdateContributionCompletionsParams) error {
	query := `
		UPDATE habits_contributions
	  SET completions = $1 
		WHERE id = $2 AND user_id = $3;
	`
	_, err := r.db.Exec(query, params.Completions, params.ID, params.UserID)
	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) DeleteHabitContribution(params *DeleteContributionParams) error {
	query := `
	DELETE FROM habits_contributions 
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

func (r *Repository) GetLastRoutine(userID int32) (*Routine, error) {
	query := `
   SELECT *
	 FROM habits_routines
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

func (r *Repository) GetLastHabitInGroup(userID int, routineID *int) (*Habit, error) {
	query := `
   SELECT *
	 FROM habits
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

func (r *Repository) UpdateHabitPosition(params *UpdateHabitPositionRepoParams) (*Habit, error) {
	query := `
		UPDATE habits
	  SET position = :position
	  WHERE id = :id AND routine_id = :routine_id AND user_id = :user_id
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

func (r *Repository) ListRoutines(userID int32) ([]Routine, error) {
	query := `
		SELECT * 
	  FROM habits_routines
	  WHERE user_id = $1
	  ORDER by position ASC
	`
	routines := []Routine{}
	err := r.db.Select(&routines, query, userID)
	if err != nil {
		return nil, err
	}
	return routines, nil
}

func (r *Repository) UpdateRoutine(params *UpdateRoutineParams) error {
	query := `
		UPDATE habits_routines
	  SET name = :name
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

func (r *Repository) UpdateRoutinePosition(params *UpdateRoutinePositionRepoParams) (*Routine, error) {
	query := `
		UPDATE habits_routines
	  SET position = :position
	  WHERE id = :id and user_id = :user_id
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

func (r *Repository) DeleteRoutine(params *DeleteRoutineParams) error {
	query := `
		DELETE FROM habits_routines
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
