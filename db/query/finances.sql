-- name: CreateSpace :one
INSERT INTO 
finance_spaces (name)
VALUES ($1)
RETURNING *;

-- name: ListSpaces :many
SELECT 
s.*, 
m.id as "membership.id",
m.finance_space_id as "membership.finance_space_id",
m.user_id as "membership.user_id",
m.role as "membership.role",
m.status as "membership.status",
m.created_at as "membership.created_at",
m.updated_at as "membership.updated_at",
u.id as "owner.id",
u.username as "owner.username",
u.first_name as "owner.first_name",
u.last_name as "owner.last_name",
u.email as "owner.email",
u.is_private as "owner.is_private",
u.avatar as "owner.avatar",
u.created_at as "owner.created_at",
u.updated_at as "owner.updated_at"
FROM finance_spaces s
JOIN finance_spaces_members m ON m.finance_space_id = s.id AND m.user_id = $1
JOIN finance_spaces_members om ON om.finance_space_id = s.id AND om.role = 'owner'
JOIN users u ON u.id = om.user_id;

-- name: DeleteSpace :execrows
DELETE FROM finance_spaces WHERE id = $1;

-- name: GetSpace :one
SELECT *
FROM finance_spaces
WHERE id=$1;

-- name: UpdateSpaceName :execrows
UPDATE finance_spaces
SET name=$1
WHERE id=$2;

-- name: GetSpaceMember :one
SELECT *
FROM finance_spaces_members
WHERE user_id=$1 AND finance_space_id=$2;

-- name: CreateGoal :one
INSERT INTO 
finance_spaces_goals (user_id, finance_space_id, name, amount, monthly_commitment)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: ListGoals :many
SELECT g.*, COALESCE(SUM(c.amount), 0) AS total_contributions
FROM finance_spaces_goals g
LEFT JOIN finance_spaces_goals_contributions c ON c.finance_space_goal_id = g.id
WHERE g.finance_space_id=$1
GROUP BY g.id;

-- name: DeleteGoal :execrows
DELETE FROM finance_spaces_goals
WHERE id=$1 AND finance_space_id=$2;

-- name: GetGoal :one
SELECT g.*, COALESCE(SUM(c.amount), 0) AS total_contributions
FROM finance_spaces_goals g
LEFT JOIN finance_spaces_goals_contributions c ON c.finance_space_goal_id = g.id
WHERE g.finance_space_id=$1  AND g.id=$2 
GROUP BY g.id;

-- name: CreateGoalContribution :one
INSERT INTO
finance_spaces_goals_contributions (finance_space_id, finance_space_goal_id, user_id, amount, note)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: ListGoalContributions :many
SELECT * 
FROM finance_spaces_goals_contributions
WHERE user_id=$1 
AND finance_space_id=$2
AND finance_space_goal_id=$3;

-- name: DeleteGoalContribution :execrows
DELETE FROM finance_spaces_goals_contributions
WHERE id=$1;

-- name: CreateExpense :one
INSERT INTO 
finance_spaces_expenses (finance_space_id, user_id, name, amount, category, description)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: ListExpenses :many
SELECT * 
FROM finance_spaces_expenses
WHERE user_id=$1 AND finance_space_id=$2;

-- name: DeleteExpense :execrows
DELETE FROM finance_spaces_expenses
WHERE id=$1;

-- name: CreateIncomeSource :one
INSERT INTO 
finance_spaces_income_sources (finance_space_id, user_id, name, amount)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: ListIncomeSources :many
SELECT * 
FROM finance_spaces_income_sources 
WHERE finance_space_id=$1;

-- name: DeleteIncomeSource :execrows
DELETE FROM finance_spaces_income_sources
WHERE id=$1;

-- name: CreateSpaceMember :one
INSERT INTO
finance_spaces_members (user_id, finance_space_id, role, status)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: ListSpaceMembers :many
SELECT * 
FROM finance_spaces_members
WHERE finance_space_id=$1;

-- name: ListSpaceMembersUsers :many
SELECT 
m.*, 
u.id         AS "user.id",
u.username   AS "user.username",
u.first_name AS "user.first_name",
u.last_name  AS "user.last_name",
u.email      AS "user.email",
u.is_private AS "user.is_private",
u.avatar     AS "user.avatar",
u.created_at AS "user.created_at",
u.updated_at AS "user.updated_at"
FROM finance_spaces_members m
JOIN users u ON m.user_id = u.id
WHERE m.finance_space_id=$1;

-- name: DeleteSpaceMember :execrows
DELETE FROM finance_spaces_members
WHERE user_id=$1
AND finance_space_id=$2;

-- name: UpdateSpaceMemberStatus :execrows
UPDATE finance_spaces_members
SET status=$1
WHERE user_id=$2 AND finance_space_id=$3;
