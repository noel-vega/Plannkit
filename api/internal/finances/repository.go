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

func (r *Repository) CreateSpace()     {}
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
