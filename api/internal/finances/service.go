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

func (s *Service) CreateSpace(params CreateSpaceParams, userID int32) (*Space, *SpaceMember, error) {
	params.Name = strings.TrimSpace(params.Name)
	if params.Name == "" {
		return nil, nil, ErrValidationRequireName
	}
	space, err := s.repository.CreateSpace(&params)
	if err != nil {
		return nil, nil, err
	}
	member, err := s.repository.CreateSpaceMember(&CreateSpaceMemberParams{
		FinanceSpaceID: space.ID,
		UserID:         userID,
		Status:         MemberInviteAccepted,
		Role:           RoleOwner,
	})
	if err != nil {
		return nil, nil, err
	}
	return space, member, nil
}

func (s *Service) GetSpace(spaceID int32) (*Space, error) {
	space, err := s.repository.GetSpace(spaceID)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, ErrSpaceNotFound
		}
		return nil, err
	}
	return space, nil
}

func (s *Service) ListSpaces(userID int32) ([]SpaceWithMembership, error) {
	return s.repository.ListSpaces(userID)
}

func (s *Service) DeleteSpace(spaceID int32) error {
	err := s.repository.DeleteSpace(spaceID)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrSpaceNotFound
	}
	return err
}

func (s *Service) CreateGoal(params CreateGoalParams) (*Goal, error) {
	return s.repository.CreateGoal(&params)
}

func (s *Service) ListGoals(spaceID int32) ([]Goal, error) {
	return s.repository.ListGoals(spaceID)
}

func (s *Service) GetGoal(params GoalIdent) (*Goal, error) {
	goal, err := s.repository.GetGoal(&params)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, ErrGoalNotFound
		}
		return nil, err
	}
	return goal, nil
}

func (s *Service) UpdateGoal(params UpdateGoalParams) error {
	err := s.repository.UpdateGoal(params)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrGoalNotFound
	}
	return err
}

func (s *Service) DeleteGoal(params GoalIdent) error {
	err := s.repository.DeleteGoal(&params)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrGoalNotFound
	}
	return err
}

func (s *Service) CreateGoalContribution(params CreateGoalContributionParams) (*GoalContribution, error) {
	return s.repository.CreateGoalContribution(&params)
}

func (s *Service) ListGoalContributions(params ListGoalContributionsParams) ([]GoalContribution, error) {
	return s.repository.ListGoalContributions(&params)
}

func (s *Service) DeleteGoalContribution(id int32) error {
	err := s.repository.DeleteGoalContribution(id)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrGoalContributionNotFound
	}
	return err
}

func (s *Service) CreateExpense(params CreateExpenseParams) (*Expense, error) {
	return s.repository.CreateExpense(&params)
}

func (s *Service) ListExpenses(params ListExpensesParams) ([]Expense, error) {
	return s.repository.ListExpenses(&params)
}

func (s *Service) DeleteExpense(id int32) error {
	err := s.repository.DeleteExpense(id)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrExpenseNotFound
	}
	return err
}

func (s *Service) CreateIncomeSource(params CreateIncomeSourceParams) (*IncomeSource, error) {
	return s.repository.CreateIncomeSource(&params)
}

func (s *Service) ListIncomeSources(spaceID int32) ([]IncomeSource, error) {
	return s.repository.ListIncomeSources(spaceID)
}

func (s *Service) DeleteIncomeSource(id int32) error {
	err := s.repository.DeleteIncomeSource(id)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrIncomeSourceNotFound
	}
	return err
}

func (s *Service) InviteToSpace(params InviteToSpaceParams) (*SpaceMember, error) {
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
	return s.repository.CreateSpaceMember(&CreateSpaceMemberParams{
		UserID:         params.NewMemberUserID,
		FinanceSpaceID: params.SpaceID,
		Role:           params.Role,
		Status:         MemberInvitePending,
	})
}

type AcceptSpaceInvite struct {
	SpaceID int32
	UserID  int32
}

func (s *Service) AcceptSpaceInvite(params AcceptSpaceInvite) error {
	member, err := s.GetSpaceMember(GetSpaceMemberParams{
		FinanceSpaceID: params.SpaceID,
		UserID:         params.UserID,
	})
	if err != nil {
		return err
	}

	if member.Status == MemberInviteAccepted {
		return ErrSpaceInviteAlreadyAccepted
	}

	if member.Status != MemberInvitePending {
		return ErrSpaceInviteNotFound
	}

	_, err = s.repository.UpdateSpaceMemberStatus(&UpdateSpaceMemberStatusParams{
		SpaceMemberRelationship: SpaceMemberRelationship{
			FinanceSpaceID: params.SpaceID,
			UserID:         params.UserID,
		},
		Status: MemberInviteAccepted,
	})
	return err
}

func (s *Service) ListSpaceMembers(spaceID int32) ([]SpaceMember, error) {
	return s.repository.ListSpaceMembers(spaceID)
}

func (s *Service) ListSpaceMembersWithUsers(spaceID int32) ([]SpaceMemberWithUser, error) {
	return s.repository.ListSpaceMembersWithUsers(spaceID)
}

func (s *Service) GetSpaceMember(params GetSpaceMemberParams) (*SpaceMember, error) {
	member, err := s.repository.GetSpaceMember(&params)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, ErrSpaceMemberNotFound
		}
		return nil, err
	}
	return member, nil
}

func (s *Service) DeleteSpaceMember(params SpaceMemberRelationship) error {
	member, err := s.GetSpaceMember(params)
	if err != nil {
		return err
	}

	if member.Role == RoleOwner {
		return ErrCannotDeleteOwner
	}

	err = s.repository.DeleteSpaceMember(params)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrSpaceMemberNotFound
	}
	return err
}

func (s *Service) UpdateSpaceName(userID int32, params UpdateSpaceNameParams) error {
	member, err := s.GetSpaceMember(GetSpaceMemberParams{
		UserID:         userID,
		FinanceSpaceID: params.ID,
	})
	if err != nil {
		if errors.Is(err, ErrSpaceMemberNotFound) {
			return apperrors.ErrUnauthorized
		}
		return err
	}

	if member.Role != RoleOwner {
		return apperrors.ErrUnauthorized
	}

	trimmedName := strings.TrimSpace(params.Name)
	if trimmedName == "" {
		return ErrValidationRequireName
	}

	if len(trimmedName) > 30 {
		return ErrValidationMaxCharacters
	}

	params.Name = trimmedName

	err = s.repository.UpdateSpaceName(&params)
	if errors.Is(err, apperrors.ErrNotFound) {
		return ErrSpaceNotFound
	}
	return err
}
