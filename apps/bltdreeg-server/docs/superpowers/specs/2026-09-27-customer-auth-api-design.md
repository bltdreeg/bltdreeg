# Customer Auth API — Design

**Date:** 2026-09-27
**Status:** Draft, awaiting review
**Scope:** Laravel API in `central-app` + `packages/core`, and the Next.js web client (`apps/web`).
The Flutter app (`apps/bltdreeg_cutsomer_mobile`) keeps its fake backend for now. The API follows
the mobile app's existing contract, so wiring mobile later is a follow-up spec (see §14).

---

## 1. Goal

Customers (app users who book salons) can register, verify their phone, log in, recover
their password, and manage their account. One HTTP API serves both the web app and the mobile app.
Staff (`users`) auth is not touched.

**Success looks like:**
- A guest can browse on web. When they try to book they are sent to login/register, finish
  onboarding, and come back to the booking with a working session.
- The same endpoints work from mobile with `--dart-define=BACKEND=real` once its data source is updated.
- The platform admin can switch OTP channels and providers on and off from the central panel
  without a deploy, and can see every OTP send attempt.

## 2. Decisions

| Topic | Decision |
|---|---|
| API host | `central-app`, routes under `/api/v1/*` |
| Identity | Separate `customers` table + `customer` guard (ADR 0001 stands) |
| Public id | ULID column exposed as `id`; bigint PK stays internal |
| Tokens | Laravel Sanctum personal access tokens, one per device, 90-day sliding expiry |
| Web | Calls the API directly from the browser (axios `apiClient` → plain `*.action.ts` functions → React Query hooks). No BFF, no route handlers, no server actions. The token lives in a JS-readable cookie; CORS is limited to the web origin |
| Contract | Mobile's existing contract is the source of truth; web adapts |
| Login methods | Phone+password, email+password (verified email only), phone OTP, Google, Apple |
| Phone | Mandatory and verified for every account (Egyptian mobile) |
| Password | Required at registration; nullable only for social-only accounts |
| Social | ID-token exchange; Google wired for real, Apple built behind the same interface and disabled until keys exist |
| Social sign-up | Creates an incomplete account → customer onboarding (phone + OTP, name, terms) |
| Onboarding | Required: verified phone, first/last name, terms, **confirmed location** (governorate/city/area, pre-filled). Skippable: birth date |
| OTP channels | WhatsApp, SMS (user picks), email (email verification / reset only) |
| OTP control | Central admin panel: enable/disable channels, order providers per channel; keys stay in `.env` |
| OTP rules | 6 digits, 5 min expiry, resend 60s → 120s → 300s, 5 wrong → 15 min lock, max 5 sends/identifier/hour, hashed |
| Email | Optional; must be verified by emailed code before it can log in or reset a password |
| Forgot password | Code via phone (WhatsApp/SMS) or via verified email |
| Guests | Browse without an account; an account is required to book (docs updated) |
| Deletion | Soft delete + anonymize; the phone is freed for re-registration |
| Location | Device/browser geolocation; request IP as fallback when permission is denied |
| API docs | Scramble (OpenAPI) |
| Tests | Pest feature tests in `central-app` |

## 3. Architecture

Core identity (`Customer` model) lives in `packages/core`, so `tenant-app` can relate to customers for bookings and walk-ins without cross-app dependencies. All customer authentication machinery (OTP engine, social login, Sanctum token issuance, CORS config, and Landlord admin UI) lives strictly in `central-app`. Salon staff in `tenant-app` are completely isolated from customer auth logic.

```
packages/core/
├── src/Modules/Customers/
│   ├── Models/Customer.php                Core entity for bookings/visits/relationships
│   └── Database/Factories/CustomerFactory.php
└── database/migrations/                   Shared DB migrations (run via CoreServiceProvider)

central-app/
├── app/Modules/V1/Customer/
│   ├── CustomerServiceProvider.php        Module service provider registering Customer domains
│   └── Auth/
│       ├── Models/                        CustomerSocialAccount, OtpChallenge, OtpChannelSetting, OtpDelivery
│       ├── Enums/                         OtpChannelEnum, OtpPurposeEnum, SocialProviderEnum, LocationSourceEnum, OnboardingStepEnum
│       ├── Otp/
│       │   ├── Contracts/OtpProvider.php  send(OtpMessage): DeliveryResult
│       │   ├── OtpProviderManager.php     extends Illuminate\Support\Manager
│       │   ├── Providers/LogOtpProvider.php dev: writes code to laravel.log
│       │   ├── Providers/FakeOtpProvider.php tests: records sends, mock failures
│       │   ├── Providers/MailOtpProvider.php email channel via Laravel Mail
│       │   ├── OtpDispatcher.php          picks providers for a channel, falls back, logs
│       │   └── OtpService.php             issue / resend / verify with §6 rules
│       ├── Social/
│       │   ├── Contracts/SocialTokenVerifier.php verify(idToken, nonce?): SocialIdentity
│       │   ├── GoogleTokenVerifier.php
│       │   ├── AppleTokenVerifier.php
│       │   └── SocialAuthService.php      find / link / create (§8.4)
│       ├── Location/
│       │   ├── Contracts/IpGeolocator.php locate(ip): ?Coordinates
│       │   └── MaxMindIpGeolocator.php    GeoLite2 City DB, offline
│       ├── Support/
│       │   ├── PhoneNumber.php            normalise/validate Egyptian mobiles
│       │   ├── CustomerTokenIssuer.php    creates Sanctum tokens with device + expiry
│       │   ├── OnboardingStatus.php       computes required/skippable missing steps
│       │   └── CustomerDeletion.php       soft delete + anonymize
│       ├── Exceptions/CustomerAuthException.php code + HTTP status + data
│       ├── Http/
│       │   ├── Controllers/               AuthOptionsController, RegisterController, PasswordLoginController,
│       │   │                              OtpController, SocialLoginController, PasswordResetController,
│       │   │                              LogoutController, MeController, MePhoneController, MeEmailController,
│       │   │                              MePasswordController, MeLocationController
│       │   ├── Requests/                  one FormRequest per write endpoint
│       │   ├── Resources/                 CustomerResource, AuthSessionResource, OtpChallengeResource
│       │   └── Middleware/                SetApiLocale, EnsureCustomerOnboarded, ExtendCustomerToken
│       ├── Filament/
│       │   ├── Pages/OtpChannelSettings.php
│       │   └── Resources/                 OtpDeliveries (read-only), Customers (list/view/disable)
│       └── routes/api.php
│   └── (Future subdomains: Bookings/, etc.)
├── config/customer_auth.php               (otp.*, token_ttl_days, terms_version, social.*)
└── lang/{ar,en}/customer_auth.php
```

**Package additions:**
- `central-app`: `laravel/sanctum`, `dedoc/scramble`, `firebase/php-jwt`, `geoip2/geoip2`.
- `packages/core`: `laravel/sanctum` (for `Customer` HasApiTokens trait).

**Auth wiring:**
- **Guards:** `config/auth.php` gains provider `customers` (Eloquent, `Bltdreeg\Core\Modules\Customers\Models\Customer`) and guard `customer` (driver `sanctum`, provider `customers`).
- **Sanctum config:** set `guard => []` so Sanctum never falls back to the Filament `web` session. A logged-in admin must not resolve as a customer on `/api/*`.
- **Routing:** add `api:` to `bootstrap/app.php` `withRouting` with prefix `api/v1`. `CustomerServiceProvider` loads the auth route file there.

## 4. Data model

All new migrations go in `packages/core/database/migrations/`. The draft
`bltdreeg-plan/schema/migrations-draft/2026_10_02_000000_create_customers_table.php` is superseded
by this schema and gets a note pointing here.

### `customers`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | internal only |
| ulid | char(26) unique | exposed as `id` |
| first_name, last_name | string nullable | nullable only while onboarding a social sign-up |
| phone | string(13) nullable unique | E.164 `+201XXXXXXXXX`; null only for incomplete social accounts |
| phone_verified_at | timestamp nullable | |
| email | string nullable unique | only ever holds a **verified** email |
| email_verified_at | timestamp nullable | |
| email | string nullable unique | may be unverified; `email_verified_at` marks verification (login works either way) |
| password | string nullable | hashed; null for social-only accounts |
| birth_date | date nullable | |
| last_lat, last_lng | decimal(10,7) nullable | |
| location_source | tinyint | `gps` / `ip` / `manual` / `maps_url` / `default` (NOT NULL; see 8.8) |
| location_updated_at | timestamp nullable | |
| terms_accepted_at | timestamp nullable | |
| terms_version | string nullable | copied from `config('customer_auth.terms_version')` at acceptance |
| locale | string(2) default `ar` | last Accept-Language seen, used for OTP message language |
| is_active | bool default true | admin can disable |
| phone_tombstone_hash | string nullable index | set on deletion for abuse audit |
| deleted_at, timestamps | | soft deletes |

### `customer_social_accounts`
`id`, `customer_id` FK cascade, `provider` (tinyint enum), `provider_user_id`, `email` nullable,
timestamps. Unique on (`provider`, `provider_user_id`) and on (`customer_id`, `provider`).

### `personal_access_tokens`
Sanctum's standard migration, plus `device_name` (string) and `platform` (`web` / `ios` / `android`).
`expires_at` is set on every token.

### `otp_challenges`
| Column | Notes |
|---|---|
| id, ulid | |
| identifier | normalised phone or lowercased email |
| purpose | `register`, `login`, `reset_password`, `verify_phone`, `verify_email` |
| channel | `whatsapp`, `sms`, `email` |
| customer_id nullable | set for purposes tied to an existing account |
| code_hash | `Hash::make(code)` |
| attempts | wrong-code count |
| send_count | sends on this challenge (drives the resend back-off) |
| next_resend_at, expires_at, locked_until, consumed_at | |
| payload | `encrypted:array` — the pending registration (password already hashed) |
| reset_token_hash, reset_token_expires_at | nullable; set by `/auth/password/verify` (§8.6) |
| timestamps | index on (`identifier`, `purpose`) |

Only one open challenge exists per (identifier, purpose). Issuing a new one replaces the old one.

### `otp_channel_settings`
`channel` (unique), `is_enabled`, `providers` (JSON ordered list of provider keys), `sort`,
timestamps. Seeded with three rows. Defaults: `whatsapp` enabled with provider `log`, `sms` enabled with
provider `log`, `email` enabled with provider `mail`.

### `otp_deliveries`
`id`, `otp_challenge_id` FK nullOnDelete, `channel`, `provider`, `recipient_masked` (e.g. `+2010****789`),
`status` (`sent` / `failed`), `provider_message_id` nullable, `error` nullable, `created_at`.

## 5. OTP channels and providers

The point of this design: you can add or swap a WhatsApp or SMS vendor without touching the auth flows.

- **`OtpProvider` (Strategy):** one class per vendor. Takes an `OtpMessage` (recipient, code, purpose,
  locale, channel) and returns a `DeliveryResult` (ok, provider message id, error). A provider builds
  its own text or template (WhatsApp needs pre-approved templates) from `customer_auth.php` lang lines.
- **`OtpProviderManager` (Factory, Laravel `Manager`):** resolves providers by key. Built-in keys:
  `log`, `fake`, `mail`. A new vendor means:
  1. Add a class implementing `OtpProvider`.
  2. Add `customer_auth.otp.providers.cequens = ['driver' => 'cequens', 'channels' => ['sms'], 'key' => env(...)]`.
  3. `OtpProviderManager::extend('cequens', ...)` in the core service provider.

  The admin panel lists every configured provider key that supports a given channel.
- **`OtpChannelSetting` (runtime control):** read through a cache (key `customer_auth.otp_channel_settings`) that is
  cleared when the Filament page saves. So changes apply to the next request, Octane workers included.
- **`OtpDispatcher` & Queue Job (`SendOtpDeliveryJob`):**
  1. `OtpService::issue()` and `OtpService::resend()` save the challenge and dispatch `SendOtpDeliveryJob` to the dedicated high-priority `otp` queue (`php artisan queue:listen --queue=otp,default`).
  2. Inside the worker, `OtpDispatcher` checks that the requested channel is enabled, otherwise throws `auth.channel_unavailable`.
  3. Tries that channel's providers in order (fallback chain).
  4. Writes an `otp_deliveries` row per attempt (with masked recipient).
  5. Stops at the first success. If all fail, logs failure and throws `auth.delivery_failed`.
  6. The HTTP endpoint returns `200 OK` with challenge timing metadata instantly (~20ms), isolating web server threads from external gateway network latency.
  7. If the challenge is already consumed by the time the worker processes it, the worker skips sending.

  It **never switches to a different channel** than the one the user picked.
- **Channel default:** `channel` is optional on every send endpoint. When it is missing (today's mobile
  client never sends it), the first enabled phone channel by `sort` is used. Email-based purposes always use `email`.
- **Dev convenience:** when `app()->isLocal()` and `OTP_FIXED_CODE` is set, that code is issued
  instead of a random one. The `log` provider writes the code to `storage/logs`.

**Admin panel (central-app):**
- **OTP channels page:** one card per channel with an enabled toggle, a reorderable provider list
  (select from registered keys), a sort order, and a "send test code" action to a phone or email.
- **OTP deliveries:** a read-only table with filters for channel, provider, status, and date. Recipients are masked.
- **Customers:** list, search by phone/email, view, disable/enable (`is_active`). Disabling revokes all tokens.

## 6. OTP rules (`OtpService`)

| Rule | Value (config `customer_auth.otp.*`) |
|---|---|
| Code length | 6 |
| Expiry | 5 min from each send |
| Resend cooldown | 60s after 1st send, 120s after 2nd, 300s after 3rd and later |
| Wrong attempts | 5 → challenge locked 15 min (`auth.otp_locked`, `data.lockMinutes`) |
| Sends per identifier | max 5 per rolling hour across all purposes (`auth.otp_send_limit`) |
| Sends per IP | max 20 per hour (Laravel `RateLimiter`, Redis) |
| Storage | hashed code only; consumed challenges are deleted by a daily prune command |

A resend creates a new code on the same challenge. The old code stops working. Resending
does not reset `attempts` or lift a lock.

## 7. API

Base: `/api/v1`. All requests: `Accept: application/json`, `Accept-Language: ar|en` (default `ar`).
Authenticated requests: `Authorization: Bearer <token>`. Field names are snake_case.
Phones are accepted as `01XXXXXXXXX`, `+201…`, `201…`, or `00201…`, and are returned in local 11-digit form
(`01XXXXXXXXX`), which is what mobile expects.

### 7.1 Shared shapes

**Customer** (`CustomerResource`):
```json
{
  "id": "01J9Z…",
  "first_name": "أحمد", "last_name": "سامي",
  "phone": "01012345678", "phone_verified": true,
  "email": "a@x.com", "email_verified": true, "pending_email": null,
  "birth_date": "1998-04-02",
  "area_name": null,
  "has_password": true,
  "social_providers": ["google"],
  "location": { "lat": 30.04, "lng": 31.23, "source": "gps", "updated_at": "…" },
  "onboarding": { "complete": true, "missing": [], "skippable": ["birth_date"] }
}
```
`area_name` stays in the response (always `null`) so the current mobile parser keeps working.

**AuthSession:** `{ "access_token", "token_type": "Bearer", "expires_at", "user": Customer }`

**OtpChallenge:** `{ "phone" | "email", "purpose", "channel", "code_length", "expires_at", "resend_available_at", "attempts_left" }`.
This is a superset of mobile's `OtpChallengeModel`.

### 7.2 Public endpoints

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/auth/options` | — | `{ otp_channels: ["whatsapp","sms"], social_providers: ["google"], terms_version }` |
| POST | `/auth/register` | `first_name, last_name, phone, password, email?, accepted_terms?, channel?` | OtpChallenge (`register`) |
| POST | `/auth/login` | `phone` **or** `email`, `password`, `device_name?` | AuthSession |
| POST | `/auth/otp` | `phone, channel?` | OtpChallenge (`login`) |
| POST | `/auth/otp/resend` | `phone` or `email`, `purpose` (register\|login\|reset_password), `channel?` | OtpChallenge. `verify_phone` / `verify_email` resend through `/me/phone` and `/me/email/resend` |
| POST | `/auth/otp/verify` | `phone, purpose (register\|login), code, device_name?` | AuthSession |
| POST | `/auth/social/{provider}` | `id_token, nonce?, first_name?, last_name?, device_name?` | AuthSession |
| POST | `/auth/password/forgot` | `phone` or `email`, `channel?` | OtpChallenge (`reset_password`) |
| POST | `/auth/password/verify` | `phone` or `email`, `code` | `{ reset_token, expires_at }` (10 min, single use) |
| POST | `/auth/password/reset` | `reset_token, password, password_confirmation, device_name?` | AuthSession |

### 7.3 Authenticated endpoints (`auth:customer`)

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/auth/logout` | — | 204, revokes the current token |
| GET | `/me` | — | Customer |
| PUT | `/me` | `first_name, last_name, email?, birth_date?, accepted_terms?, area_name?` (ignored) | Customer |
| PUT | `/me/password` | `current_password` (required if the account has one), `password, password_confirmation` | 204, revokes other tokens |
| POST | `/me/phone` | `phone, channel?` | OtpChallenge (`verify_phone`) |
| POST | `/me/phone/verify` | `phone, code` | AuthSession (see §8.5) |
| POST | `/me/email/resend` | — | OtpChallenge (`verify_email`) for `pending_email` |
| POST | `/me/email/verify` | `code` | Customer |
| PUT | `/me/location` | `lat?, lng?` | Customer. Without coordinates the server geolocates the request IP |
| DELETE | `/me` | — | 204 |

`PUT /me` with a new `email` stores it in `pending_email` and sends a code. It does not change `email`
until `/me/email/verify`. Sending an email equal to the current one is a no-op, and `null` removes the email.

### 7.4 Onboarding gate

`EnsureCustomerOnboarded` middleware (alias `customer.onboarded`) returns
`403 { code: "auth.onboarding_required", data: { missing: [...] } }` when a required step is missing.
Every auth and `/me*` endpoint is exempt. All future booking, favorites, and rating endpoints must use it.
The same missing-step list is in `user.onboarding` on every AuthSession, so a client knows right after
login whether to show onboarding.

## 8. Flows

### 8.1 Register (phone)
1. `POST /auth/register` checks for a duplicate phone (`auth.phone_taken`), a duplicate verified email
   (`auth.email_taken`), and password rules (min 8, letters + numbers). It then creates an OtpChallenge
   `register` with the hashed password + profile in `payload`, sends the code, and returns the challenge.
   **No customer row is created yet.**
2. `POST /auth/otp/verify {purpose: register}` checks the code and creates the customer in a
   transaction (`phone_verified_at = now`). The email goes into `pending_email` with a verification code
   sent. `terms_accepted_at` is set if `accepted_terms` was true. It issues a token and returns AuthSession.
   A unique-index race on phone returns `auth.phone_taken`.

### 8.2 Password login
`POST /auth/login` looks up by normalised phone, or by verified `email` (a pending email never matches).
- **Wrong password, unknown user, or social-only account (no password):** the same `auth.invalid_credentials`.
- **Disabled account:** `auth.account_disabled`.
- **Rate limit:** 5 attempts/min per (identifier + IP).

### 8.3 OTP login
- `POST /auth/otp` with an unregistered phone returns `auth.phone_not_registered`. The mobile UI relies
  on this code, so we accept the enumeration trade-off, limited by the rate limits.
- `POST /auth/otp/verify {purpose: login}` issues a token.

### 8.4 Social login (`SocialAuthService`)
1. **Verify the ID token.** Signature against the provider's JWKS (cached 1 h), `iss`, `aud` ∈ configured
   client ids (web + future iOS/Android), `exp`, and `nonce` when sent (required for Apple). Failures
   return `auth.social_token_invalid`. A provider not configured or disabled returns `auth.provider_unavailable`.
2. **Existing link:** if (provider, `sub`) is already linked, log in that customer.
3. **Email match:** otherwise, if the token's email is verified and equals a customer's verified `email`,
   link the social account to that customer and log in.
4. **New customer:** otherwise, create one with `phone = null`, names from the token or request body
   (Apple sends names only on first sign-in, so the client forwards them), and `email` + `email_verified_at`
   if the provider verified the email and no one else owns it. Link, then log in. `onboarding.missing`
   will contain `phone` and `terms`, plus `name` if still empty.

### 8.5 Onboarding phone step (`/me/phone` → `/me/phone/verify`)
- **Phone is free:** set `phone` + `phone_verified_at`. Return AuthSession with the current token.
- **Phone belongs to another account B, and the caller is incomplete (no phone yet):** the OTP proves
  the caller owns that phone, so merge.
  1. Move the caller's social accounts to B. If B already has a *different* account for the same
     provider, return `auth.social_conflict` (409).
  2. Hard-delete the incomplete record. It cannot have bookings because of the onboarding gate.
  3. Revoke its tokens and return AuthSession for **B** with a new token.

  Clients must replace their stored token with the one in the response.
- **Phone belongs to another account, and the caller already has a phone** (a phone change):
  `auth.phone_taken`.

### 8.6 Forgot / reset password
1. `forgot` accepts a phone (channel whatsapp/sms) or a verified email (channel email). An unknown
   identifier returns `auth.account_not_found`, consistent with 8.3.
2. `verify` checks the code and returns a random 64-char `reset_token`, stored hashed on the challenge,
   valid 10 min, single use.
3. `reset` sets the password (this also gives social-only accounts a password), revokes **all** tokens,
   and returns a new AuthSession.

### 8.7 Email verification
Handled by `PUT /me` → `pending_email` → code by email → `/me/email/verify` promotes it. When the code
is verified, another account that took that email as verified in the meantime causes `auth.email_taken`.

### 8.8 Location
> **Updated by `plan/geo-location`:** every customer always has `governorate_id`, `city_id`, `area_id` (NOT NULL foreign keys to `geo_*` tables seeded from OpenAdminData) plus `last_lat/last_lng` and `location_source`. At signup they come from the request IP, falling back to the default Cairo area (source `default`). `location_confirmed_at` is set when the customer confirms them (`PUT /me/location` with `area_id`) and completes the onboarding `location` step, which is now **required**. `GET /me/location/estimate` never returns null. `GET /geo/governorates`, `/geo/governorates/{id}/cities`, `/geo/cities/{id}/areas` and `GET /geo/resolve?lat&lng` are public. Trust order: default < ip < gps < manual = maps_url; an automatic update never replaces a more trusted or user-confirmed location. The text below is the original design.

- **With coordinates:** `PUT /me/location {lat, lng}` saves them with source `gps`. Egypt bounding box
  is checked; otherwise the request is rejected with a validation error.
- **Without coordinates:** the server uses `IpGeolocator` on the request IP and saves source
  `ip`. If the lookup fails, location stays null (it is skippable).
- **What it's for:** "near you / new in your area" ranking only. There is still no map search (BUSINESS.md).

### 8.9 Logout, deletion, disabled accounts
- **Logout:** deletes the current token.
- **`DELETE /me` (`CustomerDeletion`), in one transaction:**
  1. Delete all tokens and social accounts.
  2. `phone_tombstone_hash = hash('sha256', phone . app_key)`, then `phone = null`, `email = null`,
     `pending_email = null`, `first_name = 'Deleted'`, `last_name = 'customer'`, `birth_date` and
     location cleared, `password = null`.
  3. Soft delete.

  The same phone can register again as a brand-new customer.
- **Disabled by admin:** every login path returns `auth.account_disabled`, and existing tokens are revoked.

### 8.10 Token lifetime
- **Creation:** `CustomerTokenIssuer` creates tokens with `expires_at = now + 90 days`, a device name
  (`device_name` or the User-Agent summary), and a platform.
- **Sliding:** `ExtendCustomerToken` middleware pushes `expires_at` back to +90 days when fewer than
  60 days remain, so the write happens at most once a month per device.
- **Revocation:** a password change or reset revokes the other devices.

## 9. Errors and responses

Every non-2xx response from `/api/*` uses this envelope. Messages follow `Accept-Language`.
```json
{ "message": "الكود غلط", "code": "auth.otp_invalid", "data": { "attemptsLeft": 3 }, "errors": {} }
```
`data` keys are camelCase to match mobile's existing `AuthFailureCodes`.

| HTTP | code | data |
|---|---|---|
| 401 | `auth.unauthenticated` | — (missing, expired, or revoked token only) |
| 403 | `auth.onboarding_required` | `missing` |
| 403 | `auth.account_disabled` | — |
| 409 | `auth.social_conflict` | `provider` |
| 422 | `validation.failed` | — (`errors` holds field messages) |
| 422 | `auth.invalid_credentials` | — |
| 422 | `auth.phone_not_registered` / `auth.account_not_found` | — |
| 422 | `auth.phone_taken` / `auth.email_taken` | — |
| 422 | `auth.otp_invalid` | `attemptsLeft` |
| 422 | `auth.otp_expired` | — |
| 422 | `auth.otp_locked` | `lockMinutes` |
| 422 | `auth.otp_resend_too_soon` | `retryAfterSeconds` |
| 422 | `auth.reset_token_invalid` | — |
| 422 | `auth.social_token_invalid` / `auth.provider_unavailable` / `auth.channel_unavailable` | — |
| 429 | `auth.otp_send_limit` / `auth.too_many_requests` | `retryAfterSeconds` (+ `Retry-After` header) |
| 503 | `auth.delivery_failed` | — |

Business-rule failures are **422, never 401**. Mobile's `ApiClient` treats 401 as "session gone".
`CustomerAuthException` carries (code, status, data) and is rendered by the exception handler in
`bootstrap/app.php`, which already forces JSON on `api/*`.

## 10. Security

- **Client IP.** The browser calls Laravel directly, so rate limits and IP geolocation use the real request IP.
  Behind a proxy, configure Laravel's trusted proxies so `X-Forwarded-For` resolves correctly.
- **Tokens:** Sanctum stores only SHA-256 hashes. Staff sessions cannot authenticate on `/api`
  (`sanctum.guard = []`, and the guard resolves `Customer` only).
- **Passwords:** bcrypt via the `hashed` cast. Min 8, must contain letters and numbers.
- **OTP:** codes are hashed, the rules in §6 apply, and codes never appear in responses or logs outside `local`.
- **Enumeration:** password login is generic. OTP login and forgot password reveal "not registered";
  this is accepted and rate limited (§8.3).
- **CORS:** `config/cors.php` allows only the origins in `CORS_ALLOWED_ORIGINS` (default `http://localhost:3213`),
  `paths = ['api/*']`, `supports_credentials = false` (auth is a Bearer token, not a cookie). Mobile is not a browser.
- **Token in the browser:** because the browser calls the API, the Sanctum token cannot be httpOnly. It is stored in the
  `beltadreeg_session` cookie (`SameSite=Lax`, `Secure` on https). The cost: an XSS bug could read it. Mitigations: 90-day
  per-device tokens revocable by password change or admin disable, no third-party scripts beyond Google Identity Services,
  and a strict CSP when the site is hardened.
- **Scramble docs:** at `/docs/api`, available in `local` only, or to super admins elsewhere.

## 11. Web client (`apps/web`)

### API client and data flow (mirrors the ATS dashboard)
- **Env:** `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:8011/api/v1`), `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
- **`lib/api/axios-instance.ts`:** the only axios instance. The request interceptor adds
  `Authorization: Bearer <token>` (from the cookie) and `Accept-Language` (from the URL locale).
  The response interceptor turns every failure into a typed `ApiError { status, code, data, errors }`
  (network failures become `http.network`) and clears the token on a 401 for a request that carried one.
  There is no refresh flow: sliding tokens replace it.
- **`lib/api/api-client.ts`:** a thin `apiClient` (`get/post/put/patch/delete`) that returns `response.data`.
- **Cookies** (`lib/utils/auth/token-storage.ts`, written from the browser):
  - `beltadreeg_session` holds the Sanctum token: JS-readable, `SameSite=Lax`, `Secure` on https,
    `Max-Age` 90 days with "remember me", otherwise a session cookie. `proxy.ts` reads it on the server to
    guard routes without a flash.
  - `beltadreeg_onboarding=1` (no secrets) is set while `user.onboarding.complete` is false, so `proxy.ts`
    can redirect without an API call.
- **Data access rule: components use React Query hooks only; hooks call plain action functions; actions
  call `apiClient`.** There are no `src/app/api/*` route handlers and no `"use server"` actions for this.
  1. **Component** uses a hook only (`useLogin()`, `useUser()`, …). It never calls `axios`, `apiClient` or an
     action itself, and never loads data in `useEffect`.
  2. **Hook** (`lib/hooks/<domain>/use-*.hook.ts`) is a `useQuery` / `useMutation` whose function calls an
     action. Mutations that open a session write `user` into the `QK_USER` cache on success.
  3. **Action** (`lib/actions/<domain>/*.action.ts`) is a plain `async` function: it calls `apiClient`, maps
     snake_case to camelCase (`lib/utils/auth/laravel-mappers.ts`), and persists the session when needed.
  - A global `Register { defaultError: ApiError }` declaration types every React Query `error` as `ApiError`.
  - Auth actions: `login` (`identifier` → `email` if it contains `@`, otherwise `phone`), `register`,
    `sendLoginOtp`, `resendOtp`, `verifyOtp`, `socialLogin`, `forgotPassword`, `verifyResetCode`,
    `resetPassword`, `logout`, `getAuthOptions`. User actions: `getMe`, `updateMe`.
  - The `refresh` route and `API_AUTH_REFRESH` are removed.
- **`useUser()`** is a `useQuery` over `getMe`. `getMe` returns `null` when there is no token or the API says 401
  (not an error), and keeps the onboarding cookie in sync.
- **Removed:** `dev-login.action.ts` and its uses. `continueAsGuest` stays, since guests are allowed.

### DTO changes
- `RegisterDto`: `firstName, lastName, phone, email?, password, acceptedTerms, channel`.
- `VerifyOtpDto`: `+ purpose`.
- New: `OtpChallenge`, `ResetPasswordDto`, `SocialLoginDto`.

### Pages (`src/app/[locale]/(auth)` and new `(onboarding)`)
- **Login:**
  - Identifier + password, plus "remember me".
  - "Log in with a code" → phone + channel picker → verify-otp.
  - Google button via Google Identity Services in the existing `social-auth-buttons` component. It sends
    the ID token to the API through `useSocialLogin()`.
  - The Apple button renders only if `/auth/options` lists `apple`.
- **Register:** first/last name split, phone, optional email, password, terms checkbox, WhatsApp/SMS
  picker (from `/auth/options`) → verify-otp.
- **Verify OTP:** driven by the challenge (code length, countdown from `resend_available_at`, attempts
  left, resend with a channel switch). Shows the error codes from §9 in both languages.
- **Forgot password:** identifier → code → new `reset-password` page (new password + confirm).
- **Onboarding route group:** protected, reached whenever the onboarding cookie is set. Steps:
  1. Phone + verify (only when there's no phone).
  2. Name + terms (only when missing).
  3. Location: browser geolocation; if denied, the step calls `PUT /me/location` without coordinates.
     Skippable.
  4. Birth date: skippable.

  After the last step, return to `callbackUrl`.
- **Account → profile:** add/change email with a code dialog. Set/change password (set, for social-only
  accounts).

### `proxy.ts`
- **Protected paths** (`book`, `bookings`, `account`) with no session → login with `callbackUrl` (as today).
- **Protected paths with the onboarding cookie** → `/onboarding?callbackUrl=…`.
- **Auth pages with a session** → home.
- **Public browsing** stays open to guests.

## 12. Docs to update

- `bltdreeg-plan/docs/features/01-customer-booking-and-live-queue.md`: registration is required to
  **book**, not to browse (guests browse). Registration methods: phone+password with OTP-verified phone,
  email+password on a verified email, phone OTP login, Google/Apple. The decision log row R3 is updated
  to match.
- `bltdreeg-plan/docs/domain-model.md` (Customer entry): same change.
- `bltdreeg-plan/plan/customer-app.md` CA-A1: points to this spec. Web done here, mobile follow-up.
- `bltdreeg-plan/docs/adr/0001-separate-customers-table.md`: auth methods line updated. A new
  ADR 0005 "Customer auth: Sanctum device tokens, web calls the API directly" records the token decision.
- The draft customers migration gets a header note saying it is superseded by §4.

## 13. Testing

**Pest feature tests** (`central-app/tests/Feature/CustomerAuth/`), all using the `fake` OTP provider,
fake social verifiers, and a fake `IpGeolocator`:
- **Registration:** happy path; phone/email taken; the customer is not created before verify; the
  unique-index race.
- **Password login:** phone and email; unverified email rejected; social-only account; disabled account;
  throttling.
- **OTP rules:** expiry, 5-wrong lock, escalating resend cooldown, hourly cap, a resend invalidates the
  old code, `attempts_left` values (using time travel).
- **Channels:** disabled channel rejected; default channel when omitted; fallback to the next provider
  within a channel; never switches channel; `otp_deliveries` rows written; settings cache cleared on save.
- **Social:** new account → incomplete onboarding; login by existing link; link by verified email; merge
  on phone verify; `social_conflict`; Apple unavailable.
- **Onboarding gate:** middleware response; `onboarding` block contents.
- **Password reset:** by phone and by email; token single use and expiry; all tokens revoked.
- **`/me`:** update; pending email flow; change password revokes others; location with coordinates,
  IP fallback, and outside Egypt.
- **Deletion:** anonymization; the phone can register again.
- **Tokens:** expiry; sliding extension; a revoked token returns 401.
- **Security:** a staff Filament session cannot reach `/api/v1/me`; CORS allows only the configured web origin.
- **Errors:** envelope shape, locale switching (ar/en).

**Unit tests:** `PhoneNumber` normalisation (all input formats, invalid prefixes), `OnboardingStatus`,
`OtpDispatcher` fallback.

**Filament tests** in the style of `TenantsResourceTest`: the channel settings page saves and clears
the cache; the deliveries table filters.

**Web:** node test-runner unit tests (existing `*.test.ts` pattern) for identifier → phone/email
mapping and `ApiError` → message mapping. A manual end-to-end checklist against the local Docker stack
covers register → onboarding → booking redirect, OTP login, Google login, reset, and logout.

## 14. Out of scope (follow-ups)

- **Mobile wiring** (separate spec):
  - Switch `BACKEND=real`.
  - `channel` + `/auth/options`, social buttons, the onboarding flow, forgot password.
  - Nullable `phone` in `UserModel` for incomplete social accounts.
  - Parse the `code` envelope into `RuleFailure`.
  - Handle the token swap after a merge.
- **Real WhatsApp/SMS vendor drivers:** added one class each once vendors are chosen (§5).
- **Apple Sign In:** keys and Services ID config; the code path already exists.
- **Device list / "log out other devices" UI.**
- **Named areas** and mapping coordinates to areas (discovery work). The existing web `/api/areas` and
  `/api/user/area` stubs are left as they are.
- **Push notification token registration** (feature 05).
