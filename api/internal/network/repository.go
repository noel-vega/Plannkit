package network

import (
	"database/sql"
	"errors"

	sq "github.com/Masterminds/squirrel"
	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/apperrors"
	"github.com/noel-vega/habits/api/internal/user"
)

type Repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		db: db,
	}
}

func (r *Repository) ListUsers(params *ListUsersParams) ([]user.UserNoPassword, error) {
	qb := sq.Select(
		"u.id", "u.username", "u.first_name", "u.last_name", "u.email",
		"u.avatar", "u.is_private", "u.created_at", "u.updated_at",
	).From("users u").LeftJoin("followers f ON f.user_id = ? AND f.following_user_id = u.id", params.UserID)

	if params.QueryParams.Search != "" {
		qb = qb.Where(sq.Expr("first_name || ' ' || last_name ILIKE ?", "%"+params.QueryParams.Search+"%"))
	}
	query, args, err := qb.PlaceholderFormat(sq.Dollar).ToSql()
	if err != nil {
		return nil, err
	}
	data := []user.UserNoPassword{}
	err = r.db.Select(&data, query, args...)
	if err != nil {
		return nil, err
	}
	return data, nil
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
