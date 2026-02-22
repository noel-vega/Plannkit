package finances

import (
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
)

type Service struct {
	repository *Repository
}

func NewService(db *sqlx.DB) *Service {
	return &Service{
		repository: NewRepository(db),
	}
}

func (s *Service) CreateSpace(params *CreateSpaceParams) (*Space, error) {
	space, err := s.repository.CreateSpace(params)
	if err != nil {
		return nil, err
	}
	err = s.repository.CreateSpaceMembership(params.UserID, space.ID)
	if err != nil {
		return nil, err
	}
	return space, nil
}

func (s *Service) SpaceMembershipExists(userID, spaceID int) (bool, error) {
	_, err := s.repository.GetSpaceMembership(userID, spaceID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (s *Service) GetSpace(userID, spaceID int) (*Space, error) {
	return s.repository.GetSpaceByID(userID, spaceID)
}

func (s *Service) ListSpaces(userID int) ([]Space, error) {
	return s.repository.ListSpaces(userID)
}

func (s *Service) DeleteSpace(userID, spaceID int) error {
	return s.repository.DeleteSpaceByID(userID, spaceID)
}

func (s *Service) CreateGoal(params *CreateGoalParams) (*Goal, error) {
	return s.repository.CreateGoal(params)
}

func (s *Service) ListGoals(params *ListGoalsParams) ([]Goal, error) {
	return s.repository.ListGoals(params)
}

func (s *Service) GetGoal(params *GetGoalParams) (*Goal, error) {
	return s.repository.GetGoal(params)
}

func (s *Service) CreateGoalContribution(params *CreateGoalContributionParams) (*GoalContribution, error) {
	return s.repository.CreateGoalContribution(params)
}

func (s *Service) CreateExpense(params *CreateExpenseParams) (*Expense, error) {
	return s.repository.CreateExpense(params)
}

func (s *Service) ListExpenses(params *ListExpensesParams) ([]Expense, error) {
	return s.repository.ListExpenses(params)
}

func (s *Service) DeleteExpense(params *DeleteExpenseParams) error {
	return s.repository.DeleteExpense(params)
}
