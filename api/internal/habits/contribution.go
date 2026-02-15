// Package habits
package habits

import (
	"time"

	"github.com/jmoiron/sqlx"
)

type Contribution struct {
	ID          int       `json:"id"`
	UserID      int       `json:"userId" db:"user_id"`
	Date        time.Time `json:"date"`
	HabitID     int       `json:"habitId" db:"habit_id"`
	Compeltions int       `json:"completions" db:"completions"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}

type ContributionsRepo struct {
	db *sqlx.DB
}

func NewContributionsRepo(db *sqlx.DB) *ContributionsRepo {
	return &ContributionsRepo{
		db: db,
	}
}

type CreateContributionParams struct {
	HabitID     int       `json:"habitId" db:"habit_id"`
	UserID      int       `json:"userId" db:"user_id"`
	Compeltions int       `json:"completions" db:"completions"`
	Date        time.Time `json:"date" db:"date"`
}

type DeleteContributionParams struct {
	HabitID int       `json:"habitId" db:"habit_id"`
	UserID  int       `json:"userId" db:"user_id"`
	Date    time.Time `json:"date" db:"date"`
}

type UpdateCompletionsParams struct {
	ID          int `json:"id" db:"id"`
	UserID      int `json:"userId" db:"user_id"`
	Completions int `json:"completions" db:"completions"`
}

func (r *ContributionsRepo) List(habitID int, userID int) ([]Contribution, error) {
	contributions := []Contribution{}
	err := r.db.Select(&contributions, "SELECT * FROM habits_contributions WHERE habit_id=$1 AND user_id = $2", habitID, userID)
	if err != nil {
		return nil, err
	}
	return contributions, nil
}

func (r *ContributionsRepo) Create(params CreateContributionParams) error {
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

func (r *ContributionsRepo) UpdateCompletions(params UpdateCompletionsParams) error {
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

func (r *ContributionsRepo) Delete(id int, userID int) error {
	_, err := r.db.Exec("DELETE FROM habits_contributions WHERE id=$1 AND user_id = $2", id, userID)
	if err != nil {
		return err
	}
	return nil
}
