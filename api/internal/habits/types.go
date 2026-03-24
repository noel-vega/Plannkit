// Package habits
package habits

import "time"

type Habit struct {
	ID                int       `json:"id" db:"id"`
	UserID            int       `json:"userId" db:"user_id"`
	Name              string    `json:"name" db:"name"`
	Icon              string    `json:"icon" db:"icon"`
	RoutineID         *int      `json:"routineId" db:"routine_id"`
	UnitOfMeasurement string    `json:"unitOfMeasurement" db:"unit_of_measurement"`
	Description       string    `json:"description" db:"description"`
	CompletionType    string    `json:"completionType" db:"completion_type"`
	CompletionsPerDay int       `json:"completionsPerDay" db:"completions_per_day"`
	Position          string    `json:"position" db:"position"`
	CreatedAt         time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt         time.Time `json:"updatedAt" db:"updated_at"`
}

type HabitWithContributions struct {
	*Habit
	Contributions []HabitContribution `json:"contributions"`
}

type HabitContribution struct {
	ID          int       `json:"id"`
	UserID      int       `json:"userId" db:"user_id"`
	Date        time.Time `json:"date"`
	HabitID     int       `json:"habitId" db:"habit_id"`
	Completions int       `json:"completions" db:"completions"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}

type CreateHabitRequestBody struct {
	RoutineID         *int   `json:"routineId"`
	Name              string `json:"name"`
	Icon              string `json:"icon"`
	UnitOfMeasurement string `json:"unitOfMeasurement"`
	Description       string `json:"description"`
	CompletionType    string `json:"completionType"`
	CompletionsPerDay int    `json:"completionsPerDay"`
}

type CreateHabitParams struct {
	Name              string `json:"name" db:"name"`
	UserID            int    `json:"userId" db:"user_id"`
	RoutineID         *int   `json:"routineId" db:"routine_id"`
	Icon              string `json:"icon" db:"icon"`
	UnitOfMeasurement string `json:"unitOfMeasurement" db:"unit_of_measurement"`
	Description       string `json:"description" db:"description"`
	CompletionType    string `json:"completionType" db:"completion_type"`
	CompletionsPerDay int    `json:"completionsPerDay" db:"completions_per_day"`
}

type UpdateHabitBody struct {
	Name              string `json:"name"`
	Icon              string `json:"icon"`
	UnitOfMeasurement string `json:"unitOfMeasurement"`
	Description       string `json:"description"`
	CompletionType    string `json:"completionType"`
	CompletionsPerDay int    `json:"completionsPerDay"`
}

type UpdateHabitParams struct {
	ID                int    `json:"id" db:"id"`
	UserID            int    `json:"userId" db:"user_id"`
	Name              string `json:"name" db:"name"`
	Icon              string `json:"icon" db:"icon"`
	UnitOfMeasurement string `json:"unitOfMeasurement" db:"unit_of_measurement"`
	Description       string `json:"description" db:"description"`
	CompletionType    string `json:"completionType" db:"completion_type"`
	CompletionsPerDay int    `json:"completionsPerDay" db:"completions_per_day"`
}

type GetHabitParams struct {
	ID     int `json:"id" db:"id"`
	UserID int `json:"userId" db:"user_id"`
}

type CreateContributionBody struct {
	Completions int       `json:"completions"`
	Date        time.Time `json:"date"`
}

type CreateContributionParams struct {
	HabitID     int       `json:"habitId" db:"habit_id"`
	UserID      int       `json:"userId" db:"user_id"`
	Completions int       `json:"completions" db:"completions"`
	Date        time.Time `json:"date" db:"date"`
}

type DeleteContributionParams struct {
	ID      int `json:"id" db:"id"`
	HabitID int `json:"habitId" db:"habit_id"`
	UserID  int `json:"userId" db:"user_id"`
}

type UpdateCompletionsBody struct {
	Completions int `json:"completions"`
}

type UpdateContributionCompletionsParams struct {
	ID          int `json:"id" db:"id"`
	UserID      int `json:"userId" db:"user_id"`
	Completions int `json:"completions" db:"completions"`
}

type DeleteHabitParams struct {
	ID     int `json:"id" db:"id"`
	UserID int `json:"userId" db:"user_id"`
}

type Routine struct {
	ID        int       `json:"id" db:"id"`
	UserID    int       `json:"userId" db:"user_id"`
	Name      string    `json:"name" db:"name"`
	Position  string    `json:"position" db:"position"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type CreateRoutineBody struct {
	Name string `json:"name"`
}

type InsertRoutineParams struct {
	UserID   int    `db:"user_id"`
	Position string `db:"position"`
	Name     string `db:"name"`
}

type RoutineWithHabits struct {
	Routine
	Habits []HabitWithContributions
}

type ListRoutinesResponse struct {
	Routines []RoutineWithHabits
	Habits   []HabitWithContributions
}

type UpdateHabitPositionBody struct {
	RoutineID      *int   `json:"routineId"`
	AfterPosition  string `json:"afterPoition"`
	BeforePosition string `json:"beforePosition"`
}

type UpdateHabitPositionParams struct {
	ID        int    `db:"id"`
	RoutineID *int   `db:"routine_id"`
	Position  string `db:"position"`
}

type UpdateRoutinePositionBody struct {
	AfterPosition  string `json:"afterPosition"`
	BeforePosition string `json:"beforePosition"`
}

type UpdateRoutinePositionParams struct {
	ID       int    `db:"id"`
	Position string `db:"position"`
}
