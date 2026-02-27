# Refactor: General Codebase Improvements

## 1. Avatar Upload — No File Type Validation

**File:** `internal/user/handlers.go:29`

The extension is extracted from the filename but never validated. Any file type (`.exe`, `.sh`, etc.) gets stored.

**Fix:** Validate the extension against an allowlist before saving:

```go
allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true}
ext := filepath.Ext(header.Filename)
if !allowed[strings.ToLower(ext)] {
    c.AbortWithStatus(http.StatusBadRequest)
    return
}
```

---

## 2. Inconsistent Architecture — Missing Service Layer

**Files:**
- `internal/todos/handlers.go` — handler calls repository directly
- `internal/habits/handlers.go` — handler creates repository in constructor

**Other packages** (`user`, `network`, `finances`) follow handler → service → repo.

**Why it matters:** Business logic ends up in handlers, making it harder to test and reuse. As these packages grow, extracting a service layer later means touching every handler method.

**Fix:** Add `todos.Service` and `habits.Service` that sit between handler and repository, matching the pattern in `user`, `network`, and `finances`.

---

## 3. Exported DB Field on TodosRepo

**File:** `internal/todos/repository.go:12`

```go
type TodosRepo struct {
    DB *sqlx.DB  // exported
}
```

Every other repo uses unexported `db *sqlx.DB`. This exposes the database connection to anything that holds a `TodosRepo` reference.

**Fix:** Rename to `db` and update all references within the package (`r.DB` → `r.db`).

---

## 4. Inconsistent Naming — TodosRepo vs Repository

**File:** `internal/todos/repository.go:11`

Todos uses `TodosRepo` while every other package uses `Repository`. Minor but worth standardizing.

---

## Order of Operations

1. Avatar validation (quick, standalone fix)
2. Rename `TodosRepo.DB` → `db` and `TodosRepo` → `Repository` (mechanical refactor)
3. Extract `todos.Service` and `habits.Service` (larger, can be done incrementally)
