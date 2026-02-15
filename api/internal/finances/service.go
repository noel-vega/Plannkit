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

func (s *Service) CreateSpace(params CreateSpaceParams) (*Space, error) {
	return s.repository.CreateSpace(params)
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
