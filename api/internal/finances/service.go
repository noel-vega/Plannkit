package finances

import (
	"errors"
	"strings"

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

func (s *Service) CreateSpace(params *CreateSpaceParams) (*Space, *SpaceMember, error) {
	if params.Name == "" {
		return nil, nil, ErrValidationRequireName
	}
	space, err := s.repository.CreateSpace(params)
	if err != nil {
		return nil, nil, err
	}
	member, err := s.repository.InsertSpaceMember(&InsertSpaceMemberParams{
		SpaceID: space.ID,
		UserID:  params.UserID,
		Status:  MemberInviteAccepted,
		Role:    RoleOwner,
	})
	if err != nil {
		return nil, nil, err
	}
	return space, member, nil
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

func (s *Service) GetSpace(spaceID int) (*Space, error) {
	space, err := s.repository.GetSpace(spaceID)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, ErrSpaceNotFound
		}
		return nil, err
	}
	return space, err
}

func (s *Service) ListSpaces(userID int) ([]SpaceWithMembership, error) {
	return s.repository.ListSpaces(userID)
}

func (s *Service) DeleteSpace(spaceID int) error {
	return s.repository.DeleteSpace(spaceID)
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
	isConnected, err := s.connectionChecker.AreConnected(params.UserID, params.NewMemberUserID)
	if err != nil {
		return nil, err
	}
	if !isConnected {
		return nil, contracts.ErrNotConnected
	}

	if params.Role != RoleEditor && params.Role != RoleViewer {
		return nil, ErrInvalidRole
	}
	return s.repository.InsertSpaceMember(&InsertSpaceMemberParams{
		UserID:  params.NewMemberUserID,
		SpaceID: params.SpaceID,
		Role:    params.Role,
		Status:  MemberInvitePending,
	})
}

func (s *Service) AcceptSpaceInvite(params *SpaceMemberRelationship) (*SpaceMember, error) {
	member, err := s.GetSpaceMember(params)
	if err != nil {
		return nil, err
	}

	if member.Status == MemberInviteAccepted {
		return nil, ErrSpaceInviteAlreadyAccepted
	}

	if member.Status != MemberInvitePending {
		return nil, ErrSpaceInviteNotFound
	}

	return s.repository.UpdateSpaceMemberStatus(&UpdateSpaceMemberStatus{
		SpaceMemberRelationship: *params,
		Status:                  MemberInviteAccepted,
	})
}

func (s *Service) ListSpaceMembers(params *ListSpaceMembersParams) ([]SpaceMember, error) {
	return s.repository.ListSpaceMembers(params)
}

func (s *Service) ListSpaceMembersWithUsers(params *ListSpaceMembersParams) ([]SpaceMemberWithUser, error) {
	return s.repository.ListSpaceMembersWithUsers(params)
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
	member, err := s.GetSpaceMember(params)
	if err != nil {
		return err
	}

	if member.Role == RoleOwner {
		return ErrCannotDeleteOwner
	}
	return s.repository.DeleteSpaceMember(params)
}

func (s *Service) UpdateSpaceName(params *UpdateSpaceNameParams) (*Space, error) {
	member, err := s.GetSpaceMember(&params.SpaceMemberRelationship)
	if err != nil {
		if errors.Is(err, ErrSpaceMemberNotFound) {
			return nil, apperrors.ErrUnauthorized
		}
		return nil, err
	}

	if member.Role != RoleOwner {
		return nil, apperrors.ErrUnauthorized
	}

	trimmedName := strings.TrimSpace(params.Name)
	if trimmedName == "" {
		return nil, ErrValidationRequireName
	}

	params.Name = trimmedName

	return s.repository.UpdateSpaceName(params)
}
