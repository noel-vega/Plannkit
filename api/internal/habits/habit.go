// Package habits
package habits

import (
	"time"
)

type Habit struct {
	ID                int       `json:"id" db:"id"`
	UserID            int       `json:"userId" db:"user_id"`
	Name              string    `json:"name" db:"name"`
	Icon              string    `json:"icon" db:"icon"`
	UnitOfMeasurement string    `json:"unitOfMeasurement" db:"unit_of_measurement"`
	Description       string    `json:"description" db:"description"`
	CompletionType    string    `json:"completionType" db:"completion_type"`
	CompletionsPerDay int       `json:"completionsPerDay" db:"completions_per_day"`
	CreatedAt         time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt         time.Time `json:"updatedAt" db:"updated_at"`
}

type HabitWithContributions struct {
	ID                int            `json:"id"`
	UserID            int            `json:"userId" db:"user_id"`
	Name              string         `json:"name"`
	Icon              string         `json:"icon" db:"icon"`
	UnitOfMeasurement string         `json:"unitOfMeasurement" db:"unit_of_measurement"`
	Description       string         `json:"description"`
	CompletionType    string         `json:"completionType" db:"completion_type"`
	CompletionsPerDay int            `json:"completionsPerDay" db:"completions_per_day"`
	Contributions     []Contribution `json:"contributions"`
}
