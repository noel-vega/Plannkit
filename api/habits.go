package main

import (
	"time"

	"github.com/jmoiron/sqlx"
)

type Habit struct {
	ID                int       `json:"id" db:"id"`
	Name              string    `json:"name" db:"name"`
	Description       string    `json:"description" db:"description"`
	CompletionType    string    `json:"completionType" db:"completion_type"`
	CompletionsPerDay int       `json:"completionsPerDay" db:"completions_per_day"`
	CreatedAt         time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt         time.Time `json:"updatedAt" db:"updated_at"`
}

type HabitWithContributions struct {
	ID                int            `json:"id"`
	Name              string         `json:"name"`
	Description       string         `json:"description"`
	CompletionType    string         `json:"completionType" db:"completion_type"`
	CompletionsPerDay int            `json:"completionsPerDay" db:"completions_per_day"`
	Contributions     []Contribution `json:"contributions"`
}

type CreateHabitParams struct {
	Name              string `json:"name" db:"name"`
	Description       string `json:"description" db:"description"`
	CompletionType    string `json:"completionType" db:"completion_type"`
	CompletionsPerDay int    `json:"completionsPerDay" db:"completions_per_day"`
}

type UpdateHabitParams struct {
	ID                int    `json:"id" db:"id"`
	Name              string `json:"name" db:"name"`
	Description       string `json:"description" db:"description"`
	CompletionType    string `json:"completionType" db:"completion_type"`
	CompletionsPerDay int    `json:"completionsPerDay" db:"completions_per_day"`
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
        INSERT INTO habits (name, description, completion_type, completions_per_day) 
        VALUES ($1, $2, $3, $4)
				RETURNING *
    `
	var habit Habit

	err := r.db.Get(&habit, query, params.Name, params.Description, params.CompletionType, params.CompletionsPerDay)
	if err != nil {
		return nil, err
	}

	return &habit, nil
}

func (r *HabitsRepo) Update(params UpdateHabitParams) error {
	query := `
		UPDATE habits 
	  SET name = :name, description = :description, completion_type = :completion_type, completions_per_day = :completions_per_day
	  WHERE ID = :id 
	`
	_, err := r.db.NamedExec(query, params)
	if err != nil {
		return err
	}

	return nil
}

func NewHabitsRepository(db *sqlx.DB) *HabitsRepo {
	return &HabitsRepo{
		db: db,
	}
}
