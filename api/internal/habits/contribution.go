// Package habits
package habits

import (
	"github.com/jmoiron/sqlx"
)

type ContributionsRepo struct {
	db *sqlx.DB
}

func NewContributionsRepo(db *sqlx.DB) *ContributionsRepo {
	return &ContributionsRepo{
		db: db,
	}
}

func (r *ContributionsRepo) List(params *GetHabitParams) ([]Contribution, error) {
	contributions := []Contribution{}
	err := r.db.Select(&contributions, "SELECT * FROM habits_contributions WHERE habit_id=$1 AND user_id = $2", params.ID, params.UserID)
	if err != nil {
		return nil, err
	}
	return contributions, nil
}

func (r *ContributionsRepo) Create(params *CreateContributionParams) error {
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

func (r *ContributionsRepo) Delete(params *DeleteContributionParams) error {
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
