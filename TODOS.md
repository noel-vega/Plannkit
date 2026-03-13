# Space Members / Invite Flow TODOs

## Backend

### RBAC — Role-Based Access Control for Finance Spaces

#### Roles: `owner`, `editor`, `viewer`

| Action                          | Owner | Editor | Viewer |
|---------------------------------|-------|--------|--------|
| Delete space                    | Y     |        |        |
| Invite/remove members           | Y     |        |        |
| Create/delete goals & expenses  | Y     | Y      |        |
| Add contributions               | Y     | Y      |        |
| Read everything                 | Y     | Y      | Y      |

#### 1. DB migration — add `role` column to `finance_spaces_members`

- Add `role` column with CHECK constraint: `role IN ('owner', 'editor', 'viewer')`
- Default to `'viewer'` for new members (invited via `InviteToSpace`)
- Migrate existing rows: set `role = 'owner'` where `user_id` matches `finance_spaces.user_id`
- Consider removing `user_id` from `finance_spaces` once ownership is role-based

#### 2. Update `SpaceMember` type and params

- Add `Role` field to `SpaceMember` struct in `types.go`
- Update `InsertSpaceMemberParams` to include `Role`
- Update `CreateSpace` service to insert the creator as `role = 'owner'`
- Update `InviteToSpace` service to insert invited members with a default role (e.g., `'editor'`)

#### 3. Expose role in `VerifySpaceMembership` middleware

- Middleware already fetches `SpaceMember` — set `c.Set("spaceRole", member.Role)` alongside `spaceID`
- Downstream handlers can read the role from the context

#### 4. Add `RequireRole` helper function

- Helper that checks `c.GetString("spaceRole")` against allowed roles
- Aborts with 403 if the caller's role is insufficient
- Signature: `func RequireRole(c *gin.Context, roles ...string) bool`

#### 5. Add role checks to handlers

- `DeleteSpace` — require `owner`
- `InviteToSpace` — require `owner`
- `DeleteSpaceMember` — require `owner`
- `CreateGoal`, `CreateExpense`, `CreateIncomeSource` — require `owner` or `editor`
- `CreateGoalContribution` — require `owner` or `editor`
- `DeleteGoalContribution`, `DeleteExpense`, `DeleteIncome` — require `owner` or `editor`
- Read endpoints (`List*`, `Get*`) — any accepted member (no role check needed beyond middleware)

#### 6. Add endpoint to update a member's role

- `PATCH /finances/spaces/:spaceID/members/:userID/role`
- Only `owner` can change roles
- Prevent owner from demoting themselves (would orphan the space)
- Add service method, repo method, handler, and types

#### 7. Remove `user_id` from `finance_spaces` table (optional)

- Once ownership is determined by role on `finance_spaces_members`, `user_id` on `finance_spaces` is redundant
- Remove `GetSpaceByID` queries that filter by `user_id`
- Update `DeleteSpace` to check role instead of `space.user_id`

## Frontend

### 10. Implement `finances.members` API methods

- `api.ts:21-30` — all three methods are empty stubs
- `invite`: POST `/finances/spaces/:spaceID/members` with `{ userId }`
- `list`: GET `/finances/spaces/:spaceID/members`
- `delete`: DELETE `/finances/spaces/:spaceID/members/:userID`
- Add Zod schema for `SpaceMember` type

### 11. Add `accept` method to `finances.members`

- PATCH `/finances/spaces/:spaceID/members`
- No body needed — userID comes from auth

### 12. Build out `ManageMembersSheet` component

- `finance-space-switcher.tsx` — currently just a shell with header
- List current members with status
- Add invite form (search/select from connections)
- Add remove member action (owner only)

### 13. Pending invites UI

- Decide where invitees see pending invites — dedicated section or notification
- Accept/decline buttons
- Could be a section in the finances landing page or a global notification area

## Testing

### 14. End-to-end invite flow

- Owner invites a connection → pending membership created
- Invitee accepts → status updated to accepted
- Accepted member can access space routes

### 15. Edge cases

- Inviting a non-connection → 403 with `ErrNotConnected`
- Non-owner inviting → 403 with `ErrNotSpaceOwner`
- Duplicate invite → handle gracefully (400 or 409)
- Accepting an already-accepted membership → handle gracefully
- Owner removing themselves → prevent or handle orphaned space
- Invitee declining → remove the pending membership row
