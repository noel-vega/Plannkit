package habits

import "github.com/jmoiron/sqlx"

type HabitRepo struct {
	db *sqlx.DB
}

func NewHabitRepo(db *sqlx.DB) *HabitRepo {
	return &HabitRepo{
		db: db,
	}
}

type CreateHabitParams struct {
	Name              string `json:"name" db:"name"`
	UserID            int    `json:"userId" db:"user_id"`
	Icon              string `json:"icon" db:"icon"`
	UnitOfMeasurement string `json:"unitOfMeasurement" db:"unit_of_measurement"`
	Description       string `json:"description" db:"description"`
	CompletionType    string `json:"completionType" db:"completion_type"`
	CompletionsPerDay int    `json:"completionsPerDay" db:"completions_per_day"`
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

func (r *HabitRepo) GetByHabitID(id int, userID int) (*Habit, error) {
	habit := Habit{}
	err := r.db.Get(&habit, "SELECT * FROM habits WHERE id=$1 AND user_id = $2", id, userID)
	if err != nil {
		return nil, err
	}
	return &habit, nil
}

func (r *HabitRepo) ListHabits(userID int) []Habit {
	habits := []Habit{}
	r.db.Select(&habits, "SELECT * FROM habits WHERE user_id = $1", userID)
	return habits
}

func (r *HabitRepo) CreateHabit(params CreateHabitParams) (*Habit, error) {
	query := `
        INSERT INTO habits (name, description, completion_type, completions_per_day, icon, user_id) 
        VALUES ($1, $2, $3, $4, $5, $6)
				RETURNING *
    `
	var habit Habit

	err := r.db.Get(&habit, query, params.Name, params.Description, params.CompletionType, params.CompletionsPerDay, params.Icon, params.UserID)
	if err != nil {
		return nil, err
	}

	return &habit, nil
}

func (r *HabitRepo) UpdateHabit(params UpdateHabitParams) error {
	query := `
		UPDATE habits 
	  SET name = :name, description = :description, completion_type = :completion_type, completions_per_day = :completions_per_day
	  WHERE ID = :id AND user_id = :user_id
	`
	_, err := r.db.NamedExec(query, params)
	if err != nil {
		return err
	}

	return nil
}

func (r *HabitRepo) DeleteHabit(ID int, userID int) error {
	query := `DELETE FROM habits WHERE id = $1 AND user_id = $2;`
	_, err := r.db.Exec(query, ID, userID)
	if err != nil {
		return err
	}
	return nil
}
