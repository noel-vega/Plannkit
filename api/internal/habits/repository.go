package habits

import (
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/db"
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

func (r *Repository) GetLastHabitInGroup(userID int, routineID *int) (*db.Habit, error) {
	query := `
   SELECT *
	 FROM habits
	 WHERE user_id = $1 AND routine_id = $2
	 ORDER BY position DESC
	 LIMIT 1
	`
	habit := &db.Habit{}
	err := r.db.Get(habit, query, userID, routineID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}
	return habit, nil
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
