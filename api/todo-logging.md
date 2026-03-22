# Structured Logging Implementation Plan

## Why Are We Doing This?

Right now, the API uses `gin.Default()` which gives us Gin's built-in text logger. Errors like
`missing destination name routine_id in *[]habits.Habit` show up as raw text in stdout with no
context — no user ID, no request ID, no file/line number, no way to correlate an error to the
request that caused it. In production, debugging means grepping through walls of unstructured text.

The goal: **every log line is structured JSON with enough context to trace any error back to its
exact origin — which request, which user, which file, which line.**

---

## What We're Using and Why

### `slog` (Go stdlib, 1.21+)

We're using `slog` over third-party libraries like `zap` or `zerolog` because:

- **Zero dependencies** — it's in the standard library. No version conflicts, no supply chain risk.
- **Good enough performance** — unless you're logging millions of lines/sec, `slog` is fine.
- **Ecosystem convergence** — the Go community is standardizing on `slog`. Libraries are starting
  to accept `*slog.Logger` as a parameter, making interop easier over time.
- **`AddSource: true`** — gives us file and line number automatically. No manual annotation.

### Replace Gin's Logger (not supplement it)

We're replacing Gin's default logger entirely rather than running both side by side. Reason:
two loggers means two formats in the same output stream. You can't pipe mixed text + JSON through
`jq` or ingest it cleanly into a log aggregator. One format, one logger, one source of truth.

---

## Implementation Steps

### Step 1: Create the Logger Package

**File:** `internal/logger/logger.go`

Create a small package that initializes a `*slog.Logger` with:

- `slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{AddSource: true})`
- A package-level `New()` function that returns the configured logger
- Optionally respect an env var (e.g., `LOG_LEVEL`) to control verbosity:
  - `"debug"` → `slog.LevelDebug` (local dev, verbose)
  - `"info"` → `slog.LevelInfo` (production default)
  - `"error"` → `slog.LevelError` (quiet mode)

**Philosophy:** This is a thin wrapper, not an abstraction. Don't over-engineer it. The point is a
single place to configure the logger so every part of the app gets the same settings.

---

### Step 2: Create Request ID Middleware

**File:** `internal/middleware/request_id.go`

Middleware that:

1. Generates a unique request ID (use `uuid` or even a simple random string)
2. Stores it in the Gin context: `c.Set("requestID", id)`
3. Adds it to the response headers: `X-Request-ID` (useful for clients/debugging)

**Why a request ID?** When an error happens, you need to trace *everything* that happened during
that request. User ID tells you *who*, request ID tells you *which specific request*. If a user
hits `/habits` 10 times and one fails, the request ID is how you find the failing one.

---

### Step 3: Create a Gin Request Logger Middleware (replaces Gin's default)

**File:** `internal/middleware/logger.go`

This middleware replaces Gin's `Logger()`. It should:

1. Run `c.Next()` to process the request
2. After the request completes, log a single structured entry with:
   - `method` — GET, POST, etc.
   - `path` — the request URL
   - `status` — HTTP status code
   - `latency` — how long the request took
   - `ip` — client IP
   - `request_id` — from context (Step 2)
   - `user_id` — from context (set by auth middleware, may be empty for unauthenticated routes)
   - `error` — if any Gin errors were recorded (from `c.Errors`)
3. Log level based on status:
   - 5xx → `slog.Error`
   - 4xx → `slog.Warn`
   - Everything else → `slog.Info`

**Philosophy:** This is an *observability boundary*. Every request that enters and exits the API
gets logged exactly once with all the context you need. Individual handlers should NOT log
"request received" or "request completed" — that's this middleware's job.

---

### Step 4: Switch from `gin.Default()` to `gin.New()`

**File:** `cmd/server/main.go`

`gin.Default()` automatically adds Gin's `Logger()` and `Recovery()` middleware. Switch to
`gin.New()` and explicitly add:

1. `gin.Recovery()` — keep the panic recovery (or write a custom one that uses slog, optional)
2. Your request ID middleware (Step 2)
3. Your slog-based request logger middleware (Step 3)
4. CORS middleware (already exists)

```go
// Before
router := gin.Default()

// After
router := gin.New()
router.Use(gin.Recovery())
router.Use(middleware.RequestID())
router.Use(middleware.Logger(logger))
router.Use(cors.New(...))
```

**Order matters:** Request ID must come before Logger so the logger can read the ID from context.

---

### Step 5: Add Error Wrapping at Service and Repository Boundaries

**Files:** All `repository.go` and `service.go` files (start with habits, apply to others over time)

Wrap errors with context as they cross layer boundaries:

```go
// repository.go
func (r *Repository) GetHabits(userID string) ([]Habit, error) {
    err := r.db.Select(&habits, query, userID)
    if err != nil {
        return nil, fmt.Errorf("habits.Repository.GetHabits: %w", err)
    }
    return habits, nil
}

// service.go
func (s *Service) GetHabits(userID string) ([]Habit, error) {
    habits, err := s.repo.GetHabits(userID)
    if err != nil {
        return nil, fmt.Errorf("habits.Service.GetHabits: %w", err)
    }
    return habits, nil
}
```

**Philosophy:** `%w` (wrapping) preserves the original error so `errors.Is()` and `errors.As()`
still work. The string prefix creates a breadcrumb trail:
`habits.Service.GetHabits: habits.Repository.GetHabits: missing destination name routine_id...`

Now instead of a raw DB error, you see the exact path it traveled through your code.

**Don't overdo it:** Only wrap at *boundaries* (repo → service → handler). Don't wrap every single
function call — that's noise. The goal is to know which *layer* and *method* the error came from.

---

### Step 6: Log Errors in Handlers with Context

**Files:** All `handler.go` files

When a handler encounters an error, log it with the slog logger before returning the HTTP response.
Include contextual fields that are specific to that operation:

```go
func (h *Handler) GetHabits(c *gin.Context) {
    userID := httputil.UserID(c)
    habits, err := h.service.GetHabits(userID)
    if err != nil {
        slog.ErrorContext(c.Request.Context(), "failed to get habits",
            "error", err,
            "user_id", userID,
        )
        c.AbortWithStatus(http.StatusInternalServerError)
        return
    }
    c.JSON(http.StatusOK, habits)
}
```

**Why log in the handler AND the middleware?** Different purposes:

- **Middleware log** — "a request happened, here's the summary" (status, latency, path)
- **Handler log** — "here's what went wrong specifically" (the error, domain-specific context)

The middleware gives you the 10,000-foot view. The handler log gives you the details.

---

### Step 7: Pass Logger via Context or Dependency Injection

**Decision point — pick one approach:**

**Option A: Use `slog.SetDefault()` and call `slog.Info()` / `slog.Error()` globally**
- Simplest. Set the default logger once in `main.go`, call `slog.Error(...)` anywhere.
- Fine for most projects this size.

**Option B: Pass `*slog.Logger` as a dependency through structs**
- More explicit. Each service/handler receives the logger in its constructor.
- Better for testing (you can inject a no-op logger in tests).
- More wiring code.

**Recommendation for this project:** Start with Option A. It's less plumbing and you can always
switch to Option B later if you need testability. Set the default in `main.go`:

```go
logger := logger.New()
slog.SetDefault(logger)
```

Now `slog.Info(...)`, `slog.Error(...)` etc. work everywhere with your configured settings.

---

## What a Logged Error Will Look Like After

```json
{
  "time": "2026-03-22T16:27:12.000Z",
  "level": "ERROR",
  "source": {
    "function": "plannkit/api/internal/habits.(*Handler).GetHabits",
    "file": "internal/habits/handler.go",
    "line": 38
  },
  "msg": "failed to get habits",
  "error": "habits.Service.GetHabits: habits.Repository.GetHabits: missing destination name routine_id in *[]habits.Habit",
  "user_id": "abc-123"
}
```

```json
{
  "time": "2026-03-22T16:27:12.001Z",
  "level": "ERROR",
  "msg": "request completed",
  "method": "GET",
  "path": "/habits",
  "status": 500,
  "latency": "1.73ms",
  "ip": "::1",
  "request_id": "req-a1b2c3",
  "user_id": "abc-123"
}
```

From these two log lines you know: what failed, where in the code, which user, which request,
and how long it took. You can search by any of these fields.

---

## Summary Checklist

- [ ] **Step 1** — Create `internal/logger/logger.go` (configure slog with JSON + source)
- [ ] **Step 2** — Create `internal/middleware/request_id.go`
- [ ] **Step 3** — Create `internal/middleware/logger.go` (slog-based Gin request logger)
- [ ] **Step 4** — Update `cmd/server/main.go` (swap `gin.Default()` → `gin.New()` + new middleware)
- [ ] **Step 5** — Add `fmt.Errorf("layer.Method: %w", err)` wrapping in repos/services
- [ ] **Step 6** — Add `slog.ErrorContext()` calls in handlers
- [ ] **Step 7** — Set `slog.SetDefault()` in `main.go`
