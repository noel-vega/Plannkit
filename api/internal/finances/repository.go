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
	return &Repository{
		db: db,
	}
}

func (r *Repository) CreateSpace(params *CreateSpaceParams) (*Space, error) {
	data := &Space{}
	query := `
	INSERT INTO 
	finance_spaces (name)
	VALUES (:name)
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

func (r *Repository) GetSpaceMember(params *SpaceMemberRelationship) (*SpaceMember, error) {
	query := `
		SELECT *
	  FROM finance_spaces_members
	  WHERE user_id = :user_id AND finance_space_id = :finance_space_id
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	data := &SpaceMember{}
	err = r.db.Get(data, r.db.Rebind(query), args...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}
	return data, nil
}

func (r *Repository) ListSpaces(userID int) ([]SpaceWithMembership, error) {
	spaces := []SpaceWithMembership{}
	query := `
	SELECT 
	  s.*, 
	  m.id as "membership.id",
	  m.finance_space_id as "membership.finance_space_id",
	  m.user_id as "membership.user_id",
	  m.role as "membership.role",
	  m.status as "membership.status",
	  m.created_at as "membership.created_at",
	  m.updated_at as "membership.updated_at",
    u.id as "owner.id",
    u.username as "owner.username",
    u.first_name as "owner.first_name",
    u.last_name as "owner.last_name",
    u.email as "owner.email",
    u.is_private as "owner.is_private",
    u.avatar as "owner.avatar",
    u.created_at as "owner.created_at",
    u.updated_at as "owner.updated_at"
	FROM finance_spaces s
	JOIN finance_spaces_members m ON m.finance_space_id = s.id AND m.user_id = $1
	JOIN finance_spaces_members om ON om.finance_space_id = s.id AND om.role = 'owner'
	JOIN users u ON u.id = om.user_id
	`

	err := r.db.Select(&spaces, query, userID)
	if err != nil {
		return nil, err
	}

	return spaces, nil
}

func (r *Repository) DeleteSpace(spaceID int) error {
	query := `
	DELETE FROM finance_spaces 
	WHERE id = $1`
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

func (r *Repository) GetSpace(spaceID int) (*Space, error) {
	data := &Space{}
	query := `SELECT * FROM finance_spaces WHERE id = $1`
	err := r.db.Get(data, query, spaceID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}
	return data, nil
}

func (r *Repository) UpdateSpaceName(params *UpdateSpaceNameParams) (*Space, error) {
	query := `
		UPDATE finance_spaces
	  SET name = :name
	  WHERE id = :finance_space_id 
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
  SELECT g.*, COALESCE(SUM(c.amount), 0) AS total_contributions
  FROM finance_spaces_goals g
  LEFT JOIN finance_spaces_goals_contributions c ON c.finance_space_goal_id = g.id
  WHERE g.finance_space_id = :finance_space_id
  GROUP BY g.id
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

func (r *Repository) DeleteGoal(params *GoalIdent) error {
	query := `
	DELETE FROM finance_spaces_goals
	WHERE id = :id AND finance_space_id = :finance_space_id`

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

	query = r.db.Rebind(query)

	data := &Goal{}
	err = r.db.Get(data, query, args...)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (r *Repository) CreateGoalContribution(params *CreateGoalContributionParams) (*GoalContribution, error) {
	query := `
		INSERT INTO
			finance_spaces_goals_contributions (finance_space_id, finance_space_goal_id, user_id, amount, note)
	  VALUES (:finance_space_id, :finance_space_goal_id, :user_id, :amount, :note)
	  RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	query = r.db.Rebind(query)

	data := &GoalContribution{}
	err = r.db.Get(data, query, args...)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (r *Repository) ListGoalContributions(params *ListGoalContributionsParams) ([]GoalContribution, error) {
	query := `
		SELECT * 
	  FROM finance_spaces_goals_contributions
	  WHERE user_id = :user_id AND finance_space_id = :finance_space_id AND finance_space_goal_id = :finance_space_goal_id
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}

	query = r.db.Rebind(query)

	data := []GoalContribution{}
	err = r.db.Select(&data, query, args...)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (r *Repository) DeleteGoalContribution(id int) error {
	query := `
    DELETE FROM finance_spaces_goals_contributions
	  WHERE id = $1 
	`
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

func (r *Repository) DeleteExpense(id int) error {
	query := `
    DELETE FROM finance_spaces_expenses
	  WHERE id = $1
	`
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

func (r *Repository) InsertIncomeSource(params *InsertIncomeSourceParams) (*IncomeSource, error) {
	query := `
		INSERT INTO 
	  finance_spaces_income_sources (finance_space_id, user_id, name, amount)
	  VALUES (:finance_space_id, :user_id, :name, :amount)
	  RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	query = r.db.Rebind(query)
	incomeSource := &IncomeSource{}
	err = r.db.Get(incomeSource, query, args...)
	if err != nil {
		return nil, err
	}
	return incomeSource, nil
}

func (r *Repository) ListIncomeSources(params *ListIncomeSourcesParams) ([]IncomeSource, error) {
	query := `
		SELECT * 
	  FROM finance_spaces_income_sources 
	  WHERE finance_space_id = $1
	`
	incomeSources := []IncomeSource{}
	err := r.db.Select(&incomeSources, query, params.SpaceID)
	if err != nil {
		return nil, err
	}

	return incomeSources, nil
}

func (r *Repository) DeleteIncomeSource(id int) error {
	query := `
		DELETE FROM finance_spaces_income_sources
	  WHERE id = $1
	`
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

func (r *Repository) InsertSpaceMember(params *InsertSpaceMemberParams) (*SpaceMember, error) {
	query := `
		INSERT INTO
	  finance_spaces_members (user_id, finance_space_id, role, status)
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

func (r *Repository) ListSpaceMembers(params *ListSpaceMembersParams) ([]SpaceMember, error) {
	query := `
		SELECT * FROM finance_spaces_members WHERE finance_space_id = $1
	`
	members := []SpaceMember{}
	err := r.db.Select(&members, query, params.SpaceID)
	if err != nil {
		return nil, err
	}
	return members, nil
}

func (r *Repository) ListSpaceMembersWithUsers(params *ListSpaceMembersParams) ([]SpaceMemberWithUser, error) {
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
	err := r.db.Select(&members, query, params.SpaceID)
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

func (r *Repository) UpdateSpaceMemberStatus(params *UpdateSpaceMemberStatus) (*SpaceMember, error) {
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
	return member, err
}
