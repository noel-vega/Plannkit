
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

-- name: UpdateHabitPosition :one
UPDATE habits
SET position = $1 
WHERE id = $2 
AND routine_id = $3 
AND user_id = $4 
RETURNING *;

-- name: CreateHabitContribution :one
INSERT INTO 
habits_contributions (habit_id, user_id, completions, date) 
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: ListHabitsContributions :many
SELECT *
FROM habits_contributions
WHERE user_id = $1;

-- name: DeleteHabitContribution :exec
DELETE FROM habits_contributions 
WHERE id=$1 AND user_id=$2;

-- name: UpdateHabitContributionCompletions :one
UPDATE habits_contributions
SET completions = $1 
WHERE id = $2 AND user_id = $3
RETURNING *;

-- name: CreateRoutine :one
INSERT INTO
habits_routines (user_id, name, position)
VALUES ($1, $2, $3)
RETURNING *;

-- name: ListRoutines :many
SELECT * 
FROM habits_routines
WHERE user_id = $1
ORDER by position ASC;

-- name: UpdateRoutine :one
UPDATE habits_routines
SET name=$1
WHERE id=$2 AND user_id=$3
RETURNING *;

-- name: DeleteRoutine :execrows
DELETE FROM habits_routines
WHERE id = $1 AND user_id = $2;

-- name: GetLastRoutine :one
SELECT *
FROM habits_routines
WHERE user_id = $1
ORDER BY position DESC
LIMIT 1;

-- name: GetLastRoutineHabit :one
SELECT *
FROM habits
WHERE user_id = $1 AND routine_id = $2
ORDER BY position DESC
LIMIT 1;

-- name: UpdateRoutinePosition :one
UPDATE habits_routines
SET position=$1 
WHERE id=$2 and user_id=$3
RETURNING *;
