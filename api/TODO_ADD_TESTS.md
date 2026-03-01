# Add Tests

There are currently zero `_test.go` files across the entire API. The service layer introduced in the recent refactor is the perfect seam for unit tests.

## Where to Start

The service layer sits between handlers and repositories, making it the easiest layer to test in isolation. Services accept repositories as dependencies via constructors — define interfaces for the repositories and pass in mocks during tests.

## Domains to Cover

- **habits** — `service.go` has 9 methods (CRUD for habits and contributions)
- **todos** — `service.go` has 5 methods (CRUD + position calculation)
- **auth** — `service.go` has 9 methods (signup, signin, token generation/validation)

## Example Approach

1. Define a repository interface in the service file (or a separate file)
2. Create a mock implementation for tests
3. Write table-driven tests against the service methods

```go
// habits/service_test.go

type mockRepository struct {
    habits        []Habit
    contributions []Contribution
    err           error
}

func (m *mockRepository) ListHabits(userID int) ([]Habit, error) {
    return m.habits, m.err
}

func TestListHabits_ReturnsHabits(t *testing.T) {
    repo := &mockRepository{
        habits: []Habit{{ID: 1, Name: "Exercise"}},
    }
    svc := NewService(repo)

    habits, err := svc.ListHabits(1)

    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if len(habits) != 1 {
        t.Fatalf("expected 1 habit, got %d", len(habits))
    }
}
```
