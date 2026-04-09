package finances

import (
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/apperrors"
)

type Repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreateSpace(params *CreateSpaceParams) (*Space, error) {
	query := `
		INSERT INTO finance_spaces (name)
		VALUES (:name)
		RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	space := &Space{}
	err = r.db.Get(space, r.db.Rebind(query), args...)
	if err != nil {
		return nil, err
	}
	return space, nil
}

func (r *Repository) GetSpace(spaceID int32) (*Space, error) {
	query := `SELECT * FROM finance_spaces WHERE id = $1`
	space := &Space{}
	err := r.db.Get(space, query, spaceID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}
	return space, nil
}

func (r *Repository) ListSpaces(userID int32) ([]SpaceWithMembership, error) {
	query := `
		SELECT
		  s.*,
		  m.id AS "membership.id",
		  m.finance_space_id AS "membership.finance_space_id",
		  m.user_id AS "membership.user_id",
		  m.role AS "membership.role",
		  m.status AS "membership.status",
		  m.created_at AS "membership.created_at",
		  m.updated_at AS "membership.updated_at",
		  u.id AS "owner.id",
		  u.username AS "owner.username",
		  u.first_name AS "owner.first_name",
		  u.last_name AS "owner.last_name",
		  u.email AS "owner.email",
		  u.is_private AS "owner.is_private",
		  u.avatar AS "owner.avatar",
		  u.created_at AS "owner.created_at",
		  u.updated_at AS "owner.updated_at"
		FROM finance_spaces s
		JOIN finance_spaces_members m ON m.finance_space_id = s.id AND m.user_id = $1
		JOIN finance_spaces_members om ON om.finance_space_id = s.id AND om.role = 'owner'
		JOIN users u ON u.id = om.user_id
	`
	spaces := []SpaceWithMembership{}
	err := r.db.Select(&spaces, query, userID)
	if err != nil {
		return nil, err
	}
	return spaces, nil
}

func (r *Repository) DeleteSpace(spaceID int32) error {
	query := `DELETE FROM finance_spaces WHERE id = $1`
	result, err := r.db.Exec(query, spaceID)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *Repository) UpdateSpaceName(params *UpdateSpaceNameParams) error {
	query := `
		UPDATE finance_spaces
		SET name = :name
		WHERE id = :id
	`
	result, err := r.db.NamedExec(query, params)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

// Members

func (r *Repository) CreateSpaceMember(params *CreateSpaceMemberParams) (*SpaceMember, error) {
	query := `
		INSERT INTO finance_spaces_members (user_id, finance_space_id, role, status)
		VALUES (:user_id, :finance_space_id, :role, :status)
		RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	member := &SpaceMember{}
	err = r.db.Get(member, r.db.Rebind(query), args...)
	if err != nil {
		return nil, err
	}
	return member, nil
}

func (r *Repository) GetSpaceMember(params *GetSpaceMemberParams) (*SpaceMember, error) {
	query := `
		SELECT * FROM finance_spaces_members
		WHERE user_id = :user_id AND finance_space_id = :finance_space_id
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	member := &SpaceMember{}
	err = r.db.Get(member, r.db.Rebind(query), args...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}
	return member, nil
}

func (r *Repository) ListSpaceMembers(spaceID int32) ([]SpaceMember, error) {
	query := `SELECT * FROM finance_spaces_members WHERE finance_space_id = $1`
	members := []SpaceMember{}
	err := r.db.Select(&members, query, spaceID)
	if err != nil {
		return nil, err
	}
	return members, nil
}

func (r *Repository) ListSpaceMembersWithUsers(spaceID int32) ([]SpaceMemberWithUser, error) {
	query := `
		SELECT
		  m.*,
		  u.id         AS "user.id",
		  u.username   AS "user.username",
		  u.first_name AS "user.first_name",
		  u.last_name  AS "user.last_name",
		  u.email      AS "user.email",
		  u.is_private AS "user.is_private",
		  u.avatar     AS "user.avatar",
		  u.created_at AS "user.created_at",
		  u.updated_at AS "user.updated_at"
		FROM finance_spaces_members m
		JOIN users u ON m.user_id = u.id
		WHERE m.finance_space_id = $1
	`
	members := []SpaceMemberWithUser{}
	err := r.db.Select(&members, query, spaceID)
	if err != nil {
		return nil, err
	}
	return members, nil
}

func (r *Repository) DeleteSpaceMember(params *DeleteSpaceMemberParams) error {
	query := `
		DELETE FROM finance_spaces_members
		WHERE user_id = :user_id AND finance_space_id = :finance_space_id
	`
	result, err := r.db.NamedExec(query, params)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *Repository) UpdateSpaceMemberStatus(params *UpdateSpaceMemberStatusParams) (*SpaceMember, error) {
	query := `
		UPDATE finance_spaces_members
		SET status = :status
		WHERE user_id = :user_id AND finance_space_id = :finance_space_id
		RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	member := &SpaceMember{}
	err = r.db.Get(member, r.db.Rebind(query), args...)
	if err != nil {
		return nil, err
	}
	return member, nil
}

// Goals

func (r *Repository) CreateGoal(params *CreateGoalParams) (*Goal, error) {
	query := `
		INSERT INTO finance_spaces_goals (user_id, finance_space_id, name, amount, monthly_commitment)
		VALUES (:user_id, :finance_space_id, :name, :amount, :monthly_commitment)
		RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	goal := &Goal{}
	err = r.db.Get(goal, r.db.Rebind(query), args...)
	if err != nil {
		return nil, err
	}
	return goal, nil
}

func (r *Repository) ListGoals(spaceID int32) ([]Goal, error) {
	query := `
		SELECT g.*, COALESCE(SUM(c.amount), 0) AS total_contributions
		FROM finance_spaces_goals g
		LEFT JOIN finance_spaces_goals_contributions c ON c.finance_space_goal_id = g.id
		WHERE g.finance_space_id = $1
		GROUP BY g.id
	`
	goals := []Goal{}
	err := r.db.Select(&goals, query, spaceID)
	if err != nil {
		return nil, err
	}
	return goals, nil
}

func (r *Repository) GetGoal(params *GoalIdent) (*Goal, error) {
	query := `
		SELECT g.*, COALESCE(SUM(c.amount), 0) AS total_contributions
		FROM finance_spaces_goals g
		LEFT JOIN finance_spaces_goals_contributions c ON c.finance_space_goal_id = g.id
		WHERE g.finance_space_id = :finance_space_id AND g.id = :id
		GROUP BY g.id
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	goal := &Goal{}
	err = r.db.Get(goal, r.db.Rebind(query), args...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}
	return goal, nil
}

func (r *Repository) DeleteGoal(params *GoalIdent) error {
	query := `
		DELETE FROM finance_spaces_goals
		WHERE id = :id AND finance_space_id = :finance_space_id
	`
	result, err := r.db.NamedExec(query, params)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

// Goal Contributions

func (r *Repository) CreateGoalContribution(params *CreateGoalContributionParams) (*GoalContribution, error) {
	query := `
		INSERT INTO finance_spaces_goals_contributions (finance_space_id, finance_space_goal_id, user_id, amount, note)
		VALUES (:finance_space_id, :finance_space_goal_id, :user_id, :amount, :note)
		RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	contrib := &GoalContribution{}
	err = r.db.Get(contrib, r.db.Rebind(query), args...)
	if err != nil {
		return nil, err
	}
	return contrib, nil
}

func (r *Repository) ListGoalContributions(params *ListGoalContributionsParams) ([]GoalContribution, error) {
	query := `
		SELECT * FROM finance_spaces_goals_contributions
		WHERE user_id = :user_id AND finance_space_id = :finance_space_id AND finance_space_goal_id = :finance_space_goal_id
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	contribs := []GoalContribution{}
	err = r.db.Select(&contribs, r.db.Rebind(query), args...)
	if err != nil {
		return nil, err
	}
	return contribs, nil
}

func (r *Repository) DeleteGoalContribution(id int32) error {
	query := `DELETE FROM finance_spaces_goals_contributions WHERE id = $1`
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

// Expenses

func (r *Repository) CreateExpense(params *CreateExpenseParams) (*Expense, error) {
	query := `
		INSERT INTO finance_spaces_expenses (finance_space_id, user_id, name, amount, category, description)
		VALUES (:finance_space_id, :user_id, :name, :amount, :category, :description)
		RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	expense := &Expense{}
	err = r.db.Get(expense, r.db.Rebind(query), args...)
	if err != nil {
		return nil, err
	}
	return expense, nil
}

func (r *Repository) ListExpenses(params *ListExpensesParams) ([]Expense, error) {
	query := `
		SELECT * FROM finance_spaces_expenses
		WHERE user_id = :user_id AND finance_space_id = :finance_space_id
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	expenses := []Expense{}
	err = r.db.Select(&expenses, r.db.Rebind(query), args...)
	if err != nil {
		return nil, err
	}
	return expenses, nil
}

func (r *Repository) DeleteExpense(id int32) error {
	query := `DELETE FROM finance_spaces_expenses WHERE id = $1`
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

// Income Sources

func (r *Repository) CreateIncomeSource(params *CreateIncomeSourceParams) (*IncomeSource, error) {
	query := `
		INSERT INTO finance_spaces_income_sources (finance_space_id, user_id, name, amount)
		VALUES (:finance_space_id, :user_id, :name, :amount)
		RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	income := &IncomeSource{}
	err = r.db.Get(income, r.db.Rebind(query), args...)
	if err != nil {
		return nil, err
	}
	return income, nil
}

func (r *Repository) ListIncomeSources(spaceID int32) ([]IncomeSource, error) {
	query := `SELECT * FROM finance_spaces_income_sources WHERE finance_space_id = $1`
	sources := []IncomeSource{}
	err := r.db.Select(&sources, query, spaceID)
	if err != nil {
		return nil, err
	}
	return sources, nil
}

func (r *Repository) DeleteIncomeSource(id int32) error {
	query := `DELETE FROM finance_spaces_income_sources WHERE id = $1`
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}
