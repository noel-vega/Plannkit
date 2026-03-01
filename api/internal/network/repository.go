package network

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

func (r *Repository) GetFollower(params *GetFollowerParams) (*Follower, error) {
	query := `
	SELECT * FROM followers 
	WHERE user_id = :user_id AND following_user_id = :following_user_id
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	query = r.db.Rebind(query)

	follower := &Follower{}
	err = r.db.Get(follower, query, args...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}

	return follower, err
}

func (r *Repository) InsertFollow(params *InsertFollowParams) error {
	query := `
		INSERT INTO 
	  followers (user_id, following_user_id, status)
	  VALUES(:user_id, :following_user_id, :status)
	  ON CONFLICT(user_id, following_user_id) DO NOTHING
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
		return ErrFollowExists
	}
	return nil
}

func (r *Repository) DeleteFollow(params *DeleteFollowParams) error {
	query := `
	DELETE FROM followers
	WHERE user_id = :user_id AND following_user_id = :following_user_id
	`
	_, err := r.db.NamedExec(query, params)
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) AcceptFollow(params AcceptFollowParams) error {
	query := `
	UPDATE followers
	SET status = :status 
	WHERE user_id = :user_id AND following_user_id = :following_user_id 
	`
	_, err := r.db.NamedExec(query, params)
	if err != nil {
		return err
	}
	return nil
}
