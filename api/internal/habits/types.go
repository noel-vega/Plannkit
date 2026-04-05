// Package habits
package habits

import (
	"github.com/noel-vega/habits/api/db"
)

type HabitWithContributions struct {
	db.Habit
	Contributions []db.HabitsContribution `json:"contributions"`
}

type RoutineWithHabits struct {
	db.HabitsRoutine
	Habits []HabitWithContributions `json:"habits"`
}

type HabitGroups struct {
	Routines []*RoutineWithHabits     `json:"routines"`
	Habits   []HabitWithContributions `json:"habits"`
}

type UpdateHabitPositionParams struct {
	ID             int32
	UserID         int32
	RoutineID      *int32
	AfterPosition  string
	BeforePosition string
}

type UpdateRoutinePositionParams struct {
	ID             int32
	UserID         int32
	AfterPosition  string
	BeforePosition string
}
