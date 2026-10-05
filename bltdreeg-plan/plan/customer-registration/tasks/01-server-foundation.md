# 01 · Server foundation

**Depends on:** nothing · **Spec:** §3, §9, §10

## Goal
`central-app` serves JSON under `/api/v1` with a `customer` guard that can never resolve a staff
session, one error envelope, and API docs that grow with each endpoint.

**Ownership / folders**
| Module | Owns |
|---|---|
| `Shared` | `ApiV1`, `SetApiLocale`, private-file downloads |
| `ApiDocs` | Scramble `/docs/api`, `viewApiDocs` gate |
| `CustomerAuth` | customer routes, models, exceptions, config/lang for auth domain |
| `tenant-app` / `packages/core` | salon/staff only — no customer auth |

## Steps
- [x] Packages: `central-app` → `laravel/sanctum`, `dedoc/scramble`, `firebase/php-jwt`.
      `geoip2/geoip2` waits for task 13. (`packages/core` does **not** take Sanctum for customers.)
- [x] Sanctum config:
  - [x] `'guard' => []` — no session fallback, so a Filament admin never resolves as a customer.
  - [x] Keep `'expiration' => null`. Expiry comes from each token's `expires_at`; a global value
        is counted from `created_at` and would kill tokens at 90 days even after sliding (task 06).
- [x] `config/auth.php`: provider `customers` (Eloquent, `Customer`) + guard `customer`
      (driver `sanctum`, provider `customers`).
- [x] Routes: `CustomerAuthServiceProvider` only `loadRoutesFrom`; `routes/api.php` uses
      `ApiV1::routes(...)`. **Do not** add `api:` to `withRouting`. See
      `.cursor/rules/central-api-v1-routes.mdc`.
- [x] `CustomerAuth/` skeleton (models/exceptions) + `config/customer_auth.php`.
- [x] Lang: `lang/{ar,en}/api.php` for the shared envelope; `customer_auth.php` for domain messages.
- [x] Error envelope in `bootstrap/app.php` for `api/*` (`CustomerAuthException` + framework exceptions).
- [x] `Shared\Http\Middleware\SetApiLocale`: `Accept-Language` ar|en, default `ar` (appended globally).
- [x] `ApiDocs` module: Scramble at `/docs/api`, local or super admins elsewhere.

## Done when
- [x] Pest: unknown `/api/v1/*` path and a validation failure both return the envelope.
- [x] Pest: message language follows `Accept-Language`.
