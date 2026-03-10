# Network Package TODOs

## Authorization: Track connection initiator

`AcceptConnection` currently allows either user to accept a pending connection request. Store a `requested_by` user ID on the `network_connections` row so that only the recipient can accept. This also applies to `RemoveConnection` — canceling your own pending request, declining someone else's request, and removing an accepted connection may warrant different behavior or at minimum different audit trails.

**Files:** `service.go`, `repository.go`, migration for adding `requested_by` column

## Validate target user exists before inserting connection

`RequestConnection` does not verify that `user2ID` corresponds to a real user. If a client passes a nonexistent user ID, the insert will fail with a foreign key violation and the handler will return a generic 500. Add a `s.userService.GetUserByID` check (like `RequestFollow` already does) to return a proper 404.

**Files:** `service.go`

## Return error bodies to the client

All handlers use `c.AbortWithError`, which sets the status code and logs the error internally but sends an empty response body. The client has no way to distinguish between different error cases. Switch to `c.AbortWithStatusJSON` (e.g., `c.AbortWithStatusJSON(status, gin.H{"error": err.Error()})`) or add a Gin middleware that serializes aborted errors into JSON responses.

**Files:** `handler.go` (and potentially all other handlers across the API)

## Remove empty AcceptFollow handler stub

`AcceptFollow` at `handler.go:116` is registered as a route (`PATCH /network/users/:userID/follow`) but the handler body is empty. Either implement it or remove the handler and route registration to avoid a silent 200 that does nothing.

**Files:** `handler.go`, `routes.go`
