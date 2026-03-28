package habits

import "errors"

var (
	ErrValidationNameRequired = errors.New("name required")
	ErrRoutineNotFound        = errors.New("routine not found")
	ErrContributionNotFound   = errors.New("contribution not found")
	ErrHabitNotFound          = errors.New("habit not found")
)
