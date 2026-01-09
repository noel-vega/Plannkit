package main

import (
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

type Contribution struct {
	ID          int       `json:"id"`
	Date        time.Time `json:"date"`
	HabitID     int       `json:"habitId" db:"habit_id"`
	Compeltions int       `json:"completions" db:"completions"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}

type ContributionsRepo struct {
	db *sqlx.DB
}

type CreateContributionParams struct {
	HabitID     int       `json:"habitId" db:"habit_id"`
	Compeltions int       `json:"completions" db:"completions"`
	Date        time.Time `json:"date" db:"date"`
}

type DeleteContributionParams struct {
	HabitID int       `json:"habitId" db:"habit_id"`
	Date    time.Time `json:"date" db:"date"`
}

func (r *ContributionsRepo) List(habitID int) ([]Contribution, error) {
	contributions := []Contribution{}
	fmt.Println("finding contributions for habit_id", habitID)
	err := r.db.Select(&contributions, "SELECT * FROM contributions WHERE habit_id=$1", habitID)
	if err != nil {
		return nil, err
	}
	return contributions, nil
}

func (r *ContributionsRepo) Create(params CreateContributionParams) error {
	query := "INSERT INTO contributions (habit_id, completions, date) VALUES (:habit_id, :completions, :date)"
	_, err := r.db.NamedExec(query, params)
	if err != nil {
		return err
	}
	return nil
}

func (r *ContributionsRepo) Delete(id int) error {
	_, err := r.db.Exec("DELETE FROM contributions WHERE id=$1", id)
	if err != nil {
		return err
	}
	return nil
}

func NewContributionsRepo(db *sqlx.DB) *ContributionsRepo {
	return &ContributionsRepo{
		db: db,
	}
}
