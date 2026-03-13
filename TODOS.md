# Space Members / Invite Flow TODOs

## Backend

### RBAC — Role-Based Access Control for Finance Spaces

#### 1. Add endpoint to update a member's role

- `PATCH /finances/spaces/:spaceID/members/:userID/role`
- Only `owner` can change roles
- Prevent owner from demoting themselves (would orphan the space)
- Add service method, repo method, handler, and types

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
