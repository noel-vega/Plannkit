### Step 1: Simplify the middleware

**File:** `internal/auth/middleware.go`

Strip out the token refresh logic. The middleware should only:
1. Extract the access token from the `Authorization` header
2. Validate it
3. If valid, set `userID` in context and call `c.Next()`
4. If invalid (expired or otherwise), return 401 — that's it

You no longer need the refresh token cookie check or `GenerateAccessToken` call here.

---

### Step 2: Move `/auth/refresh` to a public route

**File:** `internal/server/routes.go`

Right now `/auth/refresh` is behind the auth middleware, which means you need a valid access token to refresh — circular. Move it to the public route group alongside `/auth/signin`, `/auth/signup`, etc.

---

### Step 3: Fix the double validation in `GetMe`

**File:** `internal/auth/handler.go` — `GetMe` method

`ValidateToken` is called, then `RefreshAccessToken` calls it again internally. Pick one path. Since `GetMe` is behind the middleware now (which already validates the access token and sets `userID`), you can:
1. Read `userID` from the context (use `httputil.UserID(c)`)
2. Drop the refresh token cookie reading and validation entirely
3. Just fetch and return the user — no token in the response

`GetMe` becomes a simple "return the current user" endpoint. If the client needs a fresh access token, they hit `/auth/refresh` separately.

---

### Step 4: Update `AuthResponse` usage

**File:** `internal/auth/handler.go`

After step 3, `GetMe` no longer returns an access token. Decide whether `GetMe` should still use `AuthResponse` or just return the user directly. Only `SignUp` and `SignIn` need to return tokens.

---

### Step 5: Test the flow end-to-end

Manually verify these scenarios:
1. **Sign in** — get access token + refresh cookie
2. **Make authenticated request** — access token works, 200
3. **Wait for access token to expire** — make request, get 401
4. **Hit `/auth/refresh`** — get new access token from refresh cookie
5. **Retry original request** — 200 with new access token
6. **Sign out** — refresh cookie cleared, `/auth/refresh` returns 401
