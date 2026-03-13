# RBAC — Role-Based Access Control for Finance Spaces

## Roles

- `owner` — full control, assigned to the space creator
- `editor` — can create and delete resources, cannot manage members
- `viewer` — read-only access

## Permission Matrix

| Action                          | Owner | Editor | Viewer |
|---------------------------------|-------|--------|--------|
| Delete space                    | Y     |        |        |
| Invite/remove members           | Y     |        |        |
| Create/delete goals & expenses  | Y     | Y      |        |
| Add contributions               | Y     | Y      |        |
| Read everything                 | Y     | Y      | Y      |

## How It Works

### Middleware Chain

1. `VerifySpaceMembership` — runs on all `/finances/spaces/:spaceID/*` routes. Confirms the user is an accepted member and sets `spaceID` and `spaceRole` in the request context.
2. `RequireRole(roles ...string)` — applied per-route. Checks `spaceRole` against the allowed roles and aborts with 403 if insufficient.

Read-only routes (`List*`, `Get*`) do not use `RequireRole` since any accepted member can read.

### Invite Flow

- Only owners can invite (enforced by `RequireRole("owner")` on the route)
- Invited members must be a connection of the inviter
- Invited role must be `editor` or `viewer` (validated in `InviteToSpace` service)
- New members start with status `pending` until they accept

### Constraints

- Owners cannot be deleted from a space (`ErrCannotDeleteOwner`)
- A space creator is always inserted as `owner` with status `accepted`
