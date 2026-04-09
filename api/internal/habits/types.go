package habits

import (
	"time"
)

type Habit struct {
	ID                int32     `json:"id" db:"id"`
	UserID            int32     `json:"userId" db:"user_id"`
	RoutineID         *int32    `json:"routineId" db:"routine_id"`
	Name              string    `json:"name" db:"name"`
	Description       *string   `json:"description" db:"description"`
	Icon              string    `json:"icon" db:"icon"`
	CompletionType    string    `json:"completionType" db:"completion_type"`
	CompletionsPerDay int32     `json:"completionsPerDay" db:"completions_per_day"`
	UnitOfMeasurement string    `json:"unitOfMeasurement" db:"unit_of_measurement"`
	Position          string    `json:"position" db:"position"`
	CreatedAt         time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt         time.Time `json:"updatedAt" db:"updated_at"`
}

type HabitContribution struct {
	ID          int32     `json:"id" db:"id"`
	HabitID     int32     `json:"habitId" db:"habit_id"`
	UserID      int32     `json:"userId" db:"user_id"`
	Completions int32     `json:"completions" db:"completions"`
	Date        time.Time `json:"date" db:"date"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}

type Routine struct {
	ID        int32     `json:"id" db:"id"`
	UserID    int32     `json:"userId" db:"user_id"`
	Name      string    `json:"name" db:"name"`
	Position  string    `json:"position" db:"position"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type HabitWithContributions struct {
	Habit
	Contributions []HabitContribution `json:"contributions"`
}

type RoutineWithHabits struct {
	Routine
	Habits []HabitWithContributions `json:"habits"`
}

type HabitGroups struct {
	Routines []*RoutineWithHabits     `json:"routines"`
	Habits   []HabitWithContributions `json:"habits"`
}

type CreateHabitParams struct {
	UserID            int32   `db:"user_id"`
	RoutineID         *int32  `db:"routine_id"`
	Name              string  `db:"name"`
	Icon              string  `db:"icon"`
	Description       *string `db:"description"`
	CompletionType    string  `db:"completion_type"`
	CompletionsPerDay int32   `db:"completions_per_day"`
	UnitOfMeasurement string  `db:"unit_of_measurement"`
}

type UpdateHabitParams struct {
	ID                int32   `db:"id"`
	UserID            int32   `db:"user_id"`
	Name              string  `db:"name"`
	Icon              string  `db:"icon"`
	Description       *string `db:"description"`
	CompletionType    string  `db:"completion_type"`
	CompletionsPerDay int32   `db:"completions_per_day"`
}

type GetHabitParams struct {
	ID     int32 `db:"id"`
	UserID int32 `db:"user_id"`
}

type DeleteHabitParams struct {
	ID     int32 `db:"id"`
	UserID int32 `db:"user_id"`
}

type CreateContributionParams struct {
	HabitID     int32     `db:"habit_id"`
	UserID      int32     `db:"user_id"`
	Completions int32     `db:"completions"`
	Date        time.Time `db:"date"`
}

type UpdateContributionCompletionsParams struct {
	ID          int32 `db:"id"`
	UserID      int32 `db:"user_id"`
	Completions int32 `db:"completions"`
}

type DeleteContributionParams struct {
	ID     int32 `db:"id"`
	UserID int32 `db:"user_id"`
}

type UpdateHabitPositionParams struct {
	ID             int32
	UserID         int32
	RoutineID      *int32
	AfterPosition  string
	BeforePosition string
}

type UpdateHabitPositionRepoParams struct {
	ID        int32  `db:"id"`
	UserID    int32  `db:"user_id"`
	RoutineID *int32 `db:"routine_id"`
	Position  string `db:"position"`
}

type InsertRoutineParams struct {
	UserID   int32  `db:"user_id"`
	Name     string `db:"name"`
	Position string `db:"position"`
}

type UpdateRoutineParams struct {
	ID     int32  `db:"id"`
	UserID int32  `db:"user_id"`
	Name   string `db:"name"`
}

type DeleteRoutineParams struct {
	ID     int32 `db:"id"`
	UserID int32 `db:"user_id"`
}

type UpdateRoutinePositionParams struct {
	ID             int32
	UserID         int32
	AfterPosition  string
	BeforePosition string
}

type UpdateRoutinePositionRepoParams struct {
	ID       int32  `db:"id"`
	UserID   int32  `db:"user_id"`
	Position string `db:"position"`
}
