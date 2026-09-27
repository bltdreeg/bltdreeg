# ADR 0005: Customer auth uses Sanctum device tokens, with the web app behind a BFF

## Status
Accepted (2026-09-27)

## Context
Customers use two clients: the Next.js web app and the Flutter mobile app. Both need
the same auth API. Staff auth (Filament, `users`, session guard) must stay isolated
(ADR 0001). The mobile app already had a planned REST contract with bearer tokens;
the web app already routes everything through its own `/api/*` route handlers.

## Decision
- The customer API lives in `central-app` under `/api/v1`, guard `customer`
  (driver `sanctum`, provider `customers`). Sanctum's session fallback is disabled
  so a staff session can never resolve as a customer.
- One Sanctum personal access token per device, 90-day sliding expiry. No refresh
  tokens.
- Mobile stores the token in secure storage and sends it as a bearer token.
- Web never exposes the token to the browser. The Next.js server (backend-for-frontend, BFF)
  keeps it in an httpOnly cookie and calls Laravel server-to-server, forwarding the client IP
  in a header protected by a shared secret.
- Mobile's existing contract is the source of truth; web adapts to it.

## Consequences
- One auth mode on the server, revocable per device.
- No CORS or CSRF setup needed for web.
- A stolen token stays valid until revoked or expired (no short-lived access
  tokens). Accepted: password change/reset and admin disable revoke tokens.
- The BFF is the only web path to the API, so rate limiting depends on the
  forwarded client IP being trusted correctly.

## Refs
`apps/bltdreeg-server/docs/superpowers/specs/2026-09-27-customer-auth-api-design.md`
