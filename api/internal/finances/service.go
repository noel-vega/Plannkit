package finances

import "github.com/jmoiron/sqlx"

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

func (s *Service) ListSpaces(userID int) ([]Space, error) {
	return s.repository.ListSpaces(userID)
}

func (s *Service) DeleteSpace(userID, spaceID int) error {
	return s.repository.DeleteSpaceByID(userID, spaceID)
}

func (s *Service) GetSpace(userID, spaceID int) (*Space, error) {
	return s.repository.GetSpaceByID(userID, spaceID)
}

func (s *Service) ListExpenses(userID, spaceID int) ([]Expense, error) {
	return s.repository.ListExpenses(userID, spaceID)
}

func (s *Service) CreateExpense(params *CreateExpenseParams) (*Expense, error) {
	return s.repository.CreateExpense(params)
}
