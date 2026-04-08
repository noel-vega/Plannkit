package finances

import (
	"context"
	"errors"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/noel-vega/habits/api/db"
	"github.com/noel-vega/habits/api/internal/apperrors"
	"github.com/noel-vega/habits/api/internal/contracts"
)

type Service struct {
	connectionChecker contracts.ConnectionChecker
	queries           *db.Queries
}

func NewService(queries *db.Queries, cc contracts.ConnectionChecker) *Service {
	return &Service{
		queries:           queries,
		connectionChecker: cc,
	}
}

type CreateSpaceParams struct {
	Name   string
	UserID int32
}

func (s *Service) CreateSpace(ctx context.Context, params CreateSpaceParams) (db.FinanceSpace, db.FinanceSpacesMember, error) {
	params.Name = strings.TrimSpace(params.Name)
	if params.Name == "" {
		return db.FinanceSpace{}, db.FinanceSpacesMember{}, ErrValidationRequireName
	}
	space, err := s.queries.CreateSpace(ctx, params.Name)
	if err != nil {
		return db.FinanceSpace{}, db.FinanceSpacesMember{}, err
	}
	member, err := s.queries.CreateSpaceMember(ctx, db.CreateSpaceMemberParams{
		FinanceSpaceID: space.ID,
		UserID:         params.UserID,
		Status:         MemberInviteAccepted,
		Role:           RoleOwner,
	})
	if err != nil {
		return db.FinanceSpace{}, db.FinanceSpacesMember{}, err
	}
	return space, member, nil
}

func (s *Service) GetSpace(ctx context.Context, spaceID int32) (db.FinanceSpace, error) {
	space, err := s.queries.GetSpace(ctx, spaceID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return db.FinanceSpace{}, ErrSpaceNotFound
		}
		return db.FinanceSpace{}, err
	}
	return space, err
}

func (s *Service) ListSpaces(ctx context.Context, userID int32) ([]db.ListSpacesRow, error) {
	return s.queries.ListSpaces(ctx, userID)
}

func (s *Service) DeleteSpace(ctx context.Context, spaceID int32) error {
	count, err := s.queries.DeleteSpace(ctx, spaceID)
	if err != nil {
		return err
	}

	if count == 0 {
		return ErrSpaceNotFound
	}
	return err
}

func (s *Service) CreateGoal(ctx context.Context, params db.CreateGoalParams) (db.FinanceSpacesGoal, error) {
	return s.queries.CreateGoal(ctx, params)
}

func (s *Service) ListGoals(ctx context.Context, spaceID int32) ([]db.ListGoalsRow, error) {
	return s.queries.ListGoals(ctx, spaceID)
}

func (s *Service) GetGoal(ctx context.Context, params db.GetGoalParams) (db.GetGoalRow, error) {
	goal, err := s.queries.GetGoal(ctx, params)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return db.GetGoalRow{}, ErrGoalNotFound
		}
		return db.GetGoalRow{}, err
	}
	return goal, nil
}

func (s *Service) DeleteGoal(ctx context.Context, params db.DeleteGoalParams) error {
	count, err := s.queries.DeleteGoal(ctx, params)
	if err != nil {
		return err
	}
	if count == 0 {
		return ErrGoalNotFound
	}
	return nil
}

func (s *Service) CreateGoalContribution(ctx context.Context, params db.CreateGoalContributionParams) (db.FinanceSpacesGoalsContribution, error) {
	return s.queries.CreateGoalContribution(ctx, params)
}

func (s *Service) ListGoalContributions(ctx context.Context, params db.ListGoalContributionsParams) ([]db.FinanceSpacesGoalsContribution, error) {
	return s.queries.ListGoalContributions(ctx, params)
}

func (s *Service) DeleteGoalContribution(ctx context.Context, ID int32) error {
	count, err := s.queries.DeleteGoalContribution(ctx, ID)
	if err != nil {
		return err
	}
	if count == 0 {
		return ErrGoalContributionNotFound
	}
	return nil
}

func (s *Service) CreateExpense(ctx context.Context, params db.CreateExpenseParams) (db.FinanceSpacesExpense, error) {
	return s.queries.CreateExpense(ctx, params)
}

func (s *Service) ListExpenses(ctx context.Context, params db.ListExpensesParams) ([]db.FinanceSpacesExpense, error) {
	return s.queries.ListExpenses(ctx, params)
}

func (s *Service) DeleteExpense(ctx context.Context, ID int32) error {
	count, err := s.queries.DeleteExpense(ctx, ID)
	if err != nil {
		return err
	}
	if count == 0 {
		return ErrExpenseNotFound
	}
	return nil
}

func (s *Service) CreateIncomeSource(ctx context.Context, params db.CreateIncomeSourceParams) (db.FinanceSpacesIncomeSource, error) {
	return s.queries.CreateIncomeSource(ctx, params)
}

func (s *Service) ListIncomeSources(ctx context.Context, spaceID int32) ([]db.FinanceSpacesIncomeSource, error) {
	return s.queries.ListIncomeSources(ctx, spaceID)
}

func (s *Service) DeleteIncomeSource(ctx context.Context, incomeSourceID int32) error {
	count, err := s.queries.DeleteIncomeSource(ctx, incomeSourceID)
	if err != nil {
		return err
	}
	if count == 0 {
		return ErrIncomeSourceNotFound
	}
	return err
}

func (s *Service) InviteToSpace(ctx context.Context, params InviteToSpaceParams) (db.FinanceSpacesMember, error) {
	isConnected, err := s.connectionChecker.AreConnected(params.UserID, params.NewMemberUserID)
	if err != nil {
		return db.FinanceSpacesMember{}, err
	}
	if !isConnected {
		return db.FinanceSpacesMember{}, contracts.ErrNotConnected
	}

	if params.Role != RoleEditor && params.Role != RoleViewer {
		return db.FinanceSpacesMember{}, ErrInvalidRole
	}
	return s.queries.CreateSpaceMember(ctx, db.CreateSpaceMemberParams{
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

func (s *Service) AcceptSpaceInvite(ctx context.Context, params AcceptSpaceInvite) error {
	member, err := s.GetSpaceMember(ctx, db.GetSpaceMemberParams{
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

	count, err := s.queries.UpdateSpaceMemberStatus(ctx, db.UpdateSpaceMemberStatusParams{
		FinanceSpaceID: params.SpaceID,
		UserID:         params.UserID,
		Status:         MemberInviteAccepted,
	})
	if err != nil {
		return err
	}

	if count == 0 {
		return ErrSpaceMemberNotFound
	}
	return nil
}

func (s *Service) ListSpaceMembers(ctx context.Context, spaceID int32) ([]db.FinanceSpacesMember, error) {
	return s.queries.ListSpaceMembers(ctx, spaceID)
}

func (s *Service) ListSpaceMembersWithUsers(ctx context.Context, spaceID int32) ([]db.ListSpaceMembersUsersRow, error) {
	return s.queries.ListSpaceMembersUsers(ctx, spaceID)
}

func (s *Service) GetSpaceMember(ctx context.Context, params db.GetSpaceMemberParams) (db.FinanceSpacesMember, error) {
	member, err := s.queries.GetSpaceMember(ctx, params)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return db.FinanceSpacesMember{}, ErrSpaceMemberNotFound
		}
		return db.FinanceSpacesMember{}, err
	}
	return member, nil
}

func (s *Service) DeleteSpaceMember(ctx context.Context, params db.DeleteSpaceMemberParams) error {
	member, err := s.GetSpaceMember(ctx, db.GetSpaceMemberParams{
		UserID:         params.UserID,
		FinanceSpaceID: params.FinanceSpaceID,
	})
	if err != nil {
		return err
	}

	if member.Role == RoleOwner {
		return ErrCannotDeleteOwner
	}

	count, err := s.queries.DeleteSpaceMember(ctx, params)
	if count == 0 {
		return ErrSpaceMemberNotFound
	}
	return err
}

func (s *Service) UpdateSpaceName(ctx context.Context, userID int32, params db.UpdateSpaceNameParams) error {
	member, err := s.GetSpaceMember(ctx, db.GetSpaceMemberParams{
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

	count, err := s.queries.UpdateSpaceName(ctx, params)
	if err != nil {
		return err
	}
	if count == 0 {
		return ErrSpaceNotFound
	}
	return nil
}
