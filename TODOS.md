# Space Members / Invite Flow TODOs

## Backend

### 1. Implement `AcceptSpaceInvite` handler
- `handler.go:356` — currently an empty function
- Parse `spaceID` from URL param
- Get `userID` from auth context
- Call service method and return updated member
- Handle errors: not found (404), already accepted (409)

### 2. Add `AcceptSpaceInvite` service method
- Look up the membership by userID + spaceID
- Verify status is `pending` — return error if already accepted or not found
- Call repository to update status to `accepted`
- Consider adding `ErrAlreadyAccepted` and `ErrInviteNotFound` errors

### 3. Add `UpdateSpaceMemberStatus` repository method
- `UPDATE finance_spaces_members SET status = :status WHERE user_id = :user_id AND finance_space_id = :finance_space_id`
- Return the updated `SpaceMember`

### 4. Add owner-only check to `InviteToSpace`
- Before checking connection, verify the requesting `userID` matches `space.user_id`
- Need to fetch the space first: `s.repository.GetSpaceByID`
- Return 403 if non-owner tries to invite
- Consider adding `ErrNotSpaceOwner` error in `errors.go`

### 5. Clean up old unused methods
- Check if `CreateSpaceMembership`, `GetSpaceMembership`, `ListSpaceMemberships` still exist in repository.go
- Remove any dead code references across the package

### 6. Remove `finances` import from `user/services.go`
- Verify `user` package no longer imports `finances`
- Clean up `financesService` field from `user.Service` struct if still present

### 7. DB migration for `status` column
- Verify `20260214192150_finances.up.sql` properly adds `status` column with default `'pending'`
- Consider adding a CHECK constraint: `status IN ('pending', 'accepted')`
- Write the corresponding `.down.sql` migration

### 8. Rename `CreateSpaceMemberParams` → `InviteToSpaceParams`
- Update struct in `types.go`
- Update references in service and handler

### 9. Rename `CreateSpaceMemberBody` → `InviteToSpaceBody`
- Update struct in `types.go`
- Update reference in handler

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
