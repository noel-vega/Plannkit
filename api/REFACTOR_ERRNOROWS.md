# Refactor: Replace `nil, nil` Pattern with Domain Errors

## Description

Repositories currently catch `sql.ErrNoRows` and return `nil, nil`, forcing every caller to nil-check or risk a nil pointer panic. This refactor replaces that pattern with explicit domain errors (`ErrNotFound`), consistent with the existing `ErrEmailExists` and `ErrInvalidCredentials` patterns.

### Why

- `nil, nil` is ambiguous — callers must know that nil means "not found"
- Forgetting a nil check is a silent bug that causes runtime panics
- Services and handlers shouldn't need to import `database/sql`
- `errors.Is(err, ErrNotFound)` is self-documenting and grep-able

## Current State

### `return nil, nil` in repositories (5 locations)

| File | Method | Line |
|---|---|---|
| `internal/user/repository.go` | `GetByID` | 68 |
| `internal/user/repository.go` | `GetByEmail` | 82 |
| `internal/user/repository.go` | `GetByEmailWithPassword` | 96 |
| `internal/user/repository.go` | `GetUserByUsername` | 109 |
| `internal/network/repository.go` | `GetFollower` | 38 |

### Nil checks on return values in services/handlers (5 locations)

| File | Method | What it does |
|---|---|---|
| `internal/network/service.go` | `IsFollowing` | `if follower == nil` → returns false |
| `internal/network/service.go` | `GetUserProfile` | `if user == nil` → returns nil, nil |
| `internal/network/handler.go` | `GetUserProfile` | `if profile == nil` → 404 |
| `internal/auth/handlers.go` | `Me` | `if me == nil` → 404 |
| `internal/user/services.go` | `CreateUser` | `if existingUser != nil` → ErrEmailExists |

### `sql.ErrNoRows` checked directly in services/handlers (3 locations)

| File | Method | What it does |
|---|---|---|
| `internal/user/services.go` | `CreateUser` | `!errors.Is(err, sql.ErrNoRows)` guard |
| `internal/finances/service.go` | `SpaceMembershipExists` | converts to `false, nil` |
| `internal/finances/handler.go` | `GetGoal` | converts to 404 |

## Plan

### 1. Create a shared `apperrors` package

Create `internal/apperrors/errors.go` with:

```go
package apperrors

import "errors"

var ErrNotFound = errors.New("not found")
```

A shared package avoids circular imports between `user`, `network`, `auth`, etc.

### 2. Update repositories to return `ErrNotFound`

Replace every `return nil, nil` after an `sql.ErrNoRows` check with `return nil, apperrors.ErrNotFound`.

**Files:**
- `internal/user/repository.go` — `GetByID`, `GetByEmail`, `GetByEmailWithPassword`, `GetUserByUsername`
- `internal/network/repository.go` — `GetFollower`

### 3. Update services that nil-check repository results

Replace nil checks with `errors.Is(err, apperrors.ErrNotFound)` handling.

**`internal/network/service.go`:**
- `IsFollowing` — catch `ErrNotFound` → return `false, nil` (not finding a follower row is expected, not an error)
- `GetUserProfile` — catch `ErrNotFound` from `GetUserByUsername` → return `nil, apperrors.ErrNotFound`

**`internal/user/services.go`:**
- `CreateUser` — replace `sql.ErrNoRows` check with `ErrNotFound` check for the existing user lookup

### 4. Update handlers to map `ErrNotFound` → 404

Replace `if result == nil` checks with `errors.Is(err, apperrors.ErrNotFound)`.

**Files:**
- `internal/network/handler.go` — `GetUserProfile`
- `internal/auth/handlers.go` — `Me`
- `internal/finances/handler.go` — `GetGoal` (already checks `sql.ErrNoRows` directly, switch to `apperrors.ErrNotFound`)

### 5. Remove `database/sql` imports from non-repository files

After the refactor, only repository files should import `database/sql`. Verify and clean up:
- `internal/user/services.go`
- `internal/finances/service.go`
- `internal/finances/handler.go`

## Order of operations

1. Create `internal/apperrors/errors.go`
2. Update repositories (no callers break — they just get an error instead of nil now)
3. Update services to handle `ErrNotFound` instead of nil-checking
4. Update handlers to map `ErrNotFound` to 404
5. Clean up unused `database/sql` imports
6. Test all affected endpoints
