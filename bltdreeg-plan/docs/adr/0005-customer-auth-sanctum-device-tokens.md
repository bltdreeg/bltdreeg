# ADR 0005: Customer auth uses Sanctum device tokens, and the web app calls the API directly

## Status
Accepted (2026-09-27). Amended 2026-10-01: the web client calls Laravel directly instead of going through a
backend-for-frontend (BFF).

## Context
Customers use two clients: the Next.js web app and the Flutter mobile app. Both need
the same auth API. Staff auth (Filament, `users`, session guard) must stay isolated
(ADR 0001). The mobile app already had a planned REST contract with bearer tokens.

The first version of this decision put a BFF in front of Laravel (Next.js server actions holding the token in an
httpOnly cookie). We dropped it: the extra server hop adds latency and code for no functional gain, and the ATS
dashboard already proves the simpler structure (axios `apiClient` → plain action functions → React Query hooks).

## Decision
- The customer API lives in `central-app` under `/api/v1`, guard `customer`
  (driver `sanctum`, provider `customers`). Sanctum's session fallback is disabled
  so a staff session can never resolve as a customer.
- One Sanctum personal access token per device, 90-day sliding expiry. No refresh
  tokens.
- Mobile stores the token in secure storage and sends it as a bearer token.
- Web does the same from the browser: a single axios instance adds the bearer token, and the token is stored in a
  JS-readable cookie (`beltadreeg_session`) so `proxy.ts` can guard routes on the server. There are no route
  handlers and no server actions for first-party data.
- Laravel enables CORS for the configured web origin(s) only (`CORS_ALLOWED_ORIGINS`), without credentials.
- Mobile's existing contract is the source of truth; web adapts to it.

## Consequences
- One auth mode on the server, revocable per device, same for web and mobile.
- No BFF to run, and no shared secret or forwarded client IP. Rate limits see the real request IP.
- The token is readable by JavaScript, so an XSS bug could steal it. Accepted, with these mitigations: tokens are
  per device and revocable, password change/reset and admin disable revoke them, and the site avoids third-party
  scripts beyond Google Identity Services.
- A stolen token stays valid until revoked or expired (no short-lived access tokens).
- CORS must be kept in sync with the deployed web origin.

## Refs
`apps/bltdreeg-server/docs/superpowers/specs/2026-09-27-customer-auth-api-design.md`
