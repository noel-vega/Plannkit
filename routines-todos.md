# Routines Implementation Plan

## Overview
Add a `GET /habits/routines` endpoint that returns routines with nested habits and standalone habits, all ordered via fractional indexing (`fracdex`). Add position update endpoints for reordering.

**Target response shape for `GET /habits/routines`:**
```json
{
  "routines": [
    { "id": 1, "name": "Morning", "position": "a0V", "habits": [{ ...habitWithContributions }] }
  ],
  "habits": [{ ...standaloneHabitWithContributions }]
}
```

---

## Step 1: Migration

Create `db/migrations/20260323000000_habits_position.up.sql` and `.down.sql`.

- Add `position TEXT COLLATE "C" NOT NULL DEFAULT ''` to both `habits_routines` and `habits`
- Down migration drops the column from both tables
- `COLLATE "C"` ensures binary/lexicographic ordering (same as todos)

---

## Step 2: Types — `api/internal/habits/types.go`

**Modify existing structs:**
- `Habit` — add `Position` (string, db:"position")
- `Routine` — add `Position` (string, db:"position")
- `CreateHabitRequestBody` — add `RoutineID` (*int)
- `CreateHabitParams` — add `RoutineID` (*int, db:"routine_id") and `Position` (string, db:"position")
- `InsertRoutineParams` — add `Position` (string, db:"position")

**Add new types:**
- `RoutineWithHabits` — embeds `Routine` + `Habits []HabitWithContributions`
- `ListRoutinesResponse` — `Routines []RoutineWithHabits` + `Habits []HabitWithContributions`
- `UpdateHabitPositionBody` — `AfterPosition`, `BeforePosition`, `RoutineID` (*int, for moving between groups)
- `UpdateHabitPositionParams` — same fields + `ID`, `UserID`
- `UpdateRoutinePositionBody` — `AfterPosition`, `BeforePosition`
- `UpdateRoutinePositionParams` — same fields + `ID`, `UserID`

---

## Step 3: Repository — `api/internal/habits/repository.go`

Add `roci.dev/fracdex`, `database/sql`, and `apperrors` imports (reference: `todos/repository.go`).

**New methods:**
- `GetLastRoutine(userID)` — SELECT last routine by position DESC LIMIT 1, return `apperrors.ErrNotFound` on no rows
- `GetLastHabitInGroup(userID, routineID *int)` — SELECT last habit by position in a routine (or standalone when nil), return `apperrors.ErrNotFound` on no rows
- `ListRoutines(userID)` — SELECT all routines ORDER BY position ASC
- `UpdateHabitPosition(params)` — compute `fracdex.KeyBetween(after, before)`, UPDATE position + routine_id
- `UpdateRoutinePosition(params)` — compute `fracdex.KeyBetween(after, before)`, UPDATE position

**Modify existing methods:**
- `CreateHabit` — before insert, call `GetLastHabitInGroup` to compute position via `fracdex.KeyBetween`. Add `routine_id` and `position` to the INSERT query
- `InsertRoutine` — before insert, call `GetLastRoutine` to compute position via `fracdex.KeyBetween`. Add `position` to the INSERT query
- `ListHabits` — add `ORDER BY position ASC`

---

## Step 4: Service — `api/internal/habits/service.go`

**New methods:**
- `ListRoutinesWithHabits(userID)` — calls `ListRoutines`, `ListHabitsAndContributions`. Groups contributions by habit (existing pattern). Partitions habits: those with `routine_id` go into their routine's habits slice, those without go into top-level habits. Returns `ListRoutinesResponse`
- `UpdateHabitPosition(params)` — delegates to repository
- `UpdateRoutinePosition(params)` — delegates to repository

---

## Step 5: Handler — `api/internal/habits/handler.go`

**New handlers:**
- `ListRoutinesWithHabits` — call service, return JSON 200
- `UpdateHabitPosition` — parse habitID param, bind body, build params, call service, return 204
- `UpdateRoutinePosition` — parse routineID param, bind body, build params, call service, return 204

**Modify:**
- `CreateHabit` — pass `body.RoutineID` into `CreateHabitParams`

---

## Step 6: Routes — `api/internal/server/routes.go`

Add after existing `POST /habits/routines` (line 69). Keep GET/PATCH routine routes **before** `GET /habits/:habitID` so Gin doesn't match "routines" as a habitID.

| Method | Path | Handler |
|--------|------|---------|
| GET | `/habits/routines` | `ListRoutinesWithHabits` |
| PATCH | `/habits/routines/:routineID/position` | `UpdateRoutinePosition` |
| PATCH | `/habits/:habitID/position` | `UpdateHabitPosition` |

---

## Verification

1. `migrate -path db/migrations -database $DB_URL up`
2. `cd api && go build ./...`
3. Create a routine → verify response includes position
4. Create a habit with routineId → verify position and routineId in response
5. Create a standalone habit (no routineId) → verify position assigned
6. `GET /habits/routines` → verify grouped response shape
7. `PATCH /habits/:id/position` → verify reorder and cross-routine move
8. `PATCH /habits/routines/:id/position` → verify routine reorder
