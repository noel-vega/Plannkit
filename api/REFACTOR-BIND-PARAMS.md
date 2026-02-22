# Refactor: Separate Request Body Structs from Repository Params

## Why

When using a single struct for both JSON binding and repository params, `c.Bind()` can overwrite server-controlled fields (`UserID`, `SpaceID`, etc.) if the client sends them in the request body. We fixed this by moving assignments after `c.Bind()`, but the safety depends on **ordering** — a future change could reintroduce the vulnerability.

By splitting into two structs (a body struct for client input, a params struct for the repository), the bypass becomes **structurally impossible**. `c.Bind()` never touches a struct with privileged fields.

## Before (current)

The bind struct contains both client-controlled and server-controlled fields. Safety relies on assigning server fields **after** bind:

```go
func (h *Handler) CreateGoalContribution(c *gin.Context) {
    goalID, _ := strconv.Atoi(c.Param("goalID"))

    params := &CreateGoalContributionParams{}
    c.Bind(params) // could set UserID, SpaceID, GoalID if client sends them

    params.UserID = c.MustGet("userID").(int)   // must come after bind
    params.SpaceID = c.MustGet("spaceID").(int)  // must come after bind
    params.GoalID = goalID                        // must come after bind

    goal, _ := h.service.CreateGoalContribution(params)
    c.JSON(http.StatusCreated, goal)
}
```

## After (target)

A body struct contains **only** what the client is allowed to send. The params struct is assembled explicitly in the handler:

```go
func (h *Handler) CreateGoalContribution(c *gin.Context) {
    goalID, err := strconv.Atoi(c.Param("goalID"))
    if err != nil {
        c.AbortWithError(http.StatusBadRequest, err)
        return
    }

    body := &CreateGoalContributionBody{}
    err = c.Bind(body)
    if err != nil {
        c.AbortWithError(http.StatusBadRequest, err)
        return
    }

    params := &CreateGoalContributionParams{
        UserID:  c.MustGet("userID").(int),
        SpaceID: c.MustGet("spaceID").(int),
        GoalID:  goalID,
        Amount:  body.Amount,
        Note:    body.Note,
    }

    goal, err := h.service.CreateGoalContribution(params)
    if err != nil {
        c.AbortWithError(http.StatusInternalServerError, err)
        return
    }

    c.JSON(http.StatusCreated, goal)
}
```

## Struct changes in `types.go`

For each affected handler, add a body struct with only client-controlled fields. Keep the existing params struct for the repository layer.

### CreateSpace

```go
type CreateSpaceBody struct {
    Name string `json:"name"`
}
```

### CreateGoal

```go
type CreateGoalBody struct {
    Name              string `json:"name"`
    Amount            int    `json:"amount"`
    MonthlyCommitment int    `json:"monthlyCommitment"`
}
```

### CreateGoalContribution

```go
type CreateGoalContributionBody struct {
    Amount int     `json:"amount"`
    Note   *string `json:"note"`
}
```

### CreateExpense

```go
type CreateExpenseBody struct {
    Name        string  `json:"name"`
    Amount      int     `json:"amount"`
    Category    *string `json:"category"`
    Description *string `json:"description"`
}
```

## Handlers to update

All in `internal/finances/handler.go`:

| Handler                    | Line | Server fields that need protecting    |
| -------------------------- | ---- | ------------------------------------- |
| `CreateSpace`              | 22   | `UserID`                              |
| `CreateGoal`               | 65   | `UserID`                              |
| `CreateGoalContribution`   | 126  | `UserID`, `SpaceID`, `GoalID`         |
| `CreateExpense`            | 153  | `UserID`, `SpaceID`                   |

## Checklist

- [ ] Add `CreateSpaceBody` to `types.go`
- [ ] Update `CreateSpace` handler to bind into `CreateSpaceBody`
- [ ] Add `CreateGoalBody` to `types.go`
- [ ] Update `CreateGoal` handler to bind into `CreateGoalBody`
- [ ] Add `CreateGoalContributionBody` to `types.go`
- [ ] Update `CreateGoalContribution` handler to bind into `CreateGoalContributionBody`
- [ ] Add `CreateExpenseBody` to `types.go`
- [ ] Update `CreateExpense` handler to bind into `CreateExpenseBody`
- [ ] Remove `json` tags from server-controlled fields on params structs (optional cleanup)
