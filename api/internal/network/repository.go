package network

import (
	"database/sql"
	"errors"

	sq "github.com/Masterminds/squirrel"
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

func (r *Repository) ListUsers(params *ListUsersParams) ([]NetworkUser, error) {
	qb := sq.Select(
		"u.id", "u.username", "u.first_name", "u.last_name", "u.email",
		"u.avatar", "u.is_private", "f.status as follow_status", "u.created_at", "u.updated_at",
	).From("users u").LeftJoin("network_followers f ON f.follower_user_id = ? AND f.following_user_id = u.id", params.UserID)
	qb = qb.Where("u.id != ?", params.UserID)

	if params.QueryParams.Search != "" {
		qb = qb.Where(sq.Expr("first_name || ' ' || last_name ILIKE ?", "%"+params.QueryParams.Search+"%"))
	}
	query, args, err := qb.PlaceholderFormat(sq.Dollar).ToSql()
	if err != nil {
		return nil, err
	}
	data := []NetworkUser{}
	err = r.db.Select(&data, query, args...)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (r *Repository) ListFollowers(params *ListUsersParams) ([]NetworkUser, error) {
	qb := sq.Select(
		"u.id", "u.username", "u.first_name", "u.last_name", "u.email",
		"u.avatar", "u.is_private", "f.status as follow_status", "u.created_at", "u.updated_at",
	).From("users u").InnerJoin("network_followers f ON f.follower_user_id = u.id AND f.following_user_id = ?", params.UserID)

	if params.QueryParams.Search != "" {
		qb = qb.Where(sq.Expr("first_name || ' ' || last_name ILIKE ?", "%"+params.QueryParams.Search+"%"))
	}
	query, args, err := qb.PlaceholderFormat(sq.Dollar).ToSql()
	if err != nil {
		return nil, err
	}
	data := []NetworkUser{}
	err = r.db.Select(&data, query, args...)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (r *Repository) ListFollowing(params *ListUsersParams) ([]NetworkUser, error) {
	qb := sq.Select(
		"u.id", "u.username", "u.first_name", "u.last_name", "u.email",
		"u.avatar", "u.is_private", "f.status as follow_status", "u.created_at", "u.updated_at",
	).From("users u").InnerJoin("network_followers f ON f.follower_user_id = ? AND f.following_user_id = u.id", params.UserID)

	if params.QueryParams.Search != "" {
		qb = qb.Where(sq.Expr("first_name || ' ' || last_name ILIKE ?", "%"+params.QueryParams.Search+"%"))
	}
	query, args, err := qb.PlaceholderFormat(sq.Dollar).ToSql()
	if err != nil {
		return nil, err
	}
	data := []NetworkUser{}
	err = r.db.Select(&data, query, args...)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (r *Repository) ListConnections(params *ListUsersParams) ([]NetworkUser, error) {
	qb := sq.Select(
		"u.id", "u.username", "u.first_name", "u.last_name", "u.email",
		"u.avatar", "u.is_private", "f.status as follow_status", "u.created_at", "u.updated_at",
	).From("users u").
		InnerJoin("network_connections c ON (c.user_1_id = ? AND c.user_2_id = u.id) OR (c.user_2_id = ? AND c.user_1_id = u.id)", params.UserID, params.UserID).
		LeftJoin("network_followers f ON f.follower_user_id = ? AND f.following_user_id = u.id", params.UserID)

	if params.QueryParams.Search != "" {
		qb = qb.Where(sq.Expr("first_name || ' ' || last_name ILIKE ?", "%"+params.QueryParams.Search+"%"))
	}
	query, args, err := qb.PlaceholderFormat(sq.Dollar).ToSql()
	if err != nil {
		return nil, err
	}
	data := []NetworkUser{}
	err = r.db.Select(&data, query, args...)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (r *Repository) GetFollow(params *GetFollowerParams) (*Follow, error) {
	query := `
	SELECT * FROM network_followers 
	WHERE follower_user_id = :follower_user_id AND following_user_id = :following_user_id
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}
	query = r.db.Rebind(query)

	follower := &Follow{}
	err = r.db.Get(follower, query, args...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}

	return follower, nil
}

func (r *Repository) InsertFollow(params *InsertFollowParams) error {
	query := `
		INSERT INTO 
	  network_followers (follower_user_id, following_user_id, status)
	  VALUES(:follower_user_id, :following_user_id, :status)
	  ON CONFLICT(follower_user_id, following_user_id) DO NOTHING
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

func (r *Repository) DeleteFollow(params *RemoveFollowParams) error {
	query := `
	DELETE FROM network_followers
	WHERE follower_user_id = :follower_user_id AND following_user_id = :following_user_id
	`
	_, err := r.db.NamedExec(query, params)
	return err
}

func (r *Repository) AcceptFollow(params *AcceptFollowParams) error {
	query := `
	UPDATE network_followers
	SET status = 'accepted' 
	WHERE follower_user_id = :follower_user_id AND following_user_id = :following_user_id 
	`
	_, err := r.db.NamedExec(query, params)
	return err
}

func (r *Repository) GetConnection(user1ID, user2ID int) (*Connection, error) {
	query := `
		SELECT *
		FROM network_connections
	  WHERE user_1_ID = $1 AND user_2_ID = $2
	`
	connection := &Connection{}

	err := r.db.Get(connection, query, user1ID, user2ID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}

	return connection, nil
}

func (r *Repository) InsertConnection(params *InsertConnectionParams) (*Connection, error) {
	query := `
		INSERT INTO 
	  network_connections(user_1_id, user_2_id, requested_by_user_id)
	VALUES(:user_1_id, :user_2_id, :requested_by_user_id)
	  RETURNING *
	`
	query, args, err := sqlx.Named(query, params)
	if err != nil {
		return nil, err
	}

	query = r.db.Rebind(query)

	connection := &Connection{}
	err = r.db.Get(connection, query, args...)
	if err != nil {
		return nil, err
	}
	return connection, nil
}

func (r *Repository) AcceptConnection(ID int) error {
	query := `
		UPDATE network_connections
	  SET status = 'accepted'
	  WHERE id = $1	`
	_, err := r.db.Exec(query, ID)
	return err
}

func (r *Repository) DeleteConnection(ID int) error {
	query := `
		DELETE FROM network_connections WHERE id = $1
	`
	_, err := r.db.Exec(query, ID)
	return err
}
