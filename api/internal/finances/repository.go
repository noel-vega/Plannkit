package finances

import "github.com/jmoiron/sqlx"

type Repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		db: db,
	}
}

type CreateSpaceParams struct {
	UserID int    `json:"userId" db:"user_id"`
	Name   string `json:"name" db:"name"`
}

func (r *Repository) CreateSpace(params CreateSpaceParams) (*Space, error) {
	data := &Space{}
	query := `
	INSERT INTO 
	finance_spaces (user_id, name)
	VALUES (:user_id, :name)
	RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}

	err = r.db.Get(&data, query, args...)
	if err != nil {
		return nil, err
	}
	return data, nil
}
func (r *Repository) ListSpaces()      {}
func (r *Repository) DeleteSpaceByID() {}
func (r *Repository) GetSpaceByID()    {}

func (r *Repository) CreateIncomeSource()     {}
func (r *Repository) ListIncomeSources()      {}
func (r *Repository) DeleteIncomeSourceByID() {}
func (r *Repository) GetIncomeSourceByID()    {}

func (r *Repository) CreateGoal()     {}
func (r *Repository) ListGoals()      {}
func (r *Repository) DeleteGoalByID() {}
func (r *Repository) GetGoalByID()    {}

func (r *Repository) CreateExpense()     {}
func (r *Repository) ListExpenses()      {}
func (r *Repository) DeleteExpenseByID() {}
func (r *Repository) GetExpenseByID()    {}
