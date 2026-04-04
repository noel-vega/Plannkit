
-- name: GetHabit :one
SELECT * FROM habits
WHERE id = $1 AND user_id = $2;

-- name: CreateHabit :one
INSERT INTO 
habits (name, description, completion_type, completions_per_day, icon, user_id, routine_id)
VALUES (
  sqlc.arg('name'),
  sqlc.narg('description'),
  sqlc.arg('completion_type'),
  sqlc.arg('completions_per_day'),
  sqlc.arg('icon'),
  sqlc.arg('user_id'),
  sqlc.narg('routine_id')
)
RETURNING *;

-- name: ListHabits :many
SELECT * 
FROM habits 
WHERE user_id = $1
ORDER by position asc;

-- name: UpdateHabit :exec
UPDATE habits SET
  name = sqlc.arg('name'),
  description = sqlc.narg('description'),
  completion_type = sqlc.arg('completion_type'),
  completions_per_day = sqlc.arg('completions_per_day'),
  icon = sqlc.arg('icon')
WHERE ID = sqlc.arg('id') AND user_id = sqlc.arg('user_id');

-- name: DeleteHabit :exec
DELETE FROM habits
WHERE id = $1 AND user_id = $2;

-- name: ListContributions :many
SELECT *
FROM habits_contributions
WHERE user_id = $1;
