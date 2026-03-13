package finances

import (
	"errors"

	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/apperrors"
	"github.com/noel-vega/habits/api/internal/contracts"
)

type Service struct {
	connectionChecker contracts.ConnectionChecker
	repository        *Repository
}

func NewService(db *sqlx.DB, cc contracts.ConnectionChecker) *Service {
	return &Service{
		repository:        NewRepository(db),
		connectionChecker: cc,
	}
}

func (s *Service) CreateSpace(params *CreateSpaceParams) (*Space, error) {
	space, err := s.repository.CreateSpace(params)
	if err != nil {
		return nil, err
	}
	_, err = s.repository.InsertSpaceMember(&InsertSpaceMemberParams{
		SpaceID: space.ID,
		UserID:  params.UserID,
		Status:  "accepted",
	})
	if err != nil {
		return nil, err
	}
	return space, nil
}

func (s *Service) SpaceMembershipExists(params *SpaceMemberRelationship) (bool, error) {
	_, err := s.repository.GetSpaceMember(params)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
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

func (s *Service) ListGoalContributions(params *ListGoalContributionsParams) ([]GoalContribution, error) {
	return s.repository.ListGoalContributions(params)
}

func (s *Service) DeleteGoalContribution(params *DeleteGoalContributionParams) error {
	return s.repository.DeleteGoalContribution(params)
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

func (s *Service) CreateIncomeSource(params *InsertIncomeSourceParams) (*IncomeSource, error) {
	return s.repository.InsertIncomeSource(params)
}

func (s *Service) ListIncomeSources(params *ListIncomeSourcesParams) ([]IncomeSource, error) {
	return s.repository.ListIncomeSources(params)
}

func (s *Service) DeleteIncomeSource(params *DeleteIncomeSourceParams) error {
	return s.repository.DeleteIncomeSource(params)
}

func (s *Service) InviteToSpace(params *InviteToSpaceParams) (*SpaceMember, error) {
	// TODO: only owners and admins should be allowed to invite
	isConnected, err := s.connectionChecker.AreConnected(params.UserID, params.NewMemberUserID)
	if err != nil {
		return nil, err
	}
	if !isConnected {
		return nil, contracts.ErrNotConnected
	}
	return s.repository.InsertSpaceMember(&InsertSpaceMemberParams{
		UserID:  params.NewMemberUserID,
		SpaceID: params.SpaceID,
		Status:  "pending",
	})
}

func (s *Service) AcceptSpaceInvite(params *SpaceMemberRelationship) (*SpaceMember, error) {
	member, err := s.GetSpaceMember(params)
	if err != nil {
		return nil, err
	}

	if member.Status == "accepted" {
		return nil, ErrSpaceInviteAlreadyAccepted
	}

	if member.Status != "pending" {
		return nil, ErrSpaceInviteNotFound
	}

	return s.repository.UpdateSpaceMemberStatus(&UpdateSpaceMemberStatus{
		SpaceMemberRelationship: *params,
		Status:                  "accepted",
	})
}

func (s *Service) ListSpaceMembers(params *ListSpaceMembersParams) ([]SpaceMember, error) {
	return s.repository.ListSpaceMembers(params)
}

func (s *Service) GetSpaceMember(params *SpaceMemberRelationship) (*SpaceMember, error) {
	member, err := s.repository.GetSpaceMember(params)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, ErrSpaceMemberNotFound
		}
		return nil, err
	}
	return member, nil
}

func (s *Service) DeleteSpaceMember(params *SpaceMemberRelationship) error {
	// TODO: Only owners and admins should be allowed to delete members.
	// Owners cannot be deleted
	_, err := s.GetSpaceMember(params)
	if err != nil {
		return err
	}
	return s.repository.DeleteSpaceMember(params)
}
