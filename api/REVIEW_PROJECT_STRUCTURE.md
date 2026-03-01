# Project Structure Review

## What's working well

- **Consistent layered architecture** — Handler → Service → Repository across packages. After the refactor, todos and habits now match the rest. This is the right pattern for a Go API.
- **Feature-based packaging** — `internal/auth`, `internal/habits`, `internal/todos`, etc. Each domain owns its types, handler, service, and repo. Easy to navigate.
- **`internal/` usage** — Properly prevents external imports of domain code.
- **Dependency injection via constructors** — Services are wired in `routes.go` and passed down. Clean and testable.
- **Shared `apperrors` package** — Centralized error types avoid cross-package dependencies.

## Things worth considering

### 1. `routes.go`, `middlewares.go`, `flags.go` live in the main package

These files sit alongside `main.go` at the top level. As the app grows, this package will accumulate more wiring code. Consider grouping them under something like `internal/server/` or `internal/api/` so `main.go` stays minimal — just bootstrap, start, shutdown.

### 2. `internal/mail/gmail.go` breaks the layered pattern

It has no handler/service/repo split — it's a single file doing OAuth flow and Gmail API calls. If you plan to keep this feature, it would benefit from the same structure. If it's experimental, that's fine for now.

### 3. `internal/storage/` is a concrete implementation, not an interface

Other services depend on it directly. If you ever want to swap local file storage for S3/GCS, defining a `storage.Service` interface would make that easier. This is low priority unless you're planning to deploy somewhere without persistent local disk.

### 4. No test files anywhere

There are 31 Go files and zero `_test.go` files. The service layer you just introduced is the perfect seam for unit tests — you could define repository interfaces and mock them. Not urgent, but the architecture now supports it well.

### 5. N+1 query in `ListHabits`

`habits/handler.go:ListHabits` fetches all habits then loops to fetch contributions one by one. As the dataset grows, this will get slow. The service layer is now the right place to optimize this with a single joined query.

### 6. Feature flags are hardcoded

`flags.go` has booleans set at compile time. Fine for now, but if you want runtime toggling, this could move to config or a database-backed approach.

## Overall

The structure is solid for the size and stage of the project. The domain boundaries are clear, the dependency graph flows in one direction, and the refactor eliminated the main inconsistencies. The biggest wins going forward would be adding tests (the architecture is ready for it) and keeping `main` thin as more features get enabled.
