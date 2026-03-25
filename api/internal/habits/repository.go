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

func (r *Repository) GetHabit(params *GetHabitParams) (*Habit, error) {
	habit := &Habit{}
	err := r.db.Get(habit, "SELECT * FROM habits WHERE id=$1 AND user_id = $2", params.ID, params.UserID)
	if err != nil {
		return nil, err
	}

	return habit, nil
}

func (r *Repository) CreateHabit(params *CreateHabitParams) (*Habit, error) {
	query := `
        INSERT INTO habits (name, description, completion_type, completions_per_day, icon, user_id) 
        VALUES ($1, $2, $3, $4, $5, $6)
				RETURNING *
    `
	var habit Habit

	err := r.db.Get(&habit, query, params.Name, params.Description, params.CompletionType, params.CompletionsPerDay, params.Icon, params.UserID)
	if err != nil {
		return nil, err
	}

	return &habit, nil
}

func (r *Repository) ListHabits(userID int) ([]Habit, error) {
	query := `
  SELECT * 
	FROM habits 
	WHERE user_id = $1
	ORDER by position asc
	`
	habits := []Habit{}
	err := r.db.Select(&habits, query, userID)
	if err != nil {
		return nil, err
	}
	return habits, nil
}

func (r *Repository) UpdateHabit(params *UpdateHabitParams) error {
	query := `
		UPDATE habits 
	  SET name = :name, description = :description, completion_type = :completion_type, completions_per_day = :completions_per_day
	  WHERE ID = :id AND user_id = :user_id
	`
	_, err := r.db.NamedExec(query, params)
	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) DeleteHabit(params *DeleteHabitParams) error {
	query := `DELETE FROM habits WHERE id = $1 AND user_id = $2;`
	_, err := r.db.Exec(query, params.ID, params.UserID)
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) InsertRoutine(params *InsertRoutineParams) (*Routine, error) {
	query := `
		INSERT INTO
	  habits_routines (user_id, name)
	  VALUES (:user_id, :name)
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

func (r *Repository) ListContributions(userID int) ([]HabitContribution, error) {
	contributions := []HabitContribution{}
	err := r.db.Select(&contributions, "SELECT * FROM habits_contributions WHERE user_id = $1", userID)
	if err != nil {
		return nil, err
	}
	return contributions, nil
}

func (r *Repository) ListHabitContributions(params *GetHabitParams) ([]HabitContribution, error) {
	contributions := []HabitContribution{}
	err := r.db.Select(&contributions, "SELECT * FROM habits_contributions WHERE habit_id=$1 AND user_id = $2", params.ID, params.UserID)
	if err != nil {
		return nil, err
	}
	return contributions, nil
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
	WHERE user_id = :user_id AND habit_id = :habit_id AND id = :id 
	`
	_, err := r.db.NamedExec(query, params)
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) ListHabitsAndContributions(userID int) ([]Habit, []HabitContribution, error) {
	habits, err := r.ListHabits(userID)
	if err != nil {
		return nil, nil, err
	}
	contributions, err := r.ListContributions(userID)
	if err != nil {
		return nil, nil, err
	}

	return habits, contributions, nil
}

// ## Step 3: Repository — `api/internal/habits/repository.go`
//
// Add `roci.dev/fracdex`, `database/sql`, and `apperrors` imports (reference: `todos/repository.go`).
//
// **New methods:**
// - `GetLastRoutine(userID)` — SELECT last routine by position DESC LIMIT 1, return `apperrors.ErrNotFound` on no rows
// - `GetLastHabitInGroup(userID, routineID *int)` — SELECT last habit by position in a routine (or standalone when nil), return `apperrors.ErrNotFound` on no rows
// - `ListRoutines(userID)` — SELECT all routines ORDER BY position ASC
// - `UpdateHabitPosition(params)` — compute `fracdex.KeyBetween(after, before)`, UPDATE position + routine_id
// - `UpdateRoutinePosition(params)` — compute `fracdex.KeyBetween(after, before)`, UPDATE position
//
//
// CREATE TABLE IF NOT EXISTS habits_routines (
//     id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
//     user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//     name VARCHAR(255) NOT NULL,
//     position TEXT COLLATE "C" NOT NULL DEFAULT '',
//     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
// );

func (r *Repository) GetLastRoutine(userID int) (*Routine, error) {
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

func (r *Repository) ListRoutines(userID int) ([]Routine, error) {
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
