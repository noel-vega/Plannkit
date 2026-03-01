package habits

import "github.com/jmoiron/sqlx"

type Repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		db: db,
	}
}

func (r *Repository) GetHabit(params *GetHabitParams) (*Habit, error) {
	habit := Habit{}
	err := r.db.Get(&habit, "SELECT * FROM habits WHERE id=$1 AND user_id = $2", params.ID, params.UserID)
	if err != nil {
		return nil, err
	}
	return &habit, nil
}

func (r *Repository) ListHabits(userID int) ([]Habit, error) {
	habits := []Habit{}
	err := r.db.Select(&habits, "SELECT * FROM habits WHERE user_id = $1", userID)
	if err != nil {
		return nil, err
	}
	return habits, nil
}

func (r *Repository) CreateHabit(params *CreateHabitParams) (*Habit, error) {
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

func (r *Repository) UpdateHabit(params *UpdateHabitParams) error {
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

func (r *Repository) DeleteHabit(params *DeleteHabitParams) error {
	query := `DELETE FROM habits WHERE id = $1 AND user_id = $2;`
	_, err := r.db.Exec(query, params.ID, params.UserID)
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) ListContributions(params *GetHabitParams) ([]Contribution, error) {
	contributions := []Contribution{}
	err := r.db.Select(&contributions, "SELECT * FROM habits_contributions WHERE habit_id=$1 AND user_id = $2", params.ID, params.UserID)
	if err != nil {
		return nil, err
	}
	return contributions, nil
}

func (r *Repository) CreateContribution(params *CreateContributionParams) error {
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

func (r *Repository) UpdateContributionCompletions(params *UpdateContributionCompletionsParams) error {
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

func (r *Repository) DeleteContribution(params *DeleteContributionParams) error {
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
