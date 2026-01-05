package main

import (
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

type Habit struct {
	ID             int       `json:"id" db:"id"`
	Name           string    `json:"name" db:"name"`
	Description    string    `json:"description" db:"description"`
	CompletionType string    `json:"completionType" db:"completion_type"`
	CreatedAt      time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt      time.Time `json:"updatedAt" db:"updated_at"`
}

type HabitWithContributions struct {
	ID             int            `json:"id"`
	Name           string         `json:"name"`
	Description    string         `json:"description"`
	CompletionType string         `json:"completionType" db:"completion_type"`
	Contributions  []Contribution `json:"contributions"`
}

type CreateHabitParams struct {
	Name           string `json:"name" db:"name"`
	Description    string `json:"description" db:"description"`
	CompletionType string `json:"completionType" db:"completion_type"`
}

type HabitsRepo struct {
	db *sqlx.DB
}

func (r *HabitsRepo) GetByID(id int) (*Habit, error) {
	habit := Habit{}
	err := r.db.Get(&habit, "SELECT * FROM habits WHERE id=$1", id)
	if err != nil {
		return nil, err
	}
	return &habit, nil
}

func (r *HabitsRepo) List() []Habit {
	habits := []Habit{}
	r.db.Select(&habits, "SELECT * FROM habits")
	return habits
}

func (r *HabitsRepo) Create(params CreateHabitParams) (*Habit, error) {
	query := `
        INSERT INTO habits (name, description, completion_type) 
        VALUES ($1, $2, $3)
				RETURNING *
    `
	var habit Habit

	fmt.Printf("%+v/n", params)

	err := r.db.Get(&habit, query, params.Name, params.Description, params.CompletionType)
	if err != nil {
		return nil, err
	}

	return &habit, nil
}

func NewHabitsRepository(db *sqlx.DB) *HabitsRepo {
	return &HabitsRepo{
		db: db,
	}
}
