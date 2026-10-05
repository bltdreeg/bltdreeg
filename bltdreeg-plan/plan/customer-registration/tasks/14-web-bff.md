# 14 · Web server layer (BFF)

**Depends on:** 07, 08 running locally · **Spec:** §11 (Server plumbing, DTO changes)

## Goal
The browser only talks to Next.js. Next.js holds the Sanctum token in an httpOnly cookie and calls Laravel.

## Decision: server actions are the single browser entry
The UI already calls server actions directly (`logout-dialog.tsx`, `otp-form.tsx`), and the
`/api/auth/*` route handlers are unused stubs. The spec's "route handlers → server actions → Laravel"
chain would give two public entry points for every auth call. Instead:
- Forms call server actions in `src/lib/actions/auth/auth.action.ts`.
- Keep only two route handlers: `GET/PATCH /api/user` (for React Query) and `GET /api/auth/signout` (below).

## Steps
- [ ] Env: `LARAVEL_API_URL`, `BFF_SHARED_SECRET`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (+ `.env.example`).
- [ ] Add the `server-only` package. `src/lib/server/laravel-client.ts` (`import "server-only"`): base URL,
      `Accept-Language` from locale, bearer from cookie, `X-Client-Ip` from `x-forwarded-for` +
      `X-Bff-Secret`; parses the envelope into `ApiError { status, code, data, errors }`.
- [ ] Server actions **return** `{ ok: true, data } | { ok: false, error }`; they never throw for API
      errors. Next.js replaces thrown server-action errors with a generic message in production, so the
      client would lose `code`/`attemptsLeft`/`retryAfterSeconds`.
- [ ] Actions return `{ user }` or `{ challenge }`, **never the token**. Drop `accessToken`/`expiresAt`
      from the web `AuthSession` type.
- [ ] Actions: `login` (identifier with `@` → email), `register`, `requestOtp`, `resendOtp`, `verifyOtp`,
      `forgotPassword`, `verifyResetCode`, `resetPassword`, `socialLogin`, `getAuthOptions`, `logout`.
- [ ] Cookies (all httpOnly, `secure` in prod, `sameSite=lax`):
  - [ ] `beltadreeg_session` = token; 90-day `maxAge` with "remember me", else a session cookie.
  - [ ] `beltadreeg_onboarding=1` while `user.onboarding.complete` is false. httpOnly is fine:
        `proxy.ts` reads it on the server and nothing client-side needs it (the spec had it readable).
  - [ ] Update the onboarding cookie on **every** response carrying `user` (login, verify, social, each
        onboarding step, merge).
- [ ] **Cookie must slide with the token:** with "remember me", `proxy.ts` re-sets the session cookie
      with a fresh 90-day `maxAge` (just a Set-Cookie header, no API call). Otherwise the cookie dies 90
      days after login while the server token is still valid. Keep the choice in a
      `beltadreeg_remember=1` httpOnly cookie so proxy knows which to refresh.
- [ ] **Laravel 401 = session gone:** actions and route handlers delete the cookies. Server components
      can't set cookies, so they redirect to `GET /api/auth/signout?callbackUrl=…`, which clears them
      and redirects to login. Without this, `proxy.ts` keeps treating a dead cookie as signed in.
- [ ] `GET/PATCH /api/user` → `/me`. `useUser()` uses React Query key `['user']` (401 = signed out);
      stop reading the session from `document.cookie`. Invalidate `['user']` after login/logout actions.
- [ ] Delete: stub route handlers `src/app/api/auth/{login,logout,refresh,register,verify-otp}`,
      the `API_AUTH_*` constants, `dev-login.action.ts` and its imports (login page, `otp-form.tsx`).
      Keep `continueAsGuest` (move it into `auth.action.ts`).
- [ ] DTOs: `RegisterDto` (firstName, lastName, phone, email?, password, acceptedTerms, channel),
      `VerifyOtpDto` + `purpose`, new `OtpChallenge`, `ResetPasswordDto`, `SocialLoginDto`, `ActionResult<T>`.

## Done when
- [ ] Node unit tests (`*.test.ts`): identifier → phone/email; `ApiError` → message (ar/en).
- [ ] The token is invisible in the browser: no JS-readable cookie, never in an action response.
- [ ] Revoking the token on the server → the next page load lands on login, not a loop.
