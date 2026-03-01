# Refactor Todos

## GetLast Missing user_id Filter

`repository.go` queries by `status` only, so it could return another user's last todo position. Needs `AND user_id = $2`.

## CreateTodo Missing Response

Handler succeeds silently with no HTTP response sent to the client. Should return 201 Created.

## UpdateTodo Missing Response

Handler succeeds silently with no HTTP response sent to the client. Should return 204 No Content.

## File Naming Inconsistency

Todos uses `handlers.go` (plural) while other domains use `handler.go` (singular). Standardize to singular.

## Inconsistent SQL Query Style

Some queries use positional `$1, $2`, others use named `:param` with rebinding. Pick one approach and standardize.
