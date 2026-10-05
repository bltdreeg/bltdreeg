# Customer Registration & Auth — Implementation Plan

**Goal:** customers can register, verify their phone, log in (phone/email + password, phone OTP,
Google, Apple later), recover their password, finish onboarding, and manage their account.
One API (`central-app`, `/api/v1`) serves web now and mobile later. Staff auth (`users`) is untouched.

**Source of truth:** `apps/bltdreeg-server/docs/superpowers/specs/2026-09-27-customer-auth-api-design.md`
("spec §N" below), with the changes listed at the bottom. Decisions: ADR 0001 (separate `customers`
table), ADR 0005 (Sanctum device tokens, web behind a BFF). Plan entry: `plan/customer-app.md` → CA-A1.

**Ownership**
| Lives in | Owns |
|---|---|
| `central-app` `CustomerAuth` | Customer domain: config, models, migrations, auth routes, Filament customer admin |
| `central-app` `Shared` | Cross-cutting API: `ApiV1`, `SetApiLocale`, private files |
| `central-app` `ApiDocs` | Scramble `/docs/api` + `viewApiDocs` gate |
| `tenant-app` | **Salon/tenant** Filament + salon operations (queue, chairs, staff) |
| `packages/core` | Shared **salon/platform** schema and models (`Tenancy`, `Auth` staff `User`, `Catalog`, …) — not customers |

**Done when (spec §1):**
- A guest browses on web, is sent to login/register when booking, finishes onboarding, and returns
  to the booking signed in.
- The same endpoints work from mobile once its data source is switched (follow-up).
- The platform admin can toggle OTP channels/providers and see every send attempt.

## Starting point (verified 2026-09-27)

| Area | State |
|---|---|
| `central-app` | CustomerAuth module + Sanctum/Scramble foundation (task 01); runs on Octane |
| `packages/core` | Modules `Auth, Catalog, Hr, Onboarding, Services, Tenancy` (salon/staff shared) — no Customers module |
| Tests | Pest in central-app on in-memory SQLite, `array` cache |
| Infra | MySQL + Redis in `infra/local/docker-compose.yml`; app cache store is `database` |
| `apps/web` | Auth pages exist; UI calls server actions (all stubs); `/api/auth/*` route handlers unused; `dev-login.action.ts` in use |
| Mobile | Fake backend; its real data source already matches spec paths (out of scope, see task 17) |

## Tasks

| # | Task | Side | Depends on | Status |
|---|---|---|---|---|
| 01 | [Server foundation](tasks/01-server-foundation.md) | API | — | done |
| 02 | [Data model & migrations](tasks/02-data-model.md) | API | 01 | pending |
| 03 | [Support: phone, onboarding status, password rule](tasks/03-support-classes.md) | API | 02 | pending |
| 04 | [OTP providers, dispatcher, channel settings](tasks/04-otp-delivery.md) | API | 02, 03 | pending |
| 05 | [OTP service rules](tasks/05-otp-service.md) | API | 04 | pending |
| 06 | [Tokens, middleware, rate limits](tasks/06-tokens-and-middleware.md) | API | 01–03 | pending |
| 07 | [Register + OTP verify + auth options](tasks/07-registration.md) | API | 05, 06 | pending |
| 08 | [Password login, OTP login, logout](tasks/08-login.md) | API | 07 | pending |
| 09 | [Forgot / reset password](tasks/09-password-reset.md) | API | 08 | pending |
| 10 | [Account (`/me`) + onboarding gate](tasks/10-account-and-onboarding.md) | API | 08 | pending |
| 11 | [Social login + account merge](tasks/11-social-login.md) | API | 06, 10 | pending |
| 12 | [Central admin panel](tasks/12-admin-panel.md) | API | 04, 10 | pending |
| 13 | [IP geolocation fallback (optional)](tasks/13-ip-geolocation.md) | API | 10 | pending |
| 14 | [Web server layer (BFF)](tasks/14-web-bff.md) | Web | 07, 08 | pending |
| 15 | [Web auth pages](tasks/15-web-auth-pages.md) | Web | 09, 14 | pending |
| 16 | [Web onboarding, route protection, account](tasks/16-web-onboarding-and-account.md) | Web | 10, 11, 15 | pending |
| 17 | [End-to-end check, docs, follow-ups](tasks/17-e2e-and-wrap-up.md) | Both | all | pending |

**Critical path:** 01 → 02 → 03 → 04 → 05 → 07 → 08 → 10 → 11 → 16 → 17.
**Parallel once unblocked:** 06 alongside 04–05 · 09, 10, 14 after 08 · 12 and 13 after 10.
Each task ships its own tests and checks its endpoints in Scramble; there is no separate hardening task.

## Changes vs spec (update the spec in task 17)

| # | Spec says | Plan does | Why |
|---|---|---|---|
| 0 | Customer domain in `packages/core` for tenant-app reuse | Customer domain entirely in `central-app` | Tenant app owns salon ops; customer auth is central-only |
| 1 | Add `api:` to `withRouting` | Module provider registers `/api/v1` routes | Codebase convention (`SharedServiceProvider`) |
| 2 | Issuing a challenge replaces the open one | Issue respects the open challenge's lock and cooldown | Otherwise `/auth/otp` again lifts the 5-wrong lock |
| 3 | Per-identifier hourly cap (DB implied) | `RateLimiter` for identifier and IP; limiter store on Redis | Replaced/pruned challenges undercount; `database` cache writes per hit |
| 4 | Reset token "stored hashed" | SHA-256, indexed | `/reset` only has the token, so it must be looked up by hash |
| 5 | Channel rows seeded | Inserted by the migration | Production doesn't run seeders |
| 6 | — | Sanctum `expiration` stays `null` | A global expiry breaks sliding tokens |
| 7 | Web: route handlers → server actions | Server actions only, returning results (not throwing) | One entry point; production hides thrown messages |
| 8 | Onboarding cookie readable by JS | httpOnly; session cookie refreshed by `proxy.ts`; 401 clears cookies | Nothing client-side reads it; cookie must outlive sliding token; no stale-session loops |
| 9 | MaxMind in the main flow | `NullIpGeolocator` first, MaxMind optional (task 13) | Needs a license key + DB download; location is skippable |
| 10 | Merge described under `/me/phone` | Built with social login (task 11) | Only incomplete social accounts can merge |
| 11 | — | Disabled accounts rejected before any OTP is sent | No SMS cost for dead accounts |
| 12 | `birth_date` as date | Also accepts ISO datetime | Mobile sends `toIso8601String()` |
