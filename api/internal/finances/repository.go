package finances

import (
	"fmt"

	"github.com/jmoiron/sqlx"
)

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

func (r *Repository) CreateSpace(params *CreateSpaceParams) (*Space, error) {
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

	query = r.db.Rebind(query)

	err = r.db.Get(data, query, args...)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (r *Repository) CreateSpaceMembership(userID, spaceID int) error {
	query := `
		INSERT INTO 
		finance_spaces_members (user_id, finance_space_id)
	  VALUES ($1, $2)
	`
	_, err := r.db.Exec(query, userID, spaceID)
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) ListSpaceMemberships(userID int) ([]SpaceMember, error) {
	data := []SpaceMember{}
	query := `
		SELECT * FROM finance_spaces_members WHERE user_id = $1
	`
	err := r.db.Select(&data, query, userID)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (r *Repository) ListSpaces(userID int) ([]Space, error) {
	memberships, err := r.ListSpaceMemberships(userID)
	if err != nil {
		return nil, err
	}

	fmt.Printf("UserID '%v' has %v memberships", userID, len(memberships))

	spaces := []Space{}
	for _, membership := range memberships {
		fmt.Printf("Membbership | %+v", membership)
		space := Space{}
		query := `SELECT * FROM finance_spaces WHERE user_id = $1 AND id = $2`
		err := r.db.Get(&space, query, userID, membership.SpaceID)
		if err != nil {
			return nil, err
		}
		spaces = append(spaces, space)
	}
	return spaces, nil
}

func (r *Repository) DeleteSpaceByID(userID, spaceID int) error {
	query := `DELETE FROM finance_spaces WHERE user_id = $1 AND id = $2`
	_, err := r.db.Exec(query, userID, spaceID)
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) GetSpaceByID(userID, spaceID int) (*Space, error) {
	data := &Space{}
	query := `SELECT * FROM finance_spaces WHERE user_id = $1 AND id = $2`
	err := r.db.Get(data, query, userID, spaceID)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (r *Repository) CreateIncomeSource()     {}
func (r *Repository) ListIncomeSources()      {}
func (r *Repository) DeleteIncomeSourceByID() {}
func (r *Repository) GetIncomeSourceByID()    {}

func (r *Repository) CreateGoal(params *CreateGoalParams) (*Goal, error) {
	query := `
		INSERT INTO 
	    finance_spaces_goals (user_id, finance_space_id, name, amount, monthly_commitment)
	  VALUES (:user_id, :finance_space_id, :name, :amount, :monthly_commitment)
	  RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	query = r.db.Rebind(query)

	goal := &Goal{}
	err = r.db.Get(goal, query, args...)
	if err != nil {
		return nil, err
	}
	return goal, nil
}

func (r *Repository) ListGoals(params *ListGoalsParams) ([]Goal, error) {
	query := `
		SELECT * 
	  FROM finance_spaces_goals 
	  WHERE user_id = :user_id AND finance_space_id = :finance_space_id
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	query = r.db.Rebind(query)

	data := []Goal{}
	err = r.db.Select(&data, query, args...)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (r *Repository) DeleteGoalByID() {}
func (r *Repository) GetGoalByID()    {}

func (r *Repository) CreateExpense(params *CreateExpenseParams) (*Expense, error) {
	data := &Expense{}
	query := `
		INSERT INTO 
	    finance_spaces_expenses (finance_space_id, user_id, name, amount, category, description)
	  VALUES (:finance_space_id, :user_id, :name, :amount, :category, :description)
	  RETURNING *
	`

	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}

	query = r.db.Rebind(query)

	err = r.db.Get(data, query, args...)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (r *Repository) ListExpenses(params *ListExpensesParams) ([]Expense, error) {
	data := []Expense{}
	query := `
	SELECT * 
	FROM finance_spaces_expenses
	WHERE user_id = :user_id AND finance_space_id = :finance_space_id`

	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	query = r.db.Rebind(query)
	err = r.db.Select(&data, query, args...)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (r *Repository) DeleteExpense(params *DeleteExpenseParams) error {
	query := `
    DELETE FROM finance_spaces_expenses
	  WHERE user_id = :user_id AND finance_space_id = :finance_space_id AND id = :id
	`
	_, err := r.db.NamedExec(query, params)
	if err != nil {
		return err
	}
	return nil
}
