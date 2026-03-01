# N+1 Query Problem in ListHabits

## What is the N+1 Problem?

The N+1 problem is one of the most common performance pitfalls in backend development. It happens when your code makes **1 query** to fetch a list of items, then makes **N additional queries** (one per item) to fetch related data for each one.

The "N+1" name comes from the total query count: **1** (the initial list) **+ N** (one per item).

## Where It Happens in Our Code

Look at `handler.go:91-119` — the `ListHabits` handler:

```go
func (handler *Handler) ListHabits(c *gin.Context) {
    // Query 1: Get all habits for this user
    habits, err := handler.habitsService.ListHabits(c.MustGet("userID").(int))

    habitsWithContributions := []HabitWithContributions{}
    for _, h := range habits {
        // Query 2, 3, 4 ... N+1: Get contributions for EACH habit
        contributions, err := handler.habitsService.ListContributions(params)

        habitsWithContributions = append(habitsWithContributions, HabitWithContributions{
            ...
            Contributions: contributions,
        })
    }
    c.JSON(http.StatusOK, habitsWithContributions)
}
```

Under the hood, this translates to these SQL queries:

```sql
-- Query 1: fetch all habits
SELECT * FROM habits WHERE user_id = 1;
-- returns 5 habits with IDs: 10, 11, 12, 13, 14

-- Query 2: fetch contributions for habit 10
SELECT * FROM habits_contributions WHERE habit_id = 10 AND user_id = 1;

-- Query 3: fetch contributions for habit 11
SELECT * FROM habits_contributions WHERE habit_id = 11 AND user_id = 1;

-- Query 4: fetch contributions for habit 12
SELECT * FROM habits_contributions WHERE habit_id = 12 AND user_id = 1;

-- Query 5: fetch contributions for habit 13
SELECT * FROM habits_contributions WHERE habit_id = 13 AND user_id = 1;

-- Query 6: fetch contributions for habit 14
SELECT * FROM habits_contributions WHERE habit_id = 14 AND user_id = 1;
```

**5 habits = 6 queries.** That might seem fine, but it scales linearly. **50 habits = 51 queries. 200 habits = 201 queries.** Each query has network round-trip overhead to the database, even if the query itself is fast.

## Why It's a Problem

Each query has a cost beyond just the SQL execution time:

1. **Network round-trip** — even on localhost, each query goes through the DB connection, gets parsed, executed, and returned. This latency adds up.
2. **Connection pool pressure** — each query ties up a connection. At high concurrency, you can exhaust your pool.
3. **Linear scaling** — response time grows proportionally with the number of habits. What's 50ms with 5 habits becomes 500ms with 50.

## How to Fix It

### Option A: JOIN Query (Single Query)

Fetch habits and contributions together in one query using a LEFT JOIN. This is the most common fix.

Add a new repository method:

```go
// repository.go
func (r *Repository) ListHabitsWithContributions(userID int) ([]Habit, []Contribution, error) {
    habits := []Habit{}
    err := r.db.Select(&habits, "SELECT * FROM habits WHERE user_id = $1", userID)
    if err != nil {
        return nil, nil, err
    }

    contributions := []Contribution{}
    err = r.db.Select(&contributions,
        "SELECT * FROM habits_contributions WHERE user_id = $1", userID)
    if err != nil {
        return nil, nil, err
    }

    return habits, contributions, nil
}
```

Then group contributions by habit in the service layer:

```go
// service.go
func (s *Service) ListHabitsWithContributions(userID int) ([]HabitWithContributions, error) {
    habits, contributions, err := s.habitsRepository.ListHabitsWithContributions(userID)
    if err != nil {
        return nil, err
    }

    // Build a map of habitID -> []Contribution
    contributionsByHabit := make(map[int][]Contribution)
    for _, c := range contributions {
        contributionsByHabit[c.HabitID] = append(contributionsByHabit[c.HabitID], c)
    }

    // Assemble the response
    result := make([]HabitWithContributions, len(habits))
    for i, h := range habits {
        contribs := contributionsByHabit[h.ID]
        if contribs == nil {
            contribs = []Contribution{}
        }
        result[i] = HabitWithContributions{
            ID:                h.ID,
            Name:              h.Name,
            Icon:              h.Icon,
            Description:       h.Description,
            CompletionType:    h.CompletionType,
            CompletionsPerDay: h.CompletionsPerDay,
            Contributions:     contribs,
        }
    }

    return result, nil
}
```

**Result: Always 2 queries**, no matter how many habits exist.

### Option B: Single JOIN Query

You can also do this in a single SQL query with a LEFT JOIN, but it requires manually scanning rows since sqlx can't auto-map nested structs from a join:

```sql
SELECT h.*, c.id as contribution_id, c.completions, c.date
FROM habits h
LEFT JOIN habits_contributions c ON c.habit_id = h.id AND c.user_id = h.user_id
WHERE h.user_id = $1
```

This is 1 query total but adds complexity in Go to scan and group the flat rows back into nested structs. Option A (2 queries) is the simpler and more readable approach.

## Summary

| Approach | Queries | Complexity |
|----------|---------|------------|
| Current (N+1) | 1 + N | Simple code, bad performance |
| Option A (2 queries + map) | 2 | Moderate code, good performance |
| Option B (JOIN) | 1 | Complex scanning, best performance |

Option A is the recommended fix — it's easy to understand, the performance improvement is massive, and it keeps the repository methods clean.
