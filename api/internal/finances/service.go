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
