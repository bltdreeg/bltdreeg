# Customer Auth — Onboarding, Location, Reset Password, Social Login — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish customer auth on the web. That means onboarding (with location permission, so the customer's lat/lng is saved for "closest salons" queries), the reset-password page, and Google/Apple sign-in. It also includes the backend fixes these flows need.

**Architecture:** The Laravel API in `central-app` already exposes every endpoint (`/me/phone`, `/me/location`, `/auth/password/*`, `/auth/social/{provider}`). Backend work here is limited to three fixes: location overwrite, social token verification, and Apple config. The web app (`apps/web`) follows the data-access rule *Component → React Query hook → plain action → `apiClient` → Laravel*. There are no route handlers and no server actions. Route guarding happens in `proxy.ts` from two cookies (`beltadreeg_session`, `beltadreeg_onboarding`). Its decision logic moves into a pure, tested function.

**Tech Stack:** Laravel 12 + Pest + Sanctum + `firebase/php-jwt` (central-app); Next.js 16 (App Router, `proxy.ts`) + React Query v5 + axios + next-intl + Tailwind (apps/web); `node --test` for pure web helpers; Google Identity Services and Sign in with Apple JS in the browser.

**Spec:** `apps/bltdreeg-server/docs/superpowers/specs/2026-09-27-customer-auth-api-design.md` (§7, §8.4, §8.5, §8.6, §8.8, §10, §11). Also read the skill `.claude/skills/web-data-access/SKILL.md` before any web task.

## Global Constraints

- Web data access: components use hooks only; hooks call actions; actions call `apiClient`. No `src/app/api/*` handler, no `"use server"`, no data loading in `useEffect`.
- Only touch the session cookie through `src/lib/utils/auth/token-storage.ts` (`setSession`, `setOnboarding`, `clear`).
- Every query key lives in `src/lib/data/constants/query-keys.constants.ts`. Every page path lives in `src/lib/data/constants/routes.constants.ts`.
- Pure web helpers get `node --test` tests next to them and import with a `.ts` extension and **relative** paths (the test runner does not resolve `@/`).
- Business-rule failures are 422, never 401. 401 only means the token is gone (spec §9).
- Location: Egypt bounding box is lat 21.5–32.0, lng 24.5–37.0 (`UpdateLocationRequest`). Source is `gps` (browser), `ip` (server fallback) or `manual` (the customer placed the pin on the map). Trust order is `manual` > `gps` > `ip`. An automatic update (IP fallback, background GPS refresh) never replaces a more trusted source. Only the customer moving the pin again changes a `manual` location.
- Map: Leaflet + `react-leaflet`, loaded client-side only (`next/dynamic`, `ssr: false`). Tiles come from `NEXT_PUBLIC_MAP_TILE_URL`, defaulting to OpenStreetMap for development, with the attribution shown. No API key is needed. Before production traffic, switch the env to a hosted tile provider (MapTiler, Stadia, or self-hosted), because OSM's public tiles are not meant for production apps.
- Onboarding: required = verified phone, first/last name, terms. Skippable = location, birth date (spec §2).
- The reset token is valid for 10 minutes and single use (spec §7.2).
- Google: verify signature, `iss`, `aud` ∈ configured client ids, `exp`, and `nonce` when sent. Apple: same, and `nonce` is required (spec §8.4).
- UI copy is Egyptian Arabic, code comments are Arabic, styling matches the existing auth pages (hex Tailwind classes such as `#0F766E` and `#E5E7EB`, `h-13` inputs, `rounded-xl`).
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Stale session cookie on an auth page.** A revoked token still in the cookie must not trap the user in a redirect loop between `/login` and `/`. Home is public, `getMe` gets a 401, and the interceptor clears the cookie. Pinned by the `guardRedirect` tests in Task 3.
2. **Open redirect through `callbackUrl`.** `?callbackUrl=//evil.com` or `https://evil.com` must fall back to `/`. Pinned by the `safeCallback` tests in Task 3.
3. **A pin the customer placed (`manual`) or a GPS location must not be replaced by a coarser guess.** This can come from the IP fallback, or from the background GPS refresh on a desktop whose "GPS" is really VPN-based. Pinned in Task 1, Task 1b and the `shouldRefreshLocation` tests in Task 4.
4. **VPN or wrong detection.** The IP estimate is outside Egypt or in the wrong city. The map must still open, centered in Egypt (Cairo when no estimate is usable). The customer can move the pin to their real place, can't confirm a point outside Egypt, and is never blocked from skipping. Pinned by the `initialPin` and `locationToSave` tests in Task 7b.
5. **Reset page opened directly or after the 10-minute token expired.** It must show "start again" and never send an empty token. Pinned by the `resetTokenState` tests in Task 6.

---

## File map

**Backend (`apps/bltdreeg-server/central-app`)**
- Modify `app/Modules/V1/Customer/Auth/Http/Controllers/MeLocationController.php`: the IP fallback never overwrites GPS.
- Modify `app/Modules/V1/Customer/Auth/Social/GoogleTokenVerifier.php`: require configured audiences, check nonce.
- Modify `app/Modules/V1/Customer/Auth/Social/AppleTokenVerifier.php`: real JWKS verification.
- Modify `config/customer_auth.php`, `.env.example`, and `app/Modules/V1/Customer/Auth/Http/Controllers/AuthOptionsController.php`.
- Tests: `tests/Feature/CustomerAuth/MeEndpointsTest.php`, new `tests/Feature/CustomerAuth/SocialTokenVerificationTest.php`.

**Web (`apps/web/src`)**
- `lib/data/constants/routes.constants.ts`: `ROUTE_ONBOARDING`, `ROUTE_RESET_PASSWORD`.
- `lib/data/constants/query-keys.constants.ts`: `QK_RESET_TOKEN`, `QK_LOCATION_SYNC`.
- New `lib/utils/auth/route-guard.ts` (+ test): `PROTECTED_ROUTES`, `isProtectedPath`, `guardRedirect`.
- New `lib/utils/auth/post-auth-redirect.ts` (+ test): `safeCallback`, `afterAuthPath`.
- New `lib/utils/auth/onboarding-steps.ts` (+ test): `nextOnboardingStep`.
- New `lib/utils/location/browser-position.ts` (+ test): `isInEgypt`, `positionErrorReason`, `requestBrowserPosition`, `geolocationPermission`, `shouldRefreshLocation`.
- New `lib/utils/auth/reset-token-state.ts` (+ test): `resetTokenState`.
- New `lib/utils/auth/google-identity.ts`, `lib/utils/auth/apple-identity.ts`, `lib/types/auth/social-sdk.d.ts`.
- New `lib/actions/user/location.action.ts`: `updateLocation`, `getLocationEstimate`, `syncLocation`.
- New `lib/utils/location/location-choice.ts` (+ test): `initialPin`, `locationToSave`, `CAIRO`, `EGYPT_BOUNDS`.
- New `components/molecules/location-picker-map/`: Leaflet map with a draggable pin, loaded client-only.
- Backend additions: `LocationSourceEnum::Manual`, `GET /me/location/estimate`, `source` on `PUT /me/location`.
- Modify `lib/actions/auth/auth.action.ts`: export `openSession`.
- Modify `lib/actions/user/user.action.ts`: `sendPhoneVerification`, `verifyPhone`.
- New `lib/types/auth/phone-verification.dto.ts`.
- New hooks under `lib/hooks/user/`: `use-send-phone-otp`, `use-verify-phone`, `use-share-location`, `use-location-sync`.
- New hooks under `lib/hooks/auth/`: `use-reset-token`, `use-google-button`, `use-apple-sign-in`.
- Modified hooks: `use-forgot-password`, `use-verify-reset-code`, `use-otp-challenge`.
- `middleware.config.ts`: re-export from `route-guard.ts`. `proxy.ts`: use `guardRedirect`.
- Move `app/[locale]/(auth)/register/__components/password-requirements/` to `app/[locale]/(auth)/__components/password-requirements/`.
- New `app/[locale]/(auth)/__components/otp-code-input/`, extracted from `otp-form.tsx`.
- New `app/[locale]/(auth)/reset-password/` (page + form).
- New `app/[locale]/(onboarding)/` (layout + `onboarding/page.tsx` + step components).
- Modify `forgot-password-form.tsx`, `verify-otp/page.tsx`, `otp-form.tsx`, `login-form.tsx`, `register-form.tsx`, `social-auth-buttons.tsx`, `lib/contexts/providers.tsx`.

---

### Task 1: Backend — IP fallback never replaces a GPS location

The customer's `last_lat`/`last_lng` drive future "closest salons" ranking, so a precise GPS point must survive a later call without coordinates. That call comes from onboarding after a denied permission, or from the sync in Task 10.

Rule: `PUT /me/location` **without** coordinates writes the IP result only when the customer has no location yet, or the current one is already `ip`.

**Files:**
- Modify: `apps/bltdreeg-server/central-app/app/Modules/V1/Customer/Auth/Http/Controllers/MeLocationController.php`
- Test: `apps/bltdreeg-server/central-app/tests/Feature/CustomerAuth/MeEndpointsTest.php`

**Interfaces:**
- Produces: unchanged HTTP contract `PUT /api/v1/me/location {lat?, lng?}` returning `CustomerResource`.

- [ ] **Step 1: Write the failing test** (append to `MeEndpointsTest.php`)

```php
test('ip fallback does not overwrite a gps location', function () {
    $customer = Customer::factory()->create([
        'phone' => '+201012345670',
        'phone_verified_at' => now(),
        'last_lat' => 30.0444,
        'last_lng' => 31.2357,
        'location_source' => \App\Modules\V1\Customer\Auth\Enums\LocationSourceEnum::Gps->value,
        'location_updated_at' => now()->subDays(3),
    ]);

    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->never();
    app()->instance(IpGeolocator::class, $geolocator);

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', [])
        ->assertOk()
        ->assertJsonPath('location.source', 'gps')
        ->assertJsonPath('location.lat', 30.0444);
});

test('ip fallback refreshes an existing ip location', function () {
    $customer = Customer::factory()->create([
        'phone' => '+201012345671',
        'phone_verified_at' => now(),
        'last_lat' => 31.2,
        'last_lng' => 29.9,
        'location_source' => \App\Modules\V1\Customer\Auth\Enums\LocationSourceEnum::Ip->value,
    ]);

    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->once()->andReturn(new Coordinates(30.05, 31.24));
    app()->instance(IpGeolocator::class, $geolocator);

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', [])
        ->assertOk()
        ->assertJsonPath('location.source', 'ip')
        ->assertJsonPath('location.lat', 30.05);
});
```

If `Coordinates` has a different constructor, copy how the existing IP-fallback test in this file (around line 164) builds it. If `location.lat` serializes as a string, assert with `(string)` or `assertJsonPath(..., fn ($v) => abs($v - 30.0444) < 1e-6)`, matching the existing GPS assertion in the same file.

- [ ] **Step 2: Run the tests and confirm the first one fails**

Run: `cd apps/bltdreeg-server/central-app && php artisan test --filter="ip fallback"`
Expected: `ip fallback does not overwrite a gps location` FAILS. Mockery reports `locate` was called (or the source is `ip`). The second test passes.

- [ ] **Step 3: Implement**

In `MeLocationController::update`, replace the `else` branch:

```php
        } elseif ($customer->last_lat === null || $customer->location_source === LocationSourceEnum::Ip->value
            || $customer->location_source === LocationSourceEnum::Ip) {
            // موقع الـ GPS أدق من تخمين الـ IP، فمبنستبدلوش أبداً بالـ fallback
            $coords = $geolocator->locate($request->ip());

            if ($coords !== null) {
                $customer->last_lat = $coords->lat;
                $customer->last_lng = $coords->lng;
                $customer->location_source = LocationSourceEnum::Ip->value;
                $customer->location_updated_at = now();
                $customer->save();
            }
        }
```

The double comparison covers both cases: `location_source` cast to the enum on the model, or stored raw. If the `Customer` model casts `location_source` to `LocationSourceEnum`, keep only `=== LocationSourceEnum::Ip`.

- [ ] **Step 4: Run the location tests**

Run: `php artisan test --filter="location"`
Expected: all PASS, including the existing `customer can update location with egypt coordinates and IP fallback`.

- [ ] **Step 5: Commit**

```bash
git add app/Modules/V1/Customer/Auth/Http/Controllers/MeLocationController.php tests/Feature/CustomerAuth/MeEndpointsTest.php
git commit -m "fix(customer-auth): ip geolocation never overwrites a gps location"
```

---

### Task 1b: Backend — `manual` location source and a read-only IP estimate

The onboarding map (Task 7b) needs two things the API doesn't have yet:
1. **A place to center the map before anything is saved.** `GET /me/location/estimate` geolocates the request IP and returns the point **without writing it**.
2. **A way to say "the customer placed this pin".** `PUT /me/location` accepts `source: "gps" | "manual"` with coordinates. `manual` is the most trusted source: the IP fallback never replaces it (the Task 1 rule already covers this, because it only writes over `ip` or empty).

`location_source` is a `tinyint` cast to `integer` on `Customer` (1 = gps, 2 = ip), so `manual = 3` needs no migration, only the enum and the resource mapping. `CustomerResource` currently hardcodes `=== 1 ? 'gps' : 'ip'`, so a manual location would be reported as `ip`. This task fixes that.

**Files:**
- Modify: `app/Modules/V1/Customer/Auth/Enums/LocationSourceEnum.php`
- Modify: `app/Modules/V1/Customer/Auth/Http/Resources/CustomerResource.php` (~line 25)
- Modify: `app/Modules/V1/Customer/Auth/Http/Requests/UpdateLocationRequest.php`
- Modify: `app/Modules/V1/Customer/Auth/Http/Controllers/MeLocationController.php` (add `estimate`, use `source`)
- Modify: `app/Modules/V1/Customer/Auth/routes/api.php`
- Modify: `packages/core/database/migrations/2026_09_27_000001_create_customers_table.php` (comment only: `// 1 = gps, 2 = ip, 3 = manual`)
- Test: `tests/Feature/CustomerAuth/MeEndpointsTest.php`

**Interfaces:**
- Produces: `GET /api/v1/me/location/estimate` → `200 { "estimate": { "lat": float, "lng": float } | null }`. `null` when the lookup fails **or the point is outside Egypt** (VPN). No database write.
- Produces: `PUT /api/v1/me/location { lat, lng, source?: "gps" | "manual" }`. `source` defaults to `gps`, is ignored without coordinates, and is rejected with `validation.failed` if it is any other value.
- Produces: `CustomerResource.location.source ∈ "gps" | "ip" | "manual"`.

- [ ] **Step 1: Write the failing tests** (append to `MeEndpointsTest.php`)

```php
test('location estimate returns the ip point without saving it', function () {
    $customer = Customer::factory()->create(['phone' => '+201012345672', 'phone_verified_at' => now()]);

    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->once()->andReturn(new Coordinates(30.05, 31.24));
    app()->instance(IpGeolocator::class, $geolocator);

    $this->actingAs($customer, 'customer')
        ->getJson('/api/v1/me/location/estimate')
        ->assertOk()
        ->assertJsonPath('estimate.lat', 30.05)
        ->assertJsonPath('estimate.lng', 31.24);

    expect($customer->fresh()->last_lat)->toBeNull();
});

test('location estimate is null when the ip resolves outside egypt or fails', function () {
    $customer = Customer::factory()->create(['phone' => '+201012345673', 'phone_verified_at' => now()]);

    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->andReturn(new Coordinates(52.37, 4.90), null); // أمستردام (VPN) ثم فشل
    app()->instance(IpGeolocator::class, $geolocator);

    $this->actingAs($customer, 'customer')->getJson('/api/v1/me/location/estimate')->assertOk()->assertJsonPath('estimate', null);
    $this->actingAs($customer, 'customer')->getJson('/api/v1/me/location/estimate')->assertOk()->assertJsonPath('estimate', null);
});

test('a manual pin is saved as manual and survives the ip fallback', function () {
    $customer = Customer::factory()->create(['phone' => '+201012345674', 'phone_verified_at' => now()]);

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', ['lat' => 31.2001, 'lng' => 29.9187, 'source' => 'manual'])
        ->assertOk()
        ->assertJsonPath('location.source', 'manual');

    $geolocator = Mockery::mock(IpGeolocator::class);
    $geolocator->shouldReceive('locate')->never();
    app()->instance(IpGeolocator::class, $geolocator);

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', [])
        ->assertOk()
        ->assertJsonPath('location.source', 'manual');
});

test('location source only accepts gps or manual', function () {
    $customer = Customer::factory()->create(['phone' => '+201012345675', 'phone_verified_at' => now()]);

    $this->actingAs($customer, 'customer')
        ->putJson('/api/v1/me/location', ['lat' => 30.05, 'lng' => 31.24, 'source' => 'ip'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['source']);
});
```

Match the lat/lng assertion style of the existing location test, because decimals may serialize as strings.

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `php artisan test --filter="location"`
Expected: the four new tests FAIL (404 on `/estimate`, `source` reported as `ip` or `gps`, no validation error).

- [ ] **Step 3: Implement**

`LocationSourceEnum.php`:

```php
enum LocationSourceEnum: int
{
    case Gps = 1;
    case Ip = 2;
    case Manual = 3; // العميل حط الدبوس بنفسه على الخريطة — أعلى ثقة

    public function label(): string
    {
        return match ($this) {
            self::Gps => 'gps',
            self::Ip => 'ip',
            self::Manual => 'manual',
        };
    }

    public static function fromLabel(string $label): self
    {
        return match ($label) {
            'manual' => self::Manual,
            'ip' => self::Ip,
            default => self::Gps,
        };
    }
}
```

`CustomerResource.php`, replacing the hardcoded ternary:

```php
                'source' => LocationSourceEnum::tryFrom((int) $this->resource->location_source)?->label(),
```

`UpdateLocationRequest::rules()`:

```php
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
            'source' => ['nullable', 'in:gps,manual'],
```

`MeLocationController`: replace the GPS branch's source line, and add `estimate`.

```php
        if ($request->filled('lat') && $request->filled('lng')) {
            $customer->last_lat = (float) $request->input('lat');
            $customer->last_lng = (float) $request->input('lng');
            $customer->location_source = LocationSourceEnum::fromLabel((string) $request->input('source', 'gps'))->value;
            $customer->location_updated_at = now();
            $customer->save();
        } elseif (/* Task 1 condition unchanged */) {
            // ...
        }
```

```php
    /**
     * Read-only IP estimate used to center the onboarding map. Never writes.
     */
    public function estimate(Request $request, IpGeolocator $geolocator): JsonResponse
    {
        $coords = $geolocator->locate($request->ip());

        // VPN بيطلّع دولة تانية: مبنرجعش نقطة برا مصر، والويب بيبدأ الخريطة من القاهرة
        $inEgypt = $coords !== null
            && $coords->lat >= 21.5 && $coords->lat <= 32.0
            && $coords->lng >= 24.5 && $coords->lng <= 37.0;

        return response()->json([
            'estimate' => $inEgypt ? ['lat' => $coords->lat, 'lng' => $coords->lng] : null,
        ]);
    }
```

Import `Illuminate\Http\Request` and `Illuminate\Http\JsonResponse`. The Egypt box is now in two places (request + controller), so move it to a constant on `UpdateLocationRequest`, e.g. `public const EGYPT_BOUNDS = ['lat' => [21.5, 32.0], 'lng' => [24.5, 37.0]];`, and use it in both.

`routes/api.php`, inside the authenticated group:

```php
            Route::get('me/location/estimate', [MeLocationController::class, 'estimate']);
            Route::put('me/location', [MeLocationController::class, 'update']);
```

- [ ] **Step 4: Run the location tests**

Run: `php artisan test --filter="location"`
Expected: all PASS, old and new.

- [ ] **Step 5: Commit**

```bash
git add app/Modules/V1/Customer/Auth tests/Feature/CustomerAuth/MeEndpointsTest.php ../../packages/core/database/migrations/2026_09_27_000001_create_customers_table.php
git commit -m "feat(customer-auth): manual location source and read-only ip estimate"
```

---

### Task 2: Backend — real Google and Apple ID-token verification

Today `GoogleTokenVerifier` accepts **any** audience when `client_ids` is empty and ignores `nonce`. `AppleTokenVerifier` always throws. Config also disagrees: the options controller reads `social.apple.client_ids`, which does not exist. This task makes both verifiers follow spec §8.4.

**Files:**
- Modify: `apps/bltdreeg-server/central-app/config/customer_auth.php` (the `social` block)
- Modify: `apps/bltdreeg-server/central-app/.env.example`
- Modify: `app/Modules/V1/Customer/Auth/Social/GoogleTokenVerifier.php`
- Modify: `app/Modules/V1/Customer/Auth/Social/AppleTokenVerifier.php`
- Modify: `app/Modules/V1/Customer/Auth/Http/Controllers/AuthOptionsController.php`
- Test: `tests/Feature/CustomerAuth/SocialTokenVerificationTest.php` (new)

**Interfaces:**
- Produces: `GoogleTokenVerifier::verify(string $idToken, ?string $nonce = null): SocialIdentity`, and the same signature for `AppleTokenVerifier`. Both throw `CustomerAuthException('auth.provider_unavailable', 422)` when not configured and `('auth.social_token_invalid', 422)` on any token problem.
- Produces: `GET /auth/options` lists `apple` only when `social.apple.enabled` is true **and** `social.apple.client_ids` is non-empty.

- [ ] **Step 1: Config and env**

`config/customer_auth.php`:

```php
    'social' => [
        'google' => [
            'client_ids' => array_values(array_filter(explode(',', (string) env('GOOGLE_CLIENT_IDS', '')))),
        ],
        'apple' => [
            'enabled' => (bool) env('APPLE_AUTH_ENABLED', false),
            // Services ID للويب + Bundle ID للـ iOS، مفصولين بفاصلة
            'client_ids' => array_values(array_filter(explode(',', (string) env('APPLE_CLIENT_IDS', '')))),
        ],
    ],
```

The `NEXT_PUBLIC_GOOGLE_CLIENT_ID` fallback is removed on purpose, because the API should not read a web variable. Append to `.env.example`:

```dotenv
# Customer social login — comma separated OAuth client ids allowed as the token audience
GOOGLE_CLIENT_IDS=
APPLE_AUTH_ENABLED=false
APPLE_CLIENT_IDS=
```

- [ ] **Step 2: Write the failing tests**

Create `tests/Feature/CustomerAuth/SocialTokenVerificationTest.php`. The test signs real JWTs with a throwaway RSA key and serves the matching JWKS through `Http::fake`, so the real verification path runs.

```php
<?php

use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use App\Modules\V1\Customer\Auth\Social\AppleTokenVerifier;
use App\Modules\V1\Customer\Auth\Social\GoogleTokenVerifier;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

function socialTestKey(): array
{
    static $key;
    if ($key) {
        return $key;
    }
    $res = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
    openssl_pkey_export($res, $private);
    $details = openssl_pkey_get_details($res);
    $b64 = fn (string $v) => rtrim(strtr(base64_encode($v), '+/', '-_'), '=');
    $jwk = ['kty' => 'RSA', 'alg' => 'RS256', 'use' => 'sig', 'kid' => 'test-kid',
        'n' => $b64($details['rsa']['n']), 'e' => $b64($details['rsa']['e'])];

    return $key = ['private' => $private, 'jwks' => ['keys' => [$jwk]]];
}

function signToken(array $claims): string
{
    return JWT::encode($claims + ['exp' => time() + 600, 'iat' => time()], socialTestKey()['private'], 'RS256', 'test-kid');
}

beforeEach(function () {
    // التحقق الحقيقي بس — مفيش fake tokens في بيئة testing لما نستخدم JWT حقيقي
    Cache::flush();
    Http::fake([
        'www.googleapis.com/oauth2/v3/certs' => Http::response(socialTestKey()['jwks']),
        'appleid.apple.com/auth/keys' => Http::response(socialTestKey()['jwks']),
    ]);
    config()->set('customer_auth.social.google.client_ids', ['web-client.apps.googleusercontent.com']);
    config()->set('customer_auth.social.apple.enabled', true);
    config()->set('customer_auth.social.apple.client_ids', ['com.bltdreeg.web']);
});

$google = fn (array $over = []) => signToken($over + [
    'iss' => 'https://accounts.google.com', 'aud' => 'web-client.apps.googleusercontent.com',
    'sub' => 'g-1', 'email' => 'a@gmail.com', 'email_verified' => true, 'nonce' => 'n-1',
]);

test('google accepts a valid token with matching nonce', function () use ($google) {
    $identity = app(GoogleTokenVerifier::class)->verify($google(), 'n-1');
    expect($identity->providerUserId)->toBe('g-1')->and($identity->emailVerified)->toBeTrue();
});

test('google rejects wrong audience, wrong nonce and expired tokens', function (array $claims, ?string $nonce) use ($google) {
    app(GoogleTokenVerifier::class)->verify($google($claims), $nonce);
})->with([
    'wrong aud' => [['aud' => 'someone-else'], 'n-1'],
    'wrong nonce' => [[], 'n-2'],
    'expired' => [['exp' => time() - 10], 'n-1'],
    'wrong iss' => [['iss' => 'https://evil.example'], 'n-1'],
])->throws(CustomerAuthException::class);

test('google is unavailable when no client ids are configured', function () use ($google) {
    config()->set('customer_auth.social.google.client_ids', []);
    try {
        app(GoogleTokenVerifier::class)->verify($google(), 'n-1');
        $this->fail('expected exception');
    } catch (CustomerAuthException $e) {
        expect($e->code())->toBe('auth.provider_unavailable');
    }
});

$apple = fn (array $over = []) => signToken($over + [
    'iss' => 'https://appleid.apple.com', 'aud' => 'com.bltdreeg.web',
    'sub' => 'apl-1', 'email' => 'x@privaterelay.appleid.com', 'email_verified' => 'true', 'nonce' => 'n-a',
]);

test('apple accepts a valid token and requires the nonce', function () use ($apple) {
    $identity = app(AppleTokenVerifier::class)->verify($apple(), 'n-a');
    expect($identity->providerUserId)->toBe('apl-1')->and($identity->emailVerified)->toBeTrue();

    expect(fn () => app(AppleTokenVerifier::class)->verify($apple(), null))
        ->toThrow(CustomerAuthException::class);
});

test('apple is unavailable when disabled', function () use ($apple) {
    config()->set('customer_auth.social.apple.enabled', false);
    expect(fn () => app(AppleTokenVerifier::class)->verify($apple(), 'n-a'))
        ->toThrow(CustomerAuthException::class);
});

test('auth options lists apple only when enabled and configured', function () {
    $this->getJson('/api/v1/auth/options')->assertJsonPath('social_providers', ['google', 'apple']);
    config()->set('customer_auth.social.apple.enabled', false);
    $this->getJson('/api/v1/auth/options')->assertJsonPath('social_providers', ['google']);
});
```

Check the getter name on `CustomerAuthException` (`code()`, `errorCode()`, or a public property) and use it. The verifiers are singletons, so if the service provider resolves config in a constructor, call `app()->forgetInstance(...)` in `beforeEach`.

- [ ] **Step 3: Run the tests and confirm they fail**

Run: `php artisan test tests/Feature/CustomerAuth/SocialTokenVerificationTest.php`
Expected: the wrong-nonce, no-client-ids, apple-accepts and options tests FAIL.

- [ ] **Step 4: Implement `GoogleTokenVerifier`**

Keep the `fake_google_token_` shortcut but limit it to the `testing` environment, so a local server that is reachable from the network cannot be logged into with a fake token. Then add the audience and nonce rules:

```php
    public function verify(string $idToken, ?string $nonce = null): SocialIdentity
    {
        $clientIds = (array) config('customer_auth.social.google.client_ids', []);

        if (app()->environment('testing') && str_starts_with($idToken, 'fake_google_token_')) {
            // ... (existing fake identity block unchanged)
        }

        if ($clientIds === []) {
            // من غير client id أي توكن جوجل لأي تطبيق كان هيتقبل
            throw new CustomerAuthException('auth.provider_unavailable', 422);
        }

        try {
            $payload = $this->decode($idToken, self::JWKS_URL, self::JWKS_CACHE_KEY);

            if (! in_array($payload->iss ?? '', ['accounts.google.com', 'https://accounts.google.com'], true)
                || ! in_array($payload->aud ?? '', $clientIds, true)
                || ($nonce !== null && ! hash_equals($nonce, (string) ($payload->nonce ?? '')))) {
                throw new CustomerAuthException('auth.social_token_invalid', 422);
            }

            return new SocialIdentity(
                provider: SocialProviderEnum::Google,
                providerUserId: (string) ($payload->sub ?? ''),
                email: isset($payload->email) ? (string) $payload->email : null,
                emailVerified: filter_var($payload->email_verified ?? false, FILTER_VALIDATE_BOOL),
                firstName: isset($payload->given_name) ? (string) $payload->given_name : null,
                lastName: isset($payload->family_name) ? (string) $payload->family_name : null,
            );
        } catch (CustomerAuthException $e) {
            throw $e;
        } catch (Throwable $e) {
            throw new CustomerAuthException('auth.social_token_invalid', 422, [], 'Invalid Google ID token', $e);
        }
    }
```

Put the shared JWKS + decode logic in a trait `app/Modules/V1/Customer/Auth/Social/Concerns/DecodesJwksTokens.php`, used by both verifiers:

```php
<?php

namespace App\Modules\V1\Customer\Auth\Social\Concerns;

use App\Modules\V1\Customer\Auth\Exceptions\CustomerAuthException;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

trait DecodesJwksTokens
{
    /** بيتحقق من التوقيع والـ exp؛ الـ iss/aud/nonce مسؤولية كل مزوّد */
    protected function decode(string $idToken, string $jwksUrl, string $cacheKey): object
    {
        $jwks = Cache::remember($cacheKey, 3600, function () use ($jwksUrl) {
            $response = Http::timeout(5)->get($jwksUrl);
            if (! $response->successful()) {
                throw new CustomerAuthException('auth.social_token_invalid', 422);
            }

            return $response->json();
        });

        JWT::$leeway = 60;

        return JWT::decode($idToken, JWK::parseKeySet($jwks, 'RS256'));
    }
}
```

- [ ] **Step 5: Implement `AppleTokenVerifier`**

```php
class AppleTokenVerifier implements SocialTokenVerifier
{
    use DecodesJwksTokens;

    public const JWKS_URL = 'https://appleid.apple.com/auth/keys';

    public const JWKS_CACHE_KEY = 'customer_auth.apple_jwks';

    public function verify(string $idToken, ?string $nonce = null): SocialIdentity
    {
        $clientIds = (array) config('customer_auth.social.apple.client_ids', []);

        if (! config('customer_auth.social.apple.enabled', false) || $clientIds === []) {
            throw new CustomerAuthException('auth.provider_unavailable', 422);
        }

        if (app()->environment('testing') && str_starts_with($idToken, 'fake_apple_token_')) {
            // ... (existing fake identity block unchanged)
        }

        try {
            $payload = $this->decode($idToken, self::JWKS_URL, self::JWKS_CACHE_KEY);

            // آبل لازم يبقى معاه nonce عشان نمنع إعادة استخدام توكن متسرّب
            if (($payload->iss ?? '') !== 'https://appleid.apple.com'
                || ! in_array($payload->aud ?? '', $clientIds, true)
                || $nonce === null
                || ! hash_equals($nonce, (string) ($payload->nonce ?? ''))) {
                throw new CustomerAuthException('auth.social_token_invalid', 422);
            }

            return new SocialIdentity(
                provider: SocialProviderEnum::Apple,
                providerUserId: (string) ($payload->sub ?? ''),
                email: isset($payload->email) ? (string) $payload->email : null,
                // آبل بيبعت email_verified كـ "true" نص أحياناً
                emailVerified: filter_var($payload->email_verified ?? false, FILTER_VALIDATE_BOOL),
                firstName: null, // الاسم بييجي من الـ client في أول دخول بس (spec §8.4)
                lastName: null,
            );
        } catch (CustomerAuthException $e) {
            throw $e;
        } catch (Throwable $e) {
            throw new CustomerAuthException('auth.social_token_invalid', 422, [], 'Invalid Apple ID token', $e);
        }
    }
}
```

The existing `SocialAuthTest` uses `fake_*` tokens or mocks. Check it still runs under `testing`. If it relied on the `local` shortcut, nothing changes, because Pest runs as `testing`.

- [ ] **Step 6: Implement `AuthOptionsController`**

```php
        if (config('customer_auth.social.apple.enabled') && ! empty(config('customer_auth.social.apple.client_ids'))) {
            $socialProviders[] = 'apple';
        }
```

- [ ] **Step 7: Run all social tests**

Run: `php artisan test --filter="Social"`
Expected: `SocialTokenVerificationTest` and `SocialAuthTest` all PASS.

- [ ] **Step 8: Commit**

```bash
git add config/customer_auth.php .env.example app/Modules/V1/Customer/Auth/Social app/Modules/V1/Customer/Auth/Http/Controllers/AuthOptionsController.php tests/Feature/CustomerAuth/SocialTokenVerificationTest.php
git commit -m "feat(customer-auth): verify google audience/nonce and implement apple id-token verification"
```

---

### Task 3: Web — route guard and post-auth redirect helpers + `proxy.ts`

**Files:**
- Modify: `apps/web/src/lib/data/constants/routes.constants.ts`
- Create: `apps/web/src/lib/utils/auth/route-guard.ts`, `route-guard.test.ts`
- Create: `apps/web/src/lib/utils/auth/post-auth-redirect.ts`, `post-auth-redirect.test.ts`
- Modify: `apps/web/src/middleware.config.ts`, `apps/web/src/proxy.ts`

**Interfaces:**
- Produces: `ROUTE_ONBOARDING = "/onboarding"`, `ROUTE_RESET_PASSWORD = "/reset-password"`.
- Produces: `guardRedirect(input: { path: string; search: string; hasSession: boolean; needsOnboarding: boolean }): { to: string; callback: string | null } | null`.
- Produces: `safeCallback(url: string | null | undefined): string | null`, `afterAuthPath(user: { onboarding: CustomerOnboarding }, callbackUrl?: string | null, opts?: { isNewAccount?: boolean }): string`.

- [ ] **Step 1: Add the route constants** (in `routes.constants.ts`, after `ROUTE_FORGOT_PASSWORD`)

```ts
export const ROUTE_RESET_PASSWORD = "/reset-password";
export const ROUTE_ONBOARDING = "/onboarding";
```

- [ ] **Step 2: Write the failing tests**

`src/lib/utils/auth/route-guard.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { guardRedirect, isProtectedPath } from "./route-guard.ts";

const base = { search: "", hasSession: false, needsOnboarding: false };

test("guests browse public pages and get sent to login from protected ones", () => {
  assert.equal(guardRedirect({ ...base, path: "/" }), null);
  assert.equal(guardRedirect({ ...base, path: "/salon/1" }), null);
  assert.deepEqual(guardRedirect({ ...base, path: "/bookings", search: "?x=1" }), { to: "/login", callback: "/bookings?x=1" });
  assert.deepEqual(guardRedirect({ ...base, path: "/onboarding" }), { to: "/login", callback: "/onboarding" });
});

test("a session with missing onboarding is sent to onboarding from protected pages only", () => {
  const s = { ...base, hasSession: true, needsOnboarding: true };
  assert.deepEqual(guardRedirect({ ...s, path: "/book/5" }), { to: "/onboarding", callback: "/book/5" });
  assert.equal(guardRedirect({ ...s, path: "/" }), null);
  assert.equal(guardRedirect({ ...s, path: "/onboarding" }), null);
});

test("auth pages with a session go home (or to onboarding), never loop", () => {
  const s = { ...base, hasSession: true };
  assert.deepEqual(guardRedirect({ ...s, path: "/login" }), { to: "/", callback: null });
  assert.deepEqual(guardRedirect({ ...s, path: "/register", needsOnboarding: true }), { to: "/onboarding", callback: null });
  // صفحات الكود/الاستعادة بتتفتح في نص الفلو، فمش بنحوّل منها
  assert.equal(guardRedirect({ ...s, path: "/verify-otp" }), null);
  assert.equal(guardRedirect({ ...s, path: "/reset-password" }), null);
  // الوجهة "/" نفسها مش محمية، فمفيش لوب لو التوكن اتلغى من السيرفر
  assert.equal(guardRedirect({ ...s, path: "/" }), null);
});

test("isProtectedPath matches sub paths but not prefixes of other words", () => {
  assert.ok(isProtectedPath("/account/profile"));
  assert.ok(!isProtectedPath("/accounting"));
});
```

`src/lib/utils/auth/post-auth-redirect.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { afterAuthPath, safeCallback } from "./post-auth-redirect.ts";

const done = { onboarding: { complete: true, missing: [], skippable: [] } } as const;
const optional = { onboarding: { complete: true, missing: [], skippable: ["location"] } } as const;
const incomplete = { onboarding: { complete: false, missing: ["phone"], skippable: [] } } as const;

test("safeCallback only allows same-site relative paths", () => {
  assert.equal(safeCallback("/book/1?x=2"), "/book/1?x=2");
  assert.equal(safeCallback("//evil.com"), null);
  assert.equal(safeCallback("/\\evil.com"), null);
  assert.equal(safeCallback("https://evil.com"), null);
  assert.equal(safeCallback(""), null);
  assert.equal(safeCallback(undefined), null);
});

test("complete accounts go back to the callback or home", () => {
  assert.equal(afterAuthPath(done, "/book/1"), "/book/1");
  assert.equal(afterAuthPath(done, "//evil.com"), "/");
  assert.equal(afterAuthPath(optional, null), "/");
});

test("incomplete accounts, and new accounts with optional steps, go to onboarding", () => {
  assert.equal(afterAuthPath(incomplete, "/book/1"), "/onboarding?callbackUrl=%2Fbook%2F1");
  assert.equal(afterAuthPath(optional, null, { isNewAccount: true }), "/onboarding?callbackUrl=%2F");
  assert.equal(afterAuthPath(done, null, { isNewAccount: true }), "/");
});
```

- [ ] **Step 3: Run the tests and confirm they fail**

Run: `cd apps/web && pnpm test`
Expected: FAIL, `Cannot find module './route-guard.ts'` and `'./post-auth-redirect.ts'`.

- [ ] **Step 4: Implement**

`src/lib/utils/auth/route-guard.ts`:

```ts
// قرار التحويل في proxy.ts كدالة نقية عشان تتختبر — بتعتمد على الكوكيز بس، من غير API call
import {
  ROUTE_ACCOUNT,
  ROUTE_BOOKINGS,
  ROUTE_BOOK_ROOT,
  ROUTE_FORGOT_PASSWORD,
  ROUTE_HOME,
  ROUTE_LOGIN,
  ROUTE_ONBOARDING,
  ROUTE_REGISTER,
} from "../../data/constants/routes.constants.ts";

// مسار الحجز كله محمي — مطابق للموبايل
export const PROTECTED_ROUTES = [ROUTE_BOOK_ROOT, ROUTE_BOOKINGS, ROUTE_ACCOUNT] as const;
/** صفحات للزوار بس؛ verify-otp و reset-password مش هنا لأنها بتتفتح في نص الفلو */
const GUEST_ONLY_ROUTES = [ROUTE_LOGIN, ROUTE_REGISTER, ROUTE_FORGOT_PASSWORD] as const;

function matches(routes: readonly string[], path: string): boolean {
  return routes.some((route) => path === route || path.startsWith(`${route}/`));
}

export function isProtectedPath(pathnameWithoutLocale: string): boolean {
  return matches(PROTECTED_ROUTES, pathnameWithoutLocale);
}

export interface GuardInput {
  path: string;
  search: string;
  hasSession: boolean;
  needsOnboarding: boolean;
}

export interface GuardRedirect {
  to: string;
  callback: string | null;
}

export function guardRedirect({ path, search, hasSession, needsOnboarding }: GuardInput): GuardRedirect | null {
  const isProtected = isProtectedPath(path);
  const isOnboarding = matches([ROUTE_ONBOARDING], path);

  if (!hasSession) {
    return isProtected || isOnboarding ? { to: ROUTE_LOGIN, callback: path + search } : null;
  }
  if (matches(GUEST_ONLY_ROUTES, path)) {
    return { to: needsOnboarding ? ROUTE_ONBOARDING : ROUTE_HOME, callback: null };
  }
  if (needsOnboarding && isProtected) {
    return { to: ROUTE_ONBOARDING, callback: path + search };
  }
  return null;
}
```

`routes.constants.ts` reads `process.env.NEXT_PUBLIC_SALON_PANEL_URL` at import time. That is safe under `node --test`. If the import fails because `routes.constants.ts` has no `.ts`-extension-safe imports, it does not matter, since it has no imports.

`src/lib/utils/auth/post-auth-redirect.ts`:

```ts
// بعد أي دخول: نرجّع المستخدم للمكان اللي كان رايحه، أو للـ onboarding لو حسابه ناقص
import { CALLBACK_PARAM } from "../../data/constants/app.constants.ts";
import { ROUTE_HOME, ROUTE_ONBOARDING } from "../../data/constants/routes.constants.ts";
import type { CustomerOnboarding } from "../../types/auth/customer.interface.ts";

/** مسار نسبي في نفس الموقع بس — يمنع open redirect زي //evil.com */
export function safeCallback(url: string | null | undefined): string | null {
  if (!url || !url.startsWith("/") || url.startsWith("//") || url.startsWith("/\\")) return null;
  return url;
}

export function afterAuthPath(
  user: { onboarding: CustomerOnboarding },
  callbackUrl?: string | null,
  opts: { isNewAccount?: boolean } = {},
): string {
  const back = safeCallback(callbackUrl) ?? ROUTE_HOME;
  // حساب جديد بنسأله على الموقع وتاريخ الميلاد مرة واحدة حتى لو مش إجباريين
  const askOptional = opts.isNewAccount === true && user.onboarding.skippable.length > 0;
  if (!user.onboarding.complete || askOptional) {
    return `${ROUTE_ONBOARDING}?${CALLBACK_PARAM}=${encodeURIComponent(back)}`;
  }
  return back;
}
```

`src/middleware.config.ts` becomes a re-export, so existing imports keep working:

```ts
// المسارات المحمية — المنطق نفسه في lib/utils/auth/route-guard.ts عشان يتختبر
export { PROTECTED_ROUTES, isProtectedPath } from "@/lib/utils/auth/route-guard";
```

`src/proxy.ts`, replacing the body of `proxy()` above `return intl(request)`:

```ts
import { CALLBACK_PARAM, ONBOARDING_COOKIE, SESSION_COOKIE } from "@/lib/data/constants/app.constants";
import { guardRedirect } from "@/lib/utils/auth/route-guard";
// (remove the ROUTE_LOGIN and isProtectedPath imports)

  const redirect = guardRedirect({
    path: pathWithoutLocale,
    search: request.nextUrl.search,
    hasSession: request.cookies.has(SESSION_COOKIE),
    needsOnboarding: request.cookies.has(ONBOARDING_COOKIE),
  });

  if (redirect) {
    const url = new URL(`/${locale}${redirect.to === "/" ? "" : redirect.to}`, request.url);
    if (redirect.callback) url.searchParams.set(CALLBACK_PARAM, redirect.callback);
    return NextResponse.redirect(url);
  }
```

- [ ] **Step 5: Run the tests, type check and lint**

Run: `cd apps/web && pnpm test && npx tsc --noEmit && npx eslint src/proxy.ts src/middleware.config.ts src/lib/utils/auth`
Expected: all PASS, no type or lint errors. If `tsc` complains about importing `.ts` in `post-auth-redirect.ts` from an alias consumer, confirm `allowImportingTsExtensions` is on (it is, in `tsconfig.json`).

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/data/constants/routes.constants.ts apps/web/src/lib/utils/auth/route-guard* apps/web/src/lib/utils/auth/post-auth-redirect* apps/web/src/middleware.config.ts apps/web/src/proxy.ts
git commit -m "feat(web): onboarding-aware route guard and safe post-auth redirects"
```

---

### Task 4: Web — onboarding data layer (phone verification, location, step logic)

**Files:**
- Modify: `apps/web/src/lib/data/constants/query-keys.constants.ts`
- Create: `apps/web/src/lib/types/auth/phone-verification.dto.ts`; export from `lib/types/auth/index.ts`
- Create: `apps/web/src/lib/utils/location/browser-position.ts`, `browser-position.test.ts`
- Create: `apps/web/src/lib/utils/auth/onboarding-steps.ts`, `onboarding-steps.test.ts`
- Modify: `apps/web/src/lib/actions/auth/auth.action.ts` (export `openSession`)
- Modify: `apps/web/src/lib/actions/user/user.action.ts`
- Create: `apps/web/src/lib/actions/user/location.action.ts`
- Modify: `apps/web/src/lib/types/auth/customer.interface.ts`, `apps/web/src/lib/utils/auth/laravel-mappers.ts` (location source adds `manual`)
- Create: `apps/web/src/lib/hooks/user/use-send-phone-otp.hook.ts`, `use-verify-phone.hook.ts`, `use-location-estimate.hook.ts`, `use-detect-position.hook.ts`, `use-save-location.hook.ts`; export from `lib/hooks/user/index.ts`

**Interfaces:**
- Produces types: `PhoneVerificationDto { phone: string; channel?: "whatsapp" | "sms" }`, `VerifyPhoneDto { phone: string; code: string }`.
- Produces: `sendPhoneVerification(dto): Promise<OtpChallenge>`, `verifyPhone(dto): Promise<AuthSession>` (replaces the stored token, see spec §8.5 merge).
- Produces types: `LocationSource = "gps" | "ip" | "manual"`. `CustomerLocation.source` and `RawCustomer.location.source` widen to it.
- Produces: `updateLocation(input: { lat: number; lng: number; source: "gps" | "manual" } | null): Promise<Customer>`. `null` asks the server for its IP fallback.
- Produces: `getLocationEstimate(): Promise<{ lat: number; lng: number } | null>` (read-only, Task 1b).
- Produces: `syncLocation(user: Customer): Promise<Customer | null>`.
- Produces: `PositionFailure = "denied" | "unavailable" | "timeout" | "unsupported"`.
- Produces: `isInEgypt(lat, lng): boolean`, `positionErrorReason(code: number): PositionFailure`, `requestBrowserPosition(): Promise<PositionResult>`, `geolocationPermission(): Promise<PermissionState | "unsupported">`, `shouldRefreshLocation(location: CustomerLocation | null, permission: PermissionState | "unsupported", now: number): boolean`.
- Produces: `type OnboardingStepId = "phone" | "profile" | "location" | "birth_date"`, `nextOnboardingStep(onboarding: CustomerOnboarding, skipped: ReadonlySet<OnboardingStepId>): OnboardingStepId | null`.
- Produces hooks: `useSendPhoneOtp()`, `useVerifyPhone()`, `useLocationEstimate(enabled: boolean)` (query → `{ lat, lng } | null`), `useDetectPosition()` (mutation → `PositionResult`, opens the browser permission prompt), `useSaveLocation()` (mutation over `updateLocation`, writes `QK_USER`).
- Produces: `QK_LOCATION_ESTIMATE = ["user", "location-estimate"] as const`.
- Produces: `QK_LOCATION_SYNC = (userId: string) => ["user", userId, "location-sync"] as const`.

- [ ] **Step 1: Write the failing tests**

`src/lib/utils/location/browser-position.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { isInEgypt, positionErrorReason, shouldRefreshLocation } from "./browser-position.ts";

test("isInEgypt mirrors the server bounding box", () => {
  assert.ok(isInEgypt(30.0444, 31.2357)); // القاهرة
  assert.ok(isInEgypt(21.5, 24.5));
  assert.ok(!isInEgypt(51.5, -0.12)); // لندن
  assert.ok(!isInEgypt(Number.NaN, 31));
});

test("positionErrorReason maps GeolocationPositionError codes", () => {
  assert.equal(positionErrorReason(1), "denied");
  assert.equal(positionErrorReason(2), "unavailable");
  assert.equal(positionErrorReason(3), "timeout");
  assert.equal(positionErrorReason(99), "unavailable");
});

test("shouldRefreshLocation only refreshes with permission and a stale or coarse location", () => {
  const now = Date.parse("2026-10-01T12:00:00Z");
  const fresh = { lat: 30, lng: 31, source: "gps" as const, updatedAt: "2026-10-01T06:00:00Z" };
  const stale = { ...fresh, updatedAt: "2026-09-29T12:00:00Z" };
  const ip = { ...fresh, source: "ip" as const };

  assert.equal(shouldRefreshLocation(null, "granted", now), true);
  assert.equal(shouldRefreshLocation(fresh, "granted", now), false);
  assert.equal(shouldRefreshLocation(stale, "granted", now), true);
  assert.equal(shouldRefreshLocation(ip, "granted", now), true);
  assert.equal(shouldRefreshLocation({ ...fresh, updatedAt: null }, "granted", now), true);
  // الدبوس اللي العميل حطه بنفسه (VPN مثلاً) مبيتغيرش في الخلفية أبداً، حتى لو قديم
  assert.equal(shouldRefreshLocation({ ...stale, source: "manual" as const }, "granted", now), false);
  // من غير إذن مسبق مبنطلعش popup لوحدنا
  assert.equal(shouldRefreshLocation(null, "prompt", now), false);
  assert.equal(shouldRefreshLocation(null, "denied", now), false);
  assert.equal(shouldRefreshLocation(null, "unsupported", now), false);
});
```

`src/lib/utils/auth/onboarding-steps.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { nextOnboardingStep } from "./onboarding-steps.ts";

const none = new Set<never>();

test("required steps come first, in order", () => {
  const o = { complete: false, missing: ["phone", "name", "terms"] as const, skippable: ["location", "birth_date"] as const };
  assert.equal(nextOnboardingStep({ ...o, missing: [...o.missing], skippable: [...o.skippable] }, none), "phone");
  assert.equal(nextOnboardingStep({ ...o, missing: ["terms"], skippable: [] }, none), "profile");
});

test("optional steps follow and can be skipped", () => {
  const o = { complete: true, missing: [], skippable: ["location", "birth_date"] } as Parameters<typeof nextOnboardingStep>[0];
  assert.equal(nextOnboardingStep(o, none), "location");
  assert.equal(nextOnboardingStep(o, new Set(["location"])), "birth_date");
  assert.equal(nextOnboardingStep(o, new Set(["location", "birth_date"])), null);
});

test("required steps ignore the skipped set", () => {
  const o = { complete: false, missing: ["phone"], skippable: [] } as Parameters<typeof nextOnboardingStep>[0];
  assert.equal(nextOnboardingStep(o, new Set(["phone"])), "phone");
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `cd apps/web && pnpm test`
Expected: FAIL, both modules not found.

- [ ] **Step 3: Implement the pure helpers**

`src/lib/utils/location/browser-position.ts`:

```ts
// موقع المتصفح للـ onboarding ولتحديث الموقع — الأجزاء النقية متختبرة، والباقي wrapper رفيع حوالين navigator
import type { CustomerLocation } from "../../types/auth/customer.interface.ts";

export type PositionFailure = "denied" | "unavailable" | "timeout" | "unsupported";
export type PositionResult = { ok: true; lat: number; lng: number } | { ok: false; reason: PositionFailure };

/** نفس صندوق مصر اللي في UpdateLocationRequest على السيرفر */
export function isInEgypt(lat: number, lng: number): boolean {
  return lat >= 21.5 && lat <= 32.0 && lng >= 24.5 && lng <= 37.0;
}

export function positionErrorReason(code: number): PositionFailure {
  if (code === 1) return "denied";
  if (code === 3) return "timeout";
  return "unavailable";
}

const REFRESH_AFTER_MS = 24 * 60 * 60 * 1000;

/** بنحدّث الموقع في الخلفية بس لو الإذن متاخد قبل كده — عمرنا ما بنطلع popup من غير ما المستخدم يدوس */
export function shouldRefreshLocation(
  location: CustomerLocation | null,
  permission: PermissionState | "unsupported",
  now: number,
): boolean {
  if (permission !== "granted") return false;
  if (location?.source === "manual") return false; // اختيار العميل أهم من أي قراءة تلقائية
  if (!location || location.source === "ip" || !location.updatedAt) return true;
  return now - Date.parse(location.updatedAt) > REFRESH_AFTER_MS;
}

export function requestBrowserPosition(): Promise<PositionResult> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve({ ok: false, reason: "unsupported" });
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ ok: true, lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => resolve({ ok: false, reason: positionErrorReason(err.code) }),
      // دقة متوسطة تكفي لترتيب "الأقرب ليك" وأسرع وأقل استهلاك للبطارية
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  });
}

export async function geolocationPermission(): Promise<PermissionState | "unsupported"> {
  try {
    if (typeof navigator === "undefined" || !navigator.permissions) return "unsupported";
    return (await navigator.permissions.query({ name: "geolocation" })).state;
  } catch {
    return "unsupported"; // Safari القديم بيرمي هنا
  }
}
```

`src/lib/utils/auth/onboarding-steps.ts`:

```ts
// الخطوة الجاية في الـ onboarding — بتتحسب من onboarding بتاع المستخدم + الخطوات اللي اتخطت
import type { CustomerOnboarding } from "../../types/auth/customer.interface.ts";

export type OnboardingStepId = "phone" | "profile" | "location" | "birth_date";

export function nextOnboardingStep(
  onboarding: CustomerOnboarding,
  skipped: ReadonlySet<OnboardingStepId>,
): OnboardingStepId | null {
  if (onboarding.missing.includes("phone")) return "phone";
  if (onboarding.missing.includes("name") || onboarding.missing.includes("terms")) return "profile";
  if (onboarding.skippable.includes("location") && !skipped.has("location")) return "location";
  if (onboarding.skippable.includes("birth_date") && !skipped.has("birth_date")) return "birth_date";
  return null;
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: DTOs, query key, actions**

`src/lib/types/auth/phone-verification.dto.ts`:

```ts
// تأكيد/إضافة رقم موبايل من جوه الحساب (خطوة الـ onboarding للحسابات الاجتماعية)
export interface PhoneVerificationDto {
  phone: string;
  channel?: "whatsapp" | "sms";
}

export interface VerifyPhoneDto {
  phone: string;
  code: string;
}
```

Add `export * from "./phone-verification.dto";` to `lib/types/auth/index.ts`.

Widen the location source type. In `lib/types/auth/customer.interface.ts`:

```ts
/** gps = المتصفح، ip = تخمين السيرفر، manual = العميل حط الدبوس بنفسه على الخريطة */
export type LocationSource = "gps" | "ip" | "manual";

export interface CustomerLocation {
  lat: number;
  lng: number;
  source: LocationSource;
  updatedAt: string | null;
}
```

In `lib/utils/auth/laravel-mappers.ts`, change `RawCustomer.location.source` to `LocationSource` (import it with the other types).

`query-keys.constants.ts`:

```ts
/** تخمين الموقع من الـ IP لتوسيط الخريطة — مبيتحفظش */
export const QK_LOCATION_ESTIMATE = ["user", "location-estimate"] as const;
/** تحديث موقع المستخدم في الخلفية — مرة لكل مستخدم في اليوم */
export const QK_LOCATION_SYNC = (userId: string) => ["user", userId, "location-sync"] as const;
/** توكن إعادة تعيين كلمة السر بعد تأكيد الكود — في الذاكرة بس، بيضيع مع الـ refresh عن قصد */
export const QK_RESET_TOKEN = ["auth", "reset-token"] as const;
```

In `auth.action.ts`, change `function openSession` to `export function openSession`.

Append to `user.action.ts`:

```ts
import type { AuthSession, OtpChallenge, PhoneVerificationDto, VerifyPhoneDto } from "@/lib/types/auth";
import { mapOtpChallenge, type RawAuthSession, type RawOtpChallenge } from "@/lib/utils/auth/laravel-mappers";
import { openSession } from "@/lib/actions/auth/auth.action";

export async function sendPhoneVerification(dto: PhoneVerificationDto): Promise<OtpChallenge> {
  return mapOtpChallenge(await apiClient.post<RawOtpChallenge>("/me/phone", dto));
}

/** لو الرقم بتاع حساب تاني، السيرفر بيدمج وبيرجّع توكن لحساب تاني — لازم نبدّل التوكن المحفوظ (spec §8.5) */
export async function verifyPhone(dto: VerifyPhoneDto): Promise<AuthSession> {
  const raw = await apiClient.post<RawAuthSession>("/me/phone/verify", {
    phone: dto.phone,
    code: dto.code,
    device_name: "web",
  });
  return openSession(raw);
}
```

Merge these into the file's existing import lines instead of duplicating them.

`src/lib/actions/user/location.action.ts`:

```ts
// موقع العميل — بيتحفظ lat/lng على السيرفر عشان ترتيب "الصالونات الأقرب ليك"
import { apiClient } from "@/lib/api";
import type { Customer } from "@/lib/types/auth";
import { mapCustomer, type RawCustomer } from "@/lib/utils/auth/laravel-mappers";
import {
  geolocationPermission,
  isInEgypt,
  requestBrowserPosition,
  shouldRefreshLocation,
} from "@/lib/utils/location/browser-position";

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * بيحفظ الموقع. manual = العميل حرّك الدبوس، gps = المتصفح زي ما هو.
 * null = السيرفر يخمّن من الـ IP (ومبيمسحش موقع gps/manual موجود).
 */
export async function updateLocation(input: (LatLng & { source: "gps" | "manual" }) | null): Promise<Customer> {
  return mapCustomer(await apiClient.put<RawCustomer>("/me/location", input ?? {}));
}

/** تخمين من الـ IP لتوسيط الخريطة بس — مبيتحفظش. null لو فشل أو برا مصر (VPN) */
export async function getLocationEstimate(): Promise<LatLng | null> {
  return (await apiClient.get<{ estimate: LatLng | null }>("/me/location/estimate")).estimate;
}

/** تحديث صامت: بس لو الإذن متاخد قبل كده والموقع قديم أو تقريبي (ومش manual). null = مفيش تحديث */
export async function syncLocation(user: Customer): Promise<Customer | null> {
  if (!shouldRefreshLocation(user.location, await geolocationPermission(), Date.now())) return null;
  const pos = await requestBrowserPosition();
  if (!pos.ok || !isInEgypt(pos.lat, pos.lng)) return null;
  return updateLocation({ lat: pos.lat, lng: pos.lng, source: "gps" });
}
```

- [ ] **Step 6: Hooks**

`src/lib/hooks/user/use-send-phone-otp.hook.ts`:

```ts
// إرسال كود لتأكيد رقم الموبايل من جوه الحساب
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendPhoneVerification } from "@/lib/actions/user/user.action";
import type { PhoneVerificationDto } from "@/lib/types/auth";
import { rememberOtpChallenge } from "@/lib/hooks/auth/use-otp-challenge.hook";

export function useSendPhoneOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: PhoneVerificationDto) => sendPhoneVerification(dto),
    onSuccess: (challenge) => rememberOtpChallenge(queryClient, challenge),
  });
}
```

`src/lib/hooks/user/use-verify-phone.hook.ts`:

```ts
// تأكيد الرقم — ممكن يرجّع مستخدم مختلف لو حصل دمج، فبنستبدل الكاش كله بتاع المستخدم
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyPhone } from "@/lib/actions/user/user.action";
import { QK_USER } from "@/lib/data/constants/query-keys.constants";
import type { VerifyPhoneDto } from "@/lib/types/auth";

export function useVerifyPhone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: VerifyPhoneDto) => verifyPhone(dto),
    onSuccess: (session) => queryClient.setQueryData(QK_USER, session.user),
  });
}
```

`src/lib/hooks/user/use-location-estimate.hook.ts`:

```ts
// نقطة البداية للخريطة من الـ IP — بتتجاب مرة واحدة ومبتتحفظش على السيرفر
import { useQuery } from "@tanstack/react-query";
import { getLocationEstimate } from "@/lib/actions/user/location.action";
import { QK_LOCATION_ESTIMATE } from "@/lib/data/constants/query-keys.constants";

export function useLocationEstimate(enabled: boolean) {
  return useQuery({
    queryKey: QK_LOCATION_ESTIMATE,
    queryFn: getLocationEstimate,
    enabled,
    staleTime: Infinity,
    retry: false,
  });
}
```

`src/lib/hooks/user/use-detect-position.hook.ts`:

```ts
// بيطلب إذن الموقع من المتصفح (لازم يتنادى من ضغطة زرار) — بيرجّع النتيجة من غير ما يحفظ حاجة
import { useMutation } from "@tanstack/react-query";
import { requestBrowserPosition } from "@/lib/utils/location/browser-position";

export function useDetectPosition() {
  return useMutation({ mutationFn: () => requestBrowserPosition() });
}
```

`src/lib/hooks/user/use-save-location.hook.ts`:

```ts
// حفظ الموقع اللي العميل أكّده على الخريطة
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLocation, type LatLng } from "@/lib/actions/user/location.action";
import { QK_USER } from "@/lib/data/constants/query-keys.constants";

export function useSaveLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: (LatLng & { source: "gps" | "manual" }) | null) => updateLocation(input),
    onSuccess: (user) => queryClient.setQueryData(QK_USER, user),
  });
}
```

Add the five new hooks (`use-send-phone-otp`, `use-verify-phone`, `use-location-estimate`, `use-detect-position`, `use-save-location`) to `lib/hooks/user/index.ts`.

- [ ] **Step 7: Type check, lint, test**

Run: `cd apps/web && pnpm test && npx tsc --noEmit && npx eslint src/lib`
Expected: clean.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/lib
git commit -m "feat(web): onboarding data layer — phone verification, location sharing, step logic"
```

---

### Task 5: Web — shared `OtpCodeInput` and `PasswordRequirements`

`OtpForm`, the onboarding phone step and the profile email dialog all need the same 6-box code input. Extract it once.

**Files:**
- Create: `apps/web/src/app/[locale]/(auth)/__components/otp-code-input/otp-code-input.tsx`, `index.ts`
- Modify: `apps/web/src/app/[locale]/(auth)/verify-otp/__components/otp-form/otp-form.tsx`
- Move: `apps/web/src/app/[locale]/(auth)/register/__components/password-requirements/` → `apps/web/src/app/[locale]/(auth)/__components/password-requirements/`, and update the import in `register-form.tsx`.

**Interfaces:**
- Produces: `<OtpCodeInput length={number} value={string} onChange={(code: string) => void} hasError={boolean} autoFocus?={boolean} />`. The value is the joined digits, and the component owns focus and paste handling.

- [ ] **Step 1: Create `OtpCodeInput`**

Move the slot rendering, `handleDigitChange`, `handleKeyDown`, `handlePaste`, `inputRefs` and `activeIndex` out of `otp-form.tsx` into this component. Keep the exact markup and classes, from the `<div dir="ltr" onPaste=...>` block down to the closing `</div>` of the slots. State is controlled through `value`:

```tsx
"use client";

// خانات كود التأكيد (FRAME 13C) — مشتركة بين التأكيد والـ onboarding وتأكيد البريد
import { useEffect, useRef, useState } from "react";

interface OtpCodeInputProps {
  length: number;
  value: string;
  onChange: (code: string) => void;
  hasError?: boolean;
  autoFocus?: boolean;
}

export function OtpCodeInput({ length, value, onChange, hasError = false, autoFocus = true }: OtpCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const slots = Array.from({ length }, (_, i) => value[i] ?? "");

  useEffect(() => {
    if (autoFocus) inputRefs.current[0]?.focus();
  }, [autoFocus]);

  // لما الكود يتمسح من برا (كود غلط/إعادة إرسال) نرجّع التركيز لأول خانة
  useEffect(() => {
    if (value === "") {
      setActiveIndex(0);
      inputRefs.current[0]?.focus();
    }
  }, [value]);

  function setSlot(index: number, char: string) {
    const next = [...slots];
    next[index] = char;
    onChange(next.join("").slice(0, length));
  }

  function focus(index: number) {
    setActiveIndex(index);
    inputRefs.current[index]?.focus();
  }

  function handleDigitChange(index: number, raw: string) {
    const char = raw.replace(/\D/g, "").slice(-1);
    setSlot(index, char);
    if (char && index < length - 1) focus(index + 1);
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !slots[index] && index > 0) {
      setSlot(index - 1, "");
      focus(index - 1);
    } else if (e.key === "ArrowLeft" && index > 0) {
      focus(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focus(index + 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focus(Math.min(pasted.length, length - 1));
  }

  return (
    <div dir="ltr" onPaste={handlePaste} className="flex justify-center gap-3 w-full">
      {/* (paste the existing slots.map(...) JSX from otp-form.tsx here unchanged,
          replacing digit → slots[idx] and handlers with the ones above) */}
    </div>
  );
}
```

Write the final file with the real `slots.map` JSX copied from `otp-form.tsx` (lines with `relative flex flex-1 max-w-[72px] h-[72px]` ...). Do not leave the comment placeholder.

Note that `value[i]` with a deleted middle slot shifts characters left. That is acceptable for a 6-digit code and matches what users expect when they backspace.

- [ ] **Step 2: Use it in `OtpForm`**

In `otp-form.tsx` replace the `digits` state with `const [code, setCode] = useState("")`. Delete the moved handlers and refs, and change `resetDigits()` to `setCode("")`. Compute `isComplete = code.length === codeLength`, and replace the slots block with:

```tsx
<OtpCodeInput length={codeLength} value={code} onChange={(next) => { setError(null); setCode(next); }} hasError={hasError} />
```

- [ ] **Step 3: Move `PasswordRequirements`**

```bash
git mv "apps/web/src/app/[locale]/(auth)/register/__components/password-requirements" "apps/web/src/app/[locale]/(auth)/__components/password-requirements"
```

In `register-form.tsx`, change the import to `import { PasswordRequirements } from "../../../__components/password-requirements";`.

- [ ] **Step 4: Verify**

Run: `cd apps/web && npx tsc --noEmit && npx eslint "src/app/[locale]/(auth)"`
Expected: clean. Then run `pnpm dev`, open `/ar/login`, choose code login with the fixed dev code (`OTP_FIXED_CODE`), and confirm typing, paste, backspace, a wrong code clearing the boxes, and resend all behave as before.

- [ ] **Step 5: Commit**

```bash
git add "apps/web/src/app/[locale]/(auth)"
git commit -m "refactor(web): extract OtpCodeInput and share PasswordRequirements"
```

---

### Task 6: Web — reset password flow (forgot → code → new password)

Flow: `/forgot-password` → `POST /auth/password/forgot` → `/verify-otp?purpose=reset_password&identifier=…` → `POST /auth/password/verify` → reset token stored **in memory** (React Query cache) → `/reset-password` → `POST /auth/password/reset` → new session → `afterAuthPath`.

The token is never put in the URL, so it can't leak through history or the Referer header. A refresh on `/reset-password` loses it and the user starts again.

**Files:**
- Create: `apps/web/src/lib/utils/auth/reset-token-state.ts`, `reset-token-state.test.ts`
- Create: `apps/web/src/lib/hooks/auth/use-reset-token.hook.ts`; export from `lib/hooks/auth/index.ts`
- Modify: `apps/web/src/lib/hooks/auth/use-forgot-password.hook.ts`, `use-verify-reset-code.hook.ts`, `use-reset-password.hook.ts`, `use-otp-challenge.hook.ts`
- Modify: `apps/web/src/app/[locale]/(auth)/forgot-password/__components/forgot-password-form/forgot-password-form.tsx`
- Modify: `apps/web/src/app/[locale]/(auth)/verify-otp/page.tsx`, `verify-otp/__components/otp-form/otp-form.tsx`
- Create: `apps/web/src/app/[locale]/(auth)/reset-password/page.tsx`
- Create: `apps/web/src/app/[locale]/(auth)/reset-password/__components/reset-password-form/{reset-password-form.tsx,reset-password-form.schema.ts,reset-password-form.schema.test.ts,index.ts}`
- Modify: `apps/web/src/lib/data/constants/metadata.constants.ts` (add `METADATA_RESET_PASSWORD`, copying `METADATA_FORGOT_PASSWORD`'s shape)

**Interfaces:**
- Consumes: `afterAuthPath` (Task 3), `ROUTE_RESET_PASSWORD` (Task 3), `QK_RESET_TOKEN` (Task 4), `OtpCodeInput` and `PasswordRequirements` (Task 5).
- Produces: `resetTokenState(token: ResetToken | null | undefined, now: number): "ok" | "missing" | "expired"`.
- Produces: `useResetToken(): ResetToken | null`.
- Produces: `validateResetPassword(password: string, confirmation: string): { password?: string; confirmation?: string }`.
- Produces: the `OtpForm` props become `{ identifier: string; purpose: "register" | "login" | "reset_password"; callbackUrl?: string }`.

- [ ] **Step 1: Write the failing tests**

`src/lib/utils/auth/reset-token-state.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { resetTokenState } from "./reset-token-state.ts";

test("missing, expired and valid reset tokens", () => {
  const now = Date.parse("2026-10-01T12:00:00Z");
  assert.equal(resetTokenState(null, now), "missing");
  assert.equal(resetTokenState(undefined, now), "missing");
  assert.equal(resetTokenState({ resetToken: "", expiresAt: "2026-10-01T12:05:00Z" }, now), "missing");
  assert.equal(resetTokenState({ resetToken: "t", expiresAt: "2026-10-01T11:59:59Z" }, now), "expired");
  assert.equal(resetTokenState({ resetToken: "t", expiresAt: "not a date" }, now), "expired");
  assert.equal(resetTokenState({ resetToken: "t", expiresAt: "2026-10-01T12:05:00Z" }, now), "ok");
});
```

`reset-password-form.schema.test.ts`, in the reset-password form folder:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { validateResetPassword } from "./reset-password-form.schema.ts";

test("password must meet the rules and match the confirmation", () => {
  assert.deepEqual(validateResetPassword("abc12345", "abc12345"), {});
  assert.ok(validateResetPassword("short1", "short1").password);
  assert.ok(validateResetPassword("abcdefgh", "abcdefgh").password); // من غير أرقام
  assert.deepEqual(Object.keys(validateResetPassword("abc12345", "abc12346")), ["confirmation"]);
  assert.ok(validateResetPassword("", "").password);
});
```

The `package.json` test glob is `src/**/*.test.ts`. Brackets and parentheses in the `app/[locale]/(auth)` path are matched by Node's glob as literal directory names. If they are not, move the schema and its test to `src/lib/utils/auth/reset-password.schema.ts` and import from there.

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `cd apps/web && pnpm test`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the pure helpers**

`src/lib/utils/auth/reset-token-state.ts`:

```ts
// حالة توكن إعادة التعيين: صالح 10 دقايق ولمرة واحدة، ومش بيتبعت فاضي أبداً
import type { ResetToken } from "../../types/auth/forgot-password.dto.ts";

export function resetTokenState(token: ResetToken | null | undefined, now: number): "ok" | "missing" | "expired" {
  if (!token || !token.resetToken) return "missing";
  const expires = Date.parse(token.expiresAt);
  if (!Number.isFinite(expires) || expires <= now) return "expired";
  return "ok";
}
```

`reset-password-form.schema.ts`:

```ts
// تحقق نموذج كلمة السر الجديدة — نفس قواعد التسجيل (8 حروف ورقم)
import { checkPasswordCriteria } from "../../../../../../lib/utils/auth-validation.utils.ts";

export interface ResetPasswordFormErrors {
  password?: string;
  confirmation?: string;
}

export function validateResetPassword(password: string, confirmation: string): ResetPasswordFormErrors {
  if (!checkPasswordCriteria(password).isValid) {
    return { password: "كلمة السر لازم تبقى 8 حروف على الأقل وفيها رقم." };
  }
  if (password !== confirmation) return { confirmation: "كلمتين السر مش زي بعض." };
  return {};
}
```

`auth-validation.utils.ts` imports `libphonenumber-js/mobile`, which resolves under Node, so the relative import works in tests. Count the `../` segments from the schema's folder to `src/` when writing the file.

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Hooks**

`use-otp-challenge.hook.ts`: key the challenge by phone **or** email.

```ts
/** موبايل بأي صيغة بيتوحّد لـ 01XXXXXXXXX، والبريد lowercase — نفس اللي السيرفر بيرجّعه */
function identifierKey(identifier: string): string {
  const value = identifier.trim();
  return value.includes("@") ? value.toLowerCase() : formatLocalEgyptianPhone(value);
}

export function useOtpChallenge(purpose: OtpChallenge["purpose"], identifier: string) {
  return useQuery<OtpChallenge | null>({
    queryKey: QK_OTP_CHALLENGE(purpose, identifierKey(identifier)),
    queryFn: () => null,
    enabled: false,
    staleTime: Infinity,
  });
}
```

`use-forgot-password.hook.ts`: remember the challenge so the code page shows the countdown.

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { forgotPassword } from "@/lib/actions/auth/auth.action";
import type { ForgotPasswordDto } from "@/lib/types/auth";
import { rememberOtpChallenge } from "./use-otp-challenge.hook";

export function useForgotPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ForgotPasswordDto) => forgotPassword(dto),
    onSuccess: (challenge) => rememberOtpChallenge(queryClient, challenge),
  });
}
```

`use-verify-reset-code.hook.ts`:

```ts
// تأكيد كود الاستعادة ← توكن إعادة تعيين لمرة واحدة، بيتحفظ في الذاكرة بس (مش في الرابط)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyResetCode } from "@/lib/actions/auth/auth.action";
import { QK_RESET_TOKEN } from "@/lib/data/constants/query-keys.constants";
import type { VerifyResetCodeDto } from "@/lib/types/auth";

export function useVerifyResetCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: VerifyResetCodeDto) => verifyResetCode(dto),
    onSuccess: (token) => queryClient.setQueryData(QK_RESET_TOKEN, token),
  });
}
```

`use-reset-token.hook.ts`:

```ts
// قراءة توكن إعادة التعيين من الكاش — null لو الصفحة اتفتحت مباشرة أو بعد refresh
import { useQuery } from "@tanstack/react-query";
import { QK_RESET_TOKEN } from "@/lib/data/constants/query-keys.constants";
import type { ResetToken } from "@/lib/types/auth";

export function useResetToken(): ResetToken | null {
  const { data } = useQuery<ResetToken | null>({
    queryKey: QK_RESET_TOKEN,
    queryFn: () => null,
    enabled: false,
    staleTime: Infinity,
  });
  return data ?? null;
}
```

`use-reset-password.hook.ts`: the token is single use, so drop it on success.

```ts
    onSuccess: (session) => {
      queryClient.setQueryData(QK_USER, session.user);
      queryClient.removeQueries({ queryKey: QK_RESET_TOKEN });
    },
```

Export `use-reset-token.hook` from `lib/hooks/auth/index.ts`.

- [ ] **Step 6: Wire the forgot-password form**

In `forgot-password-form.tsx` delete the `setTimeout` block and the `isSubmitting` state. Use `const forgot = useForgotPassword();` and add an `apiError` state rendered in the existing red alert style:

```tsx
    const identifier = mode === "phone" ? (normalizeEgyptianPhone(phone) ?? phone) : email.trim().toLowerCase();
    forgot.mutate(
      { identifier, channel: mode === "email" ? "email" : undefined },
      {
        onSuccess: (challenge) => {
          const params = new URLSearchParams({
            purpose: "reset_password",
            identifier: challenge.phone ?? challenge.email ?? identifier,
          });
          router.push(`${ROUTE_VERIFY_OTP}?${params.toString()}`);
        },
        onError: (err) => setApiError(authErrorMessage(err)),
      },
    );
```

The button uses `disabled={forgot.isPending}` and `{forgot.isPending ? "جاري الإرسال..." : "ابعت كود التأكيد"}`. `auth.account_not_found` shows the server's translated message through `authErrorMessage`.

- [ ] **Step 7: Make `verify-otp` handle `reset_password` and email identifiers**

`verify-otp/page.tsx`:

```tsx
  const identifier = query.identifier ?? query.phone ?? "";
  const purpose =
    query.purpose === "register" ? "register" : query.purpose === "reset_password" ? "reset_password" : "login";
  // ...
  <OtpForm identifier={identifier} purpose={purpose} callbackUrl={callbackUrl} />
```

`otp-form.tsx` changes:
- The props are `identifier` and `purpose: "register" | "login" | "reset_password"`. Remove `onSuccess`, which no caller passes.
- `const isEmail = identifier.includes("@");` and `const apiIdentifier = isEmail ? identifier.trim().toLowerCase() : (normalizeEgyptianPhone(identifier) ?? identifier);`
- `useOtpChallenge(purpose, identifier)`.
- Add `const verifyReset = useVerifyResetCode();`, and `isSubmitting = verifyOtp.isPending || verifyReset.isPending`.
- Submit:

```tsx
    if (purpose === "reset_password") {
      verifyReset.mutate(
        { identifier: apiIdentifier, code },
        {
          onSuccess: () => router.replace(ROUTE_RESET_PASSWORD),
          onError: (err) => {
            handleFailure(err);
            if (err.code === "auth.otp_invalid") setCode("");
          },
        },
      );
      return;
    }
    verifyOtp.mutate(
      { phone: apiIdentifier, code, purpose },
      {
        onSuccess: (session) =>
          router.replace(afterAuthPath(session.user, callbackUrl, { isNewAccount: purpose === "register" })),
        onError: (err) => {
          handleFailure(err);
          if (err.code === "auth.otp_invalid") setCode("");
        },
      },
    );
```

- Resend: `resendOtp.mutate({ ...identifierField(apiIdentifier), purpose }, …)`. Import `identifierField` from `@/lib/utils/auth/laravel-mappers`. The success message adds the email case: `next.channel === "email" ? "تم إرسال كود جديد على بريدك." : …`.
- "Start again" and "change number" links: `purpose === "register" ? ROUTE_REGISTER : purpose === "reset_password" ? ROUTE_FORGOT_PASSWORD : ROUTE_LOGIN`.
- The subtitle shows `identifier` as-is for email, with no phone formatting, and the channel text becomes `challenge?.channel === "email" ? "على بريدك" : challenge?.channel === "whatsapp" ? "على واتساب" : "في رسالة"`.

- [ ] **Step 8: Reset-password page and form**

`reset-password/page.tsx`: copy `forgot-password/page.tsx` exactly, swapping `METADATA_FORGOT_PASSWORD` for `METADATA_RESET_PASSWORD`, `<ForgotPasswordForm />` for `<ResetPasswordForm />`, and `AuthBrandPanel mode="forgot-password"` stays.

`reset-password-form.tsx`:

```tsx
"use client";

// كلمة سر جديدة بعد تأكيد الكود — التوكن جاي من الكاش، ولو مش موجود أو انتهى بنرجّعه يبدأ من الأول
import { useId, useState } from "react";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { ROUTE_FORGOT_PASSWORD } from "@/lib/data/constants/routes.constants";
import { useResetPassword, useResetToken } from "@/lib/hooks/auth";
import { authErrorMessage } from "@/lib/utils/auth/auth-error-message";
import { afterAuthPath } from "@/lib/utils/auth/post-auth-redirect";
import { resetTokenState } from "@/lib/utils/auth/reset-token-state";
import { PasswordRequirements } from "../../../__components/password-requirements";
import { validateResetPassword, type ResetPasswordFormErrors } from "./reset-password-form.schema";

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useResetToken();
  const reset = useResetPassword();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [tokenGone, setTokenGone] = useState(false);
  const passwordId = useId();
  const confirmationId = useId();

  // Date.now() هنا وقت الريندر — كفاية للتحقق، والسيرفر هو الحكم النهائي
  const state = tokenGone ? "expired" : resetTokenState(token, Date.now());

  if (state !== "ok") {
    return (
      <div className="w-full max-w-[420px] flex flex-col gap-4">
        <h1 className="text-[26px] font-extrabold text-[#0E0F11]">
          {state === "expired" ? "الكود انتهى" : "ابدأ من الأول"}
        </h1>
        <p className="text-sm text-[#6B7280]">عشان أمانك، الخطوة دي لازم تتعمل خلال 10 دقايق من تأكيد الكود.</p>
        <Link href={ROUTE_FORGOT_PASSWORD} className="font-bold text-[#0F766E] hover:underline">
          اطلب كود جديد
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validateResetPassword(password, confirmation);
    setErrors(validation);
    if (Object.keys(validation).length > 0 || !token) return;

    reset.mutate(
      { resetToken: token.resetToken, password, passwordConfirmation: confirmation },
      {
        onSuccess: (session) => router.replace(afterAuthPath(session.user, null)),
        onError: (err) => {
          if (err.code === "auth.reset_token_invalid") setTokenGone(true);
          else setApiError(authErrorMessage(err));
        },
      },
    );
  }

  return (
    <div className="w-full max-w-[420px] flex flex-col gap-5">
      <div className="flex size-14 items-center justify-center rounded-2xl border-[1.5px] border-[#CFE6E3] bg-[#F0FAF8] text-[#0F766E]">
        <KeyRound className="size-6 stroke-[2.2]" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[26px] font-extrabold leading-tight text-[#0E0F11]">كلمة سر جديدة</h1>
        <p className="text-sm leading-relaxed text-[#6B7280]">اختار كلمة سر جديدة. هنخرّجك من كل الأجهزة التانية.</p>
      </div>
      {apiError && (
        <div role="alert" className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3 text-[13px] font-medium">
          {apiError}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* حقل كلمة السر + زرار الإظهار — نفس markup حقل كلمة السر في register-form.tsx */}
        {/* <PasswordRequirements password={password} /> تحت الحقل الأول */}
        {/* حقل التأكيد بنفس الشكل، والأخطاء تحت كل حقل بـ text-[12px] text-[#B91C1C] */}
        <button
          type="submit"
          disabled={reset.isPending}
          className="mt-1 flex h-[50px] w-full items-center justify-center rounded-xl bg-[#0F766E] text-[15.5px] font-bold text-white hover:bg-[#0B5A54] disabled:bg-[#E7EAEC] disabled:text-[#A5ABB3]"
        >
          {reset.isPending ? "جاري الحفظ..." : "احفظ كلمة السر"}
        </button>
      </form>
    </div>
  );
}
```

Replace the three JSX comments with the real fields. Copy the password input block (label, wrapper `div`, `input type={showPassword ? "text" : "password"}`, eye toggle) from `register-form.tsx`, use `id={passwordId}` and `id={confirmationId}`, and check the `PasswordRequirements` prop name in its file. Leave no comment placeholders in the final file.

- [ ] **Step 9: Verify**

Run: `cd apps/web && pnpm test && npx tsc --noEmit && npx eslint "src/app/[locale]/(auth)" src/lib`
Expected: clean.

Manual check with the Laravel stack running (`OTP_FIXED_CODE=123456`):
1. On `/ar/forgot-password`, enter a registered phone. You land on verify-otp with a countdown.
2. Enter `123456`, which takes you to `/ar/reset-password`. Set a new password and you are logged in on `/ar`.
3. Open `/ar/reset-password` directly and you see "ابدأ من الأول".
4. Repeat with a verified email. Unknown phone → the server's "account not found" message.

- [ ] **Step 10: Commit**

```bash
git add apps/web/src
git commit -m "feat(web): reset password flow with in-memory single-use reset token"
```

---

### Task 7: Web — onboarding route group (phone → name/terms → location → birth date)

The page shows one step at a time, picked by `nextOnboardingStep(user.onboarding, skipped)`. Each step's mutation updates the `QK_USER` cache, which changes `onboarding.missing`/`skippable`, which moves the page to the next step. When no step remains, it goes to `callbackUrl`.

**Location step UX** (the map itself is built in Task 7b):
1. **Intro:** a short explanation ("عشان نرتّبلك الصالونات الأقرب ليك"), a primary "حدّد موقعي" button, and "تخطّي دلوقتي". The browser permission prompt only appears on that click, never on page load.
2. **Detect:** the click asks the browser for the position. In parallel, the read-only IP estimate is fetched (Task 1b).
3. **Map:** the map opens with a pin on the detected point:
   - **Allowed, inside Egypt:** the pin is at the GPS point. Label: "ده موقعك الحالي".
   - **Denied, failed, or GPS outside Egypt:** the pin is at the IP estimate. Label: "ده موقعك التقريبي".
   - **IP estimate also missing or outside Egypt (VPN):** the map is centered on Cairo with no confirmed point. Label: "حرّك الدبوس لمكانك".
4. **Correct:** a permanent hint under the map reads "الموقع مش مظبوط؟ (لو بتستخدم VPN مثلاً) اسحب الدبوس أو دوس على مكانك الحقيقي". The customer can drag the pin, tap anywhere to move it, or press "رجّعني لموقعي" to snap back to the detected point. The map can't be panned outside Egypt.
5. **Confirm:** "أكّد الموقع" saves it. A moved pin is saved as `manual`, an unmoved GPS pin as `gps`, and an unmoved IP pin through the server's IP fallback. The button is disabled until there is a real point inside Egypt.
6. **Skip:** "تخطّي" is available at every stage and saves nothing.

**Files:**
- Create: `apps/web/src/app/[locale]/(onboarding)/layout.tsx`
- Create: `apps/web/src/app/[locale]/(onboarding)/onboarding/page.tsx`
- Create: `apps/web/src/app/[locale]/(onboarding)/onboarding/__components/onboarding-flow/{onboarding-flow.tsx,index.ts}`
- Create: `.../__components/phone-step/phone-step.tsx`, `profile-step/profile-step.tsx`, `birth-date-step/birth-date-step.tsx` (each with `index.ts`). `location-step/` is built in Task 7b.
- Create: `.../__components/onboarding-progress/onboarding-progress.tsx`
- Modify: `apps/web/src/lib/data/constants/metadata.constants.ts` (`METADATA_ONBOARDING`, with `robots: { index: false }`)

**Interfaces:**
- Consumes: `LocationStep` (Task 7b), `useUser`, `useUpdateProfile`, `useSendPhoneOtp`, `useVerifyPhone`, `useAuthOptions`, `useOtpChallenge`, `nextOnboardingStep`, `safeCallback`, `OtpCodeInput`, `authErrorMessage`, `apiFieldErrors`, `validateEgyptianPhone`, `normalizeEgyptianPhone`.
- Produces: `<PhoneStep />` and `<ProfileStep user={Customer} />` take no callbacks; they finish when the server's `onboarding.missing` changes in the `QK_USER` cache. `<LocationStep onDone onSkip />` and `<BirthDateStep onSkip />` take callbacks, because the server keeps those steps in `skippable` until there is data.

- [ ] **Step 1: Layout and page**

`(onboarding)/layout.tsx`:

```tsx
// تخطيط الـ onboarding — نفس شكل صفحات الدخول من غير الفوتر الكامل
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-screen items-start justify-center bg-white px-4 py-10 text-[#0E0F11] sm:py-16">{children}</main>;
}
```

`onboarding/page.tsx`:

```tsx
// إكمال الحساب بعد التسجيل أو الدخول الاجتماعي — proxy.ts بيضمن إن فيه جلسة
import { METADATA_ONBOARDING } from "@/lib/data/constants/metadata.constants";
import { CALLBACK_PARAM } from "@/lib/data/constants/app.constants";
import { OnboardingFlow } from "./__components/onboarding-flow";

export const metadata = METADATA_ONBOARDING;

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  return <OnboardingFlow callbackUrl={query[CALLBACK_PARAM]} />;
}
```

- [ ] **Step 2: `OnboardingFlow`**

```tsx
"use client";

// بيختار الخطوة الحالية من بيانات المستخدم — كل خطوة بتحدّث كاش المستخدم فالخطوة الجاية بتظهر لوحدها
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useUser } from "@/lib/hooks/user";
import { ROUTE_HOME } from "@/lib/data/constants/routes.constants";
import { nextOnboardingStep, type OnboardingStepId } from "@/lib/utils/auth/onboarding-steps";
import { safeCallback } from "@/lib/utils/auth/post-auth-redirect";
import { OnboardingProgress } from "../onboarding-progress";
import { PhoneStep } from "../phone-step";
import { ProfileStep } from "../profile-step";
import { LocationStep } from "../location-step";
import { BirthDateStep } from "../birth-date-step";

export function OnboardingFlow({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [skipped, setSkipped] = useState<ReadonlySet<OnboardingStepId>>(new Set());
  const [finishing, setFinishing] = useState(false);

  if (isLoading || !user) {
    return <div className="h-40 w-full max-w-[440px] animate-pulse rounded-2xl bg-[#F7F8FA]" />;
  }

  const step = nextOnboardingStep(user.onboarding, skipped);
  const skip = (id: OnboardingStepId) => setSkipped((prev) => new Set(prev).add(id));

  if (step === null) {
    if (!finishing) {
      setFinishing(true);
      // بعد الريندر: الانتقال جوه الريندر مش مسموح، فبنأجله لمهمة الجاية
      queueMicrotask(() => router.replace(safeCallback(callbackUrl) ?? ROUTE_HOME));
    }
    return <div className="h-40 w-full max-w-[440px] animate-pulse rounded-2xl bg-[#F7F8FA]" />;
  }

  return (
    <div className="flex w-full max-w-[440px] flex-col gap-6">
      <OnboardingProgress current={step} onboarding={user.onboarding} skipped={skipped} />
      {step === "phone" && <PhoneStep />}
      {step === "profile" && <ProfileStep user={user} />}
      {step === "location" && <LocationStep onDone={() => skip("location")} onSkip={() => skip("location")} />}
      {step === "birth_date" && <BirthDateStep onSkip={() => skip("birth_date")} />}
    </div>
  );
}
```

Why the location step's `onDone` also marks it skipped: if the IP lookup fails, the server keeps `location` in `skippable`, and without the mark the step would show again.

Required steps (`phone`, `profile`) have no `onDone`. They finish when the server says so, through the cache. If `queueMicrotask` + `router.replace` during render triggers a React warning, move the redirect into a `useEffect(() => { if (step === null) router.replace(...) }, [step])`. That is navigation, not data loading, so the data-access rule allows it.

- [ ] **Step 3: `OnboardingProgress`**

A simple "خطوة X من Y" with a bar. Count the steps a user will see with `["phone","profile","location","birth_date"]` filtered by `onboarding.missing`/`skippable`, plus those already done in this session. Keep it simple: `total = 4` minus the steps that were never needed at mount, captured with `useState(() => …)` on first render. The visual matches the teal palette (`bg-[#0F766E]` fill on `bg-[#EAEFF0]` track, `h-1.5 rounded-full`).

```tsx
"use client";

// شريط التقدّم — عدد الخطوات بيتحدد أول ما الصفحة تفتح عشان ميتغيرش وإحنا ماشيين
import { useState } from "react";
import type { CustomerOnboarding } from "@/lib/types/auth";
import type { OnboardingStepId } from "@/lib/utils/auth/onboarding-steps";

const ORDER: OnboardingStepId[] = ["phone", "profile", "location", "birth_date"];

function needed(o: CustomerOnboarding): OnboardingStepId[] {
  return ORDER.filter((s) =>
    s === "phone" ? o.missing.includes("phone")
    : s === "profile" ? o.missing.includes("name") || o.missing.includes("terms")
    : o.skippable.includes(s),
  );
}

export function OnboardingProgress({ current, onboarding }: { current: OnboardingStepId; onboarding: CustomerOnboarding; skipped: ReadonlySet<OnboardingStepId> }) {
  const [steps] = useState(() => needed(onboarding));
  const index = Math.max(0, steps.indexOf(current));
  const total = Math.max(steps.length, 1);
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12.5px] font-bold text-[#6B7280]">خطوة {index + 1} من {total}</span>
      <div className="h-1.5 w-full rounded-full bg-[#EAEFF0]">
        <div className="h-full rounded-full bg-[#0F766E] transition-all" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>
    </div>
  );
}
```

Remove the unused `skipped` prop from the type and the call site if lint flags it.

- [ ] **Step 4: `PhoneStep`**

Two sub-states in one component: enter phone (and channel if `/auth/options` lists more than one), then enter code.

```tsx
"use client";

// تأكيد الموبايل — إجباري لكل حساب. لو الرقم بتاع حساب قديم، السيرفر بيدمج وبيرجّع جلسة الحساب ده
import { useState } from "react";
import { useAuthOptions, useOtpChallenge } from "@/lib/hooks/auth";
import { useSendPhoneOtp, useVerifyPhone } from "@/lib/hooks/user";
import { authErrorMessage } from "@/lib/utils/auth/auth-error-message";
import { DEFAULT_OTP_LENGTH, normalizeEgyptianPhone, validateEgyptianPhone } from "@/lib/utils/auth-validation.utils";
import { OtpCodeInput } from "@/app/[locale]/(auth)/__components/otp-code-input";

export function PhoneStep() {
  const options = useAuthOptions();
  const sendOtp = useSendPhoneOtp();
  const verify = useVerifyPhone();
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "sms" | undefined>(undefined);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { data: challenge } = useOtpChallenge("verify_phone", sentTo ?? "");
  const codeLength = challenge?.codeLength ?? DEFAULT_OTP_LENGTH;

  function send() {
    const check = validateEgyptianPhone(phone);
    if (!check.isValid) return setError(check.errorMessage ?? "رقم غير صحيح");
    const normalized = normalizeEgyptianPhone(phone) ?? phone;
    sendOtp.mutate(
      { phone: normalized, channel },
      { onSuccess: (c) => { setError(null); setSentTo(c.phone ?? normalized); }, onError: (e) => setError(authErrorMessage(e)) },
    );
  }

  function confirm() {
    if (!sentTo) return;
    verify.mutate(
      { phone: sentTo, code },
      {
        // النجاح بيحدّث كاش المستخدم والـ flow بيروح للخطوة الجاية لوحده
        onError: (e) => {
          setError(e.code === "auth.social_conflict"
            ? "الرقم ده مربوط بحساب تاني بنفس الطريقة. ادخل بالرقم وكلمة السر بدل كده."
            : authErrorMessage(e));
          if (e.code === "auth.otp_invalid") setCode("");
        },
      },
    );
  }

  // ... JSX: title "أكّد رقم موبايلك", subtitle "هنستخدمه عشان نبعتلك تأكيد الحجز",
  // phone field identical to the forgot-password phone field (+20 🇪🇬 prefix, dir="ltr"),
  // channel chips when options.data?.otpChannels.length > 1,
  // primary button "ابعت الكود" (disabled while sendOtp.isPending);
  // after sentTo: <OtpCodeInput length={codeLength} value={code} onChange={setCode} hasError={!!error} />,
  // button "تأكيد" (disabled until code.length === codeLength or verify.isPending),
  // link-button "غيّر الرقم" → setSentTo(null); setCode("").
  // error in the red alert style used in forgot-password-form.tsx.
}
```

Write the JSX in full when implementing, reusing the exact phone field markup from `forgot-password-form.tsx`. The comment above lists every element and its copy.

The `useOtpChallenge` key must match what `rememberOtpChallenge` stores. The server returns `phone` as `01XXXXXXXXX`, and Task 6's `identifierKey` normalises the same way.

Add one more case. If the step 5 manual test shows that `verify_phone` resends don't exist on `/auth/otp/resend` (spec §7.2 says resend goes through `/me/phone`), then "إعادة إرسال" just calls `send()` again, gated by `challenge.resendAvailableAt` like `OtpForm`'s countdown.

- [ ] **Step 5: `ProfileStep`**

Fields: first name and last name (pre-filled from `user.firstName/lastName`, which can be filled from Google), and a terms checkbox linking `ROUTE_TERMS` and `ROUTE_PRIVACY` (same markup as the register form's terms row). Hide the terms row when `!user.onboarding.missing.includes("terms")`.

```tsx
    updateProfile.mutate(
      { firstName: firstName.trim(), lastName: lastName.trim(), acceptedTerms: needsTerms ? accepted : undefined },
      { onError: (e) => { setFieldErrors(apiFieldErrors(e)); setError(authErrorMessage(e)); } },
    );
```

Client validation: both names non-empty after trim, and terms checked when needed ("لازم توافق على الشروط عشان تكمّل").

- [ ] **Step 6: `LocationStep`, a temporary stub**

Task 7b replaces this with the map. Until then, ship a stub so the flow compiles and can be tested end to end:

```tsx
"use client";

// مؤقت لحد Task 7b (الخريطة)
export function LocationStep({ onSkip }: { onDone: () => void; onSkip: () => void }) {
  return (
    <button type="button" onClick={onSkip} className="text-sm font-bold text-[#6B7280]">
      تخطّي
    </button>
  );
}
```

- [ ] **Step 7: `BirthDateStep`**

A native `<input type="date" min="1920-01-01" max={today minus 10 years}>` saved via `useUpdateProfile().mutate({ birthDate })`. On success the server drops `birth_date` from `skippable`, so the flow finishes. There is also an "تخطّي" button that calls `onSkip`. Client check: a value is required before "حفظ" is enabled.

- [ ] **Step 8: Verify**

Run: `cd apps/web && npx tsc --noEmit && npx eslint "src/app/[locale]/(onboarding)" && pnpm test`
Expected: clean.

Manual check:
1. Register a new phone account. After the OTP you land on `/ar/onboarding` at the **location** step (stubbed until Task 7b). Phone, name and terms are already done.
2. Skip both optional steps and you return to `callbackUrl`.
3. Go to `/ar/onboarding?callbackUrl=//evil.com`, finish, and you land on `/ar`.
4. A Google sign-up (after Task 9) starts at the phone step, then the profile step.

- [ ] **Step 9: Commit**

```bash
git add "apps/web/src/app/[locale]/(onboarding)" apps/web/src/lib/data/constants/metadata.constants.ts
git commit -m "feat(web): onboarding flow with phone, profile, location permission and birth date"
```

---

### Task 7b: Web — location step with a map the customer can correct

The customer allows location access and sees a map with a pin on where we think they are (GPS, else the IP estimate). They can drag or tap to fix it, for example on a VPN, and confirm. What is saved and with which `source` comes from one pure, tested function.

**Files:**
- Modify: `apps/web/package.json` (`leaflet`, `react-leaflet`, dev `@types/leaflet`)
- Modify: `apps/web/.env.example`
- Create: `apps/web/src/lib/utils/location/location-choice.ts`, `location-choice.test.ts`
- Create: `apps/web/src/components/molecules/location-picker-map/{location-picker-map.tsx,index.ts}` (reusable later on the account page)
- Create: `apps/web/src/app/[locale]/(onboarding)/onboarding/__components/location-step/{location-step.tsx,index.ts}` (replaces the Task 7 stub)

**Interfaces:**
- Consumes: `useDetectPosition`, `useLocationEstimate`, `useSaveLocation`, `isInEgypt`, `PositionResult` (Task 4). Uses the `GET /me/location/estimate` and `PUT /me/location {source}` endpoints from Task 1b.
- Produces: `type PinOrigin = "gps" | "ip" | "none"`, `CAIRO: LatLng`, `EGYPT_BOUNDS: [[number, number], [number, number]]`.
- Produces: `initialPin(gps: PositionResult | null, estimate: LatLng | null): { point: LatLng; origin: PinOrigin; zoom: number }`.
- Produces: `locationToSave(origin: PinOrigin, pin: LatLng, moved: boolean): SaveDecision`, where `SaveDecision = { kind: "coords"; lat: number; lng: number; source: "gps" | "manual" } | { kind: "ip" } | { kind: "invalid"; reason: "outside_egypt" | "no_point" }`.
- Produces: `<LocationPickerMap pin={LatLng} focus={LatLng} focusZoom={number} focusKey={number} onPick={(p: LatLng) => void} />`.

- [ ] **Step 1: Install and configure**

```bash
cd apps/web && pnpm add leaflet react-leaflet && pnpm add -D @types/leaflet
```

`react-leaflet` v5 supports React 19. If pnpm resolves v4, pin `react-leaflet@^5`.

Append to `apps/web/.env.example`:

```dotenv
# بلاطات الخريطة — OSM للتطوير بس؛ في الإنتاج حط مزوّد مستضاف (MapTiler/Stadia/self-hosted)
NEXT_PUBLIC_MAP_TILE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_MAP_TILE_ATTRIBUTION=&copy; OpenStreetMap contributors
```

- [ ] **Step 2: Write the failing tests**

`src/lib/utils/location/location-choice.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { CAIRO, initialPin, locationToSave } from "./location-choice.ts";

const alex = { lat: 31.2001, lng: 29.9187 };
const amsterdam = { lat: 52.37, lng: 4.9 };

test("initialPin prefers gps inside egypt, then the ip estimate, then cairo", () => {
  assert.deepEqual(initialPin({ ok: true, ...alex }, { lat: 30, lng: 31 }), { point: alex, origin: "gps", zoom: 16 });
  assert.deepEqual(initialPin({ ok: false, reason: "denied" }, alex), { point: alex, origin: "ip", zoom: 12 });
  // GPS برا مصر (VPN على لابتوب من غير Wi-Fi) → بنرجع للـ IP
  assert.equal(initialPin({ ok: true, ...amsterdam }, alex).origin, "ip");
  // مفيش أي حاجة صالحة → القاهرة على زووم مصر كلها، والعميل يحدد بنفسه
  assert.deepEqual(initialPin({ ok: false, reason: "timeout" }, null), { point: CAIRO, origin: "none", zoom: 6 });
  assert.equal(initialPin(null, amsterdam).origin, "none");
});

test("locationToSave picks the source from where the pin came from and whether it moved", () => {
  assert.deepEqual(locationToSave("gps", alex, false), { kind: "coords", ...alex, source: "gps" });
  assert.deepEqual(locationToSave("ip", alex, true), { kind: "coords", ...alex, source: "manual" });
  assert.deepEqual(locationToSave("gps", alex, true), { kind: "coords", ...alex, source: "manual" });
  assert.deepEqual(locationToSave("ip", alex, false), { kind: "ip" });
  // القاهرة الافتراضية من غير ما يتحرك مش موقع حقيقي
  assert.deepEqual(locationToSave("none", CAIRO, false), { kind: "invalid", reason: "no_point" });
  assert.equal(locationToSave("none", alex, true).kind, "coords");
});

test("locationToSave never sends a point outside egypt and rounds to the db precision", () => {
  assert.deepEqual(locationToSave("ip", amsterdam, true), { kind: "invalid", reason: "outside_egypt" });
  const d = locationToSave("none", { lat: 30.123456789, lng: 31.987654321 }, true);
  assert.deepEqual(d, { kind: "coords", lat: 30.1234568, lng: 31.9876543, source: "manual" });
});
```

- [ ] **Step 3: Run the tests and confirm they fail**

Run: `pnpm test`
Expected: FAIL, `./location-choice.ts` not found.

- [ ] **Step 4: Implement `location-choice.ts`**

```ts
// منين الدبوس بيبدأ على الخريطة، وإيه اللي يتحفظ لما العميل يأكّد — منطق نقي متختبر
import { isInEgypt, type PositionResult } from "./browser-position.ts";

export interface LatLng {
  lat: number;
  lng: number;
}

export type PinOrigin = "gps" | "ip" | "none";

export const CAIRO: LatLng = { lat: 30.0444, lng: 31.2357 };
/** [[جنوب-غرب], [شمال-شرق]] — نفس صندوق السيرفر، والخريطة مبتتحركش براه */
export const EGYPT_BOUNDS: [[number, number], [number, number]] = [[21.5, 24.5], [32.0, 37.0]];

export function initialPin(gps: PositionResult | null, estimate: LatLng | null): { point: LatLng; origin: PinOrigin; zoom: number } {
  if (gps?.ok && isInEgypt(gps.lat, gps.lng)) return { point: { lat: gps.lat, lng: gps.lng }, origin: "gps", zoom: 16 };
  if (estimate && isInEgypt(estimate.lat, estimate.lng)) return { point: estimate, origin: "ip", zoom: 12 };
  return { point: CAIRO, origin: "none", zoom: 6 };
}

export type SaveDecision =
  | { kind: "coords"; lat: number; lng: number; source: "gps" | "manual" }
  | { kind: "ip" }
  | { kind: "invalid"; reason: "outside_egypt" | "no_point" };

/** decimal(10,7) في الداتابيز */
const round7 = (n: number) => Math.round(n * 1e7) / 1e7;

export function locationToSave(origin: PinOrigin, pin: LatLng, moved: boolean): SaveDecision {
  if (!isInEgypt(pin.lat, pin.lng)) return { kind: "invalid", reason: "outside_egypt" };
  const point = { lat: round7(pin.lat), lng: round7(pin.lng) };
  // أي تحريك من العميل = هو أدرى بمكانه من أي جهاز (VPN، GPS لابتوب مش دقيق...)
  if (moved) return { kind: "coords", ...point, source: "manual" };
  if (origin === "gps") return { kind: "coords", ...point, source: "gps" };
  // دبوس الـ IP من غير تحريك: السيرفر يحفظ تخمينه هو بمصدر ip (ومبيدوسش على gps/manual)
  if (origin === "ip") return { kind: "ip" };
  return { kind: "invalid", reason: "no_point" };
}
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 6: `LocationPickerMap`** (`src/components/molecules/location-picker-map/location-picker-map.tsx`)

```tsx
"use client";

// خريطة اختيار الموقع: دبوس بيتسحب، ودوسة على الخريطة بتنقله، ومحصورة جوه مصر.
// Leaflet بيلمس window، فالملف ده بيتحمّل client-only من خلال next/dynamic في اللي بيستخدمه.
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { EGYPT_BOUNDS, type LatLng } from "@/lib/utils/location/location-choice";

const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ?? "&copy; OpenStreetMap contributors";

// أيقونة Leaflet الافتراضية بتبوظ مع الـ bundlers (مسارات صور)، فبنرسم دبوس بـ HTML
const pinIcon = L.divIcon({
  className: "",
  html: '<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#0F766E;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function ClickToMove({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

/** بيحرّك الكاميرا بس لما focusKey يتغير (أول فتح أو "رجّعني لموقعي")، مش مع كل سحبة للدبوس */
function FocusOn({ point, zoom, focusKey }: { point: LatLng; zoom: number; focusKey: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([point.lat, point.lng], zoom, { duration: 0.6 });
    // point/zoom مقصود إنهم مش في الـ deps: focusKey هو الإشارة
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, focusKey]);
  return null;
}

interface LocationPickerMapProps {
  pin: LatLng;
  focus: LatLng;
  focusZoom: number;
  focusKey: number;
  onPick: (point: LatLng) => void;
}

export default function LocationPickerMap({ pin, focus, focusZoom, focusKey, onPick }: LocationPickerMapProps) {
  return (
    // Leaflet بيفترض LTR — من غيرها الكنترولز والسحب بيتلخبطوا في الصفحة العربي
    <div dir="ltr" className="relative z-0 h-[320px] w-full overflow-hidden rounded-2xl border border-[#E5E7EB]">
      <MapContainer
        center={[focus.lat, focus.lng]}
        zoom={focusZoom}
        minZoom={6}
        maxBounds={EGYPT_BOUNDS}
        maxBoundsViscosity={1}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <Marker
          position={[pin.lat, pin.lng]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const ll = (e.target as L.Marker).getLatLng();
              onPick({ lat: ll.lat, lng: ll.lng });
            },
          }}
        />
        <ClickToMove onPick={onPick} />
        <FocusOn point={focus} zoom={focusZoom} focusKey={focusKey} />
      </MapContainer>
    </div>
  );
}
```

`index.ts` exports the **dynamic** wrapper, so no caller can import Leaflet on the server by accident:

```ts
"use client";

import dynamic from "next/dynamic";
import { createElement } from "react";

export const LocationPickerMap = dynamic(() => import("./location-picker-map"), {
  ssr: false,
  loading: () => createElement("div", { className: "h-[320px] w-full animate-pulse rounded-2xl bg-[#F7F8FA]" }),
});
```

If `"use client"` in an `index.ts` barrel confuses the build, rename the file to `index.tsx` and use JSX.

- [ ] **Step 7: `LocationStep`** (replaces the Task 7 stub)

Everything is derived from hook state, so no `useEffect` is needed: the detected start point comes from `initialPin(detect.data, estimate.data)`, and `pin` state is `null` until the customer moves it.

```tsx
"use client";

// خطوة الموقع: إذن ← خريطة عليها موقعك ← تصحّحه لو غلط (VPN مثلاً) ← تأكيد. اختيارية دايماً.
import { useState } from "react";
import { LocateFixed, MapPin } from "lucide-react";
import { LocationPickerMap } from "@/components/molecules/location-picker-map";
import { useDetectPosition, useLocationEstimate, useSaveLocation } from "@/lib/hooks/user";
import { authErrorMessage } from "@/lib/utils/auth/auth-error-message";
import { initialPin, locationToSave, type LatLng } from "@/lib/utils/location/location-choice";
import { isInEgypt } from "@/lib/utils/location/browser-position";

interface LocationStepProps {
  onDone: () => void;
  onSkip: () => void;
}

const ORIGIN_LABEL = {
  gps: "ده موقعك الحالي.",
  ip: "ده موقعك التقريبي.",
  none: "مقدرناش نحدد موقعك. حرّك الدبوس لمكانك.",
} as const;

export function LocationStep({ onDone, onSkip }: LocationStepProps) {
  const [started, setStarted] = useState(false);
  const [pin, setPin] = useState<LatLng | null>(null); // null = لسه على النقطة اللي اتحددت
  const [focusKey, setFocusKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const detect = useDetectPosition();
  const estimate = useLocationEstimate(started);
  const save = useSaveLocation();

  const gpsInEgypt = detect.data?.ok === true && isInEgypt(detect.data.lat, detect.data.lng);
  // مستنيين الـ GPS؛ والـ IP بس لو الـ GPS مش نافع
  const ready = detect.isSuccess && (gpsInEgypt || !estimate.isPending || estimate.isError);
  const start = ready ? initialPin(detect.data ?? null, estimate.data ?? null) : null;
  const shown = pin ?? start?.point ?? null;
  const decision = start && shown ? locationToSave(start.origin, shown, pin !== null) : null;

  function begin() {
    setStarted(true);
    detect.mutate(); // لازم من ضغطة زرار عشان المتصفح يعرض طلب الإذن
  }

  function backToDetected() {
    setPin(null);
    setFocusKey((k) => k + 1);
  }

  function confirm() {
    if (!decision || decision.kind === "invalid") return;
    setError(null);
    save.mutate(decision.kind === "coords" ? { lat: decision.lat, lng: decision.lng, source: decision.source } : null, {
      onSuccess: onDone,
      onError: (e) => setError(authErrorMessage(e)),
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex size-14 items-center justify-center rounded-2xl border-[1.5px] border-[#CFE6E3] bg-[#F0FAF8] text-[#0F766E]">
        <MapPin className="size-6 stroke-[2.2]" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[26px] font-extrabold leading-tight">نوريك الصالونات القريبة منك</h1>
        <p className="text-sm leading-relaxed text-[#6B7280]">
          حدّد موقعك عشان نرتّبلك الصالونات حسب المسافة. مش هنشارك موقعك مع حد.
        </p>
      </div>

      {!started && (
        <button type="button" onClick={begin} className="h-[50px] w-full rounded-xl bg-[#0F766E] text-[15.5px] font-bold text-white hover:bg-[#0B5A54]">
          حدّد موقعي
        </button>
      )}

      {started && !start && (
        <div className="flex h-[320px] w-full items-center justify-center rounded-2xl bg-[#F7F8FA] text-sm font-bold text-[#6B7280]">
          بنحدد موقعك...
        </div>
      )}

      {start && shown && (
        <>
          <p className="text-[13.5px] font-bold text-[#0E0F11]">{pin ? "ده المكان اللي اخترته." : ORIGIN_LABEL[start.origin]}</p>
          <LocationPickerMap pin={shown} focus={start.point} focusZoom={start.zoom} focusKey={focusKey} onPick={setPin} />
          <div className="flex items-start justify-between gap-3">
            <p className="text-[12.5px] leading-relaxed text-[#6B7280]">
              الموقع مش مظبوط؟ (لو بتستخدم VPN مثلاً) اسحب الدبوس أو دوس على مكانك الحقيقي على الخريطة.
            </p>
            {pin && start.origin !== "none" && (
              <button type="button" onClick={backToDetected} className="flex shrink-0 items-center gap-1 text-[12.5px] font-bold text-[#0F766E] hover:underline">
                <LocateFixed className="size-4" />
                رجّعني لموقعي
              </button>
            )}
          </div>
          {decision?.kind === "invalid" && decision.reason === "outside_egypt" && (
            <p className="text-[12px] font-medium text-[#B91C1C]">لازم تختار مكان جوه مصر.</p>
          )}
          {error && <p role="alert" className="text-[12px] font-medium text-[#B91C1C]">{error}</p>}
          <button
            type="button"
            onClick={confirm}
            disabled={!decision || decision.kind === "invalid" || save.isPending}
            className="h-[50px] w-full rounded-xl bg-[#0F766E] text-[15.5px] font-bold text-white hover:bg-[#0B5A54] disabled:bg-[#E7EAEC] disabled:text-[#A5ABB3]"
          >
            {save.isPending ? "جاري الحفظ..." : "أكّد الموقع"}
          </button>
        </>
      )}

      <button type="button" onClick={onSkip} className="text-sm font-bold text-[#6B7280] hover:text-[#0E0F11]">
        تخطّي دلوقتي
      </button>
    </div>
  );
}
```

The permission prompt waits on the customer, and the browser's own timeout is 10 s (Task 4). If they ignore the prompt, the step stays on "بنحدد موقعك..." until the timeout, then falls back to the IP pin. That is acceptable, and the skip button stays visible the whole time.

- [ ] **Step 8: Verify**

Run: `cd apps/web && pnpm test && npx tsc --noEmit && npx eslint src/components/molecules/location-picker-map "src/app/[locale]/(onboarding)" src/lib/utils/location`
Expected: clean.

Run `pnpm build` once too: Leaflet must not be pulled into the server bundle (a `window is not defined` error means the dynamic wrapper isn't being used).

Manual (Chrome DevTools → **Sensors** → Location):
1. **GPS:** register a new account and reach the location step. Click "حدّد موقعي", then Allow, with Sensors set to Cairo. The pin sits on Cairo at street zoom with "ده موقعك الحالي". Confirm, and the DB shows `location_source = 1` (gps).
2. **Correct the pin:** on a fresh account, allow, then drag the pin to Alexandria. "رجّعني لموقعي" appears and snaps it back. Drag it again and confirm. The DB shows `location_source = 3` (manual) with Alexandria's coordinates.
3. **VPN:** Sensors set to London (simulating a VPN laptop), Allow. The pin falls back to the IP estimate. Locally the estimate is usually `null` because `127.0.0.1` isn't geolocatable, so the map opens on all of Egypt with "حرّك الدبوس لمكانك", and confirm is disabled until the pin is placed. Tap Mansoura, zoom in, adjust, confirm. You get `manual`.
4. **Denied:** Block the permission. The map opens on the IP estimate or all of Egypt, and the same correction works.
5. **Bounds:** you can't pan the map outside Egypt.
6. **Manual survives:** after step 2, reload `/ar` with permission granted and Sensors on Cairo. The background sync (Task 10) sends **no** `PUT /me/location`, and the DB keeps the manual point.
7. **RTL:** on `/ar`, dragging and zoom controls work normally. On `/en`, the same.

- [ ] **Step 9: Commit**

```bash
git add apps/web/package.json apps/web/pnpm-lock.yaml apps/web/.env.example apps/web/src/lib/utils/location apps/web/src/components/molecules/location-picker-map "apps/web/src/app/[locale]/(onboarding)"
git commit -m "feat(web): onboarding location map with draggable pin and manual correction"
```

---

### Task 8: Web — send every login path through `afterAuthPath`

**Files:**
- Modify: `apps/web/src/app/[locale]/(auth)/login/__components/login-form/login-form.tsx` (line ~100: `onSuccess: () => router.replace(callbackUrl || ROUTE_HOME)`)
- Modify: `apps/web/src/app/[locale]/(auth)/register/__components/register-form/register-form.tsx` (push to verify-otp: rename the param `phone` to `identifier`)
- Modify: `apps/web/src/app/[locale]/(auth)/login/__components/login-form/login-form.tsx` (line ~88: the OTP-login push uses `identifier`)

**Interfaces:**
- Consumes: `afterAuthPath` (Task 3). Verify-otp reads `identifier` (falling back to `phone`) per Task 6.

- [ ] **Step 1: Password login**

```tsx
        onSuccess: (session) => router.replace(afterAuthPath(session.user, callbackUrl)),
```

- [ ] **Step 2: Rename the verify-otp query param**

In both forms, wherever `params.set("phone", …)` or a template string builds `?phone=`, change it to `identifier`. Verify-otp still accepts `phone`, so old links keep working.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npx eslint "src/app/[locale]/(auth)"`
Manual: log in with an account whose `terms_accepted_at` is null (set it in the DB). You land on `/ar/onboarding` at the profile step.

- [ ] **Step 4: Commit**

```bash
git add "apps/web/src/app/[locale]/(auth)"
git commit -m "feat(web): route every login through onboarding-aware redirect"
```

---

### Task 9: Web — Google and Apple sign-in buttons

Google uses **Google Identity Services** (`accounts.google.com/gsi/client`). It renders Google's official button and returns an ID token (`credential`) to our callback. We send it with our nonce to `POST /auth/social/google`.

Apple uses **Sign in with Apple JS** in popup mode. It returns `authorization.id_token` and, on first sign-in only, `user.name`, which we forward as `first_name/last_name`.

Each button renders only when `/auth/options` lists its provider **and** the web client id env is set.

**Files:**
- Modify: `apps/web/.env.example` (add `NEXT_PUBLIC_APPLE_CLIENT_ID=`, `NEXT_PUBLIC_APPLE_REDIRECT_URI=`; `NEXT_PUBLIC_GOOGLE_CLIENT_ID` already exists)
- Create: `apps/web/src/lib/types/auth/social-sdk.d.ts`
- Create: `apps/web/src/lib/utils/auth/script-loader.ts`, `social-nonce.ts`, `social-nonce.test.ts`
- Create: `apps/web/src/lib/hooks/auth/use-google-button.hook.ts`, `use-apple-sign-in.hook.ts`; export from index
- Modify: `apps/web/src/app/[locale]/(auth)/__components/social-auth-buttons/social-auth-buttons.tsx`
- Modify: `login-form.tsx`, `register-form.tsx` (pass `callbackUrl` to `SocialAuthButtons`)

**Interfaces:**
- Consumes: `useSocialLogin` (exists), `useAuthOptions` (exists), `afterAuthPath` (Task 3).
- Produces: `createNonce(bytes?: number): string`, `loadScript(src: string): Promise<void>`.
- Produces: `useGoogleButton(ref: RefObject<HTMLDivElement | null>, opts: { enabled: boolean; text: "signin_with" | "continue_with"; onCredential: (idToken: string, nonce: string) => void }): { ready: boolean; failed: boolean }`.
- Produces: `useAppleSignIn(enabled: boolean): { ready: boolean; signIn: () => Promise<{ idToken: string; nonce: string; firstName?: string; lastName?: string } | null> }`.
- Produces: `<SocialAuthButtons prefix callbackUrl? />`.

- [ ] **Step 1: Write the failing test**

`src/lib/utils/auth/social-nonce.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { createNonce } from "./social-nonce.ts";

test("createNonce returns url-safe random hex of the requested size", () => {
  const a = createNonce();
  const b = createNonce();
  assert.match(a, /^[0-9a-f]{32}$/);
  assert.notEqual(a, b);
  assert.equal(createNonce(8).length, 16);
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm test`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement the helpers**

`src/lib/utils/auth/social-nonce.ts`:

```ts
// nonce عشوائي لكل محاولة دخول اجتماعي — السيرفر بيقارنه باللي جوه الـ ID token
export function createNonce(bytes = 16): string {
  const buf = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}
```

`src/lib/utils/auth/script-loader.ts`:

```ts
// تحميل سكريبت خارجي مرة واحدة بس حتى لو أكتر من زرار طلبه
const pending = new Map<string, Promise<void>>();

export function loadScript(src: string): Promise<void> {
  const existing = pending.get(src);
  if (existing) return existing;
  const promise = new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.defer = true;
    el.onload = () => resolve();
    el.onerror = () => {
      pending.delete(src); // نسمح بمحاولة تانية لو النت رجع
      reject(new Error(`failed to load ${src}`));
    };
    document.head.appendChild(el);
  });
  pending.set(src, promise);
  return promise;
}
```

`src/lib/types/auth/social-sdk.d.ts`:

```ts
// أنواع بسيطة لـ Google Identity Services و Sign in with Apple JS — اللي بنستخدمه بس
interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    nonce?: string;
    ux_mode?: "popup" | "redirect";
    use_fedcm_for_prompt?: boolean;
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill";
      width?: number;
      locale?: string;
      logo_alignment?: "left" | "center";
    },
  ): void;
}

interface AppleSignInResponse {
  authorization: { id_token: string; code: string; state?: string };
  user?: { email?: string; name?: { firstName?: string; lastName?: string } };
}

interface AppleIdAuth {
  init(config: { clientId: string; scope: string; redirectURI: string; usePopup: boolean; nonce?: string; state?: string }): void;
  signIn(): Promise<AppleSignInResponse>;
}

interface Window {
  google?: { accounts: { id: GoogleAccountsId } };
  AppleID?: { auth: AppleIdAuth };
}
```

If `tsc` does not pick up this ambient file, add `export {}` and wrap the declarations in `declare global { ... }`.

- [ ] **Step 4: Hooks**

`use-google-button.hook.ts`:

```ts
"use client";

// بيرسم زرار جوجل الرسمي جوه الـ div ويرجّع الـ ID token للـ callback — تحميل SDK خارجي، مش بيانات
import { useEffect, useRef, useState, type RefObject } from "react";
import { useLocale } from "next-intl";
import { loadScript } from "@/lib/utils/auth/script-loader";
import { createNonce } from "@/lib/utils/auth/social-nonce";

const GIS_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export function useGoogleButton(
  ref: RefObject<HTMLDivElement | null>,
  opts: { enabled: boolean; text: "signin_with" | "continue_with"; onCredential: (idToken: string, nonce: string) => void },
) {
  const locale = useLocale();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  // آخر callback من غير ما نعيد تهيئة جوجل مع كل ريندر
  const onCredential = useRef(opts.onCredential);
  onCredential.current = opts.onCredential;

  const active = opts.enabled && CLIENT_ID !== "";

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const nonce = createNonce();
    loadScript(GIS_SRC)
      .then(() => {
        const el = ref.current;
        if (cancelled || !el || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          nonce,
          ux_mode: "popup",
          callback: ({ credential }) => onCredential.current(credential, nonce),
        });
        window.google.accounts.id.renderButton(el, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: opts.text,
          locale,
          width: Math.min(400, el.clientWidth || 320),
          logo_alignment: "center",
        });
        setReady(true);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [active, locale, opts.text, ref]);

  return { ready, failed, active };
}
```

`use-apple-sign-in.hook.ts`:

```ts
"use client";

// Sign in with Apple JS في popup — الاسم بييجي من آبل أول مرة بس، فبنبعته للسيرفر
import { useCallback, useEffect, useState } from "react";
import { loadScript } from "@/lib/utils/auth/script-loader";
import { createNonce } from "@/lib/utils/auth/social-nonce";

const APPLE_SRC = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
const CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID ?? "";
const REDIRECT_URI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ?? "";

export interface AppleCredential {
  idToken: string;
  nonce: string;
  firstName?: string;
  lastName?: string;
}

export function useAppleSignIn(enabled: boolean) {
  const active = enabled && CLIENT_ID !== "" && REDIRECT_URI !== "";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    loadScript(APPLE_SRC).then(() => !cancelled && setReady(true)).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [active]);

  /** null = المستخدم قفل الـ popup */
  const signIn = useCallback(async (): Promise<AppleCredential | null> => {
    if (!window.AppleID) return null;
    const nonce = createNonce();
    window.AppleID.auth.init({ clientId: CLIENT_ID, scope: "name email", redirectURI: REDIRECT_URI, usePopup: true, nonce });
    try {
      const res = await window.AppleID.auth.signIn();
      return {
        idToken: res.authorization.id_token,
        nonce,
        firstName: res.user?.name?.firstName,
        lastName: res.user?.name?.lastName,
      };
    } catch {
      return null; // popup_closed_by_user وغيره
    }
  }, []);

  return { active, ready, signIn };
}
```

Export both from `lib/hooks/auth/index.ts`.

- [ ] **Step 5: Rewrite `SocialAuthButtons`**

```tsx
"use client";

// أزرار الدخول بجوجل وآبل (FRAME 13A/13B) — بتظهر بس لو السيرفر مفعّلها، وبتكمّل على onboarding لو الحساب ناقص
import { useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAppleSignIn, useAuthOptions, useGoogleButton, useSocialLogin } from "@/lib/hooks/auth";
import { authErrorMessage } from "@/lib/utils/auth/auth-error-message";
import { afterAuthPath } from "@/lib/utils/auth/post-auth-redirect";

interface SocialAuthButtonsProps {
  prefix?: "continue" | "simple";
  callbackUrl?: string | null;
}

export function SocialAuthButtons({ prefix = "simple", callbackUrl }: SocialAuthButtonsProps) {
  const router = useRouter();
  const options = useAuthOptions();
  const social = useSocialLogin();
  const [error, setError] = useState<string | null>(null);
  const googleRef = useRef<HTMLDivElement>(null);

  const providers = options.data?.socialProviders ?? [];

  function finish(provider: "google" | "apple", dto: { idToken: string; nonce: string; firstName?: string; lastName?: string }) {
    setError(null);
    social.mutate(
      { provider, ...dto },
      {
        onSuccess: (session) => router.replace(afterAuthPath(session.user, callbackUrl)),
        onError: (e) => setError(authErrorMessage(e)),
      },
    );
  }

  const google = useGoogleButton(googleRef, {
    enabled: providers.includes("google"),
    text: prefix === "continue" ? "continue_with" : "signin_with",
    onCredential: (idToken, nonce) => finish("google", { idToken, nonce }),
  });
  const apple = useAppleSignIn(providers.includes("apple"));

  async function handleApple() {
    const credential = await apple.signIn();
    if (credential) finish("apple", credential);
  }

  if (!google.active && !apple.active) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2.5" aria-busy={social.isPending}>
        {google.active && (
          // جوجل بيرسم زرّاره هنا؛ الـ min-h عشان الصفحة متتنططش لحد ما السكريبت يحمّل
          <div ref={googleRef} className="flex min-h-12 flex-1 items-center justify-center overflow-hidden rounded-[10px]" />
        )}
        {apple.active && (
          <button
            type="button"
            onClick={handleApple}
            disabled={!apple.ready || social.isPending}
            className="flex h-12 flex-1 items-center justify-center gap-2.5 rounded-[10px] border border-[#E5E7EB] bg-white text-sm font-bold text-[#0E0F11] transition-colors hover:bg-[#F7F8FA] disabled:opacity-60 cursor-pointer"
          >
            {/* (keep the existing Apple <svg> path from the current file here) */}
            <span className="whitespace-nowrap">{prefix === "continue" ? "كمّل بآبل" : "آبل"}</span>
          </button>
        )}
      </div>
      {google.failed && <span className="text-[12px] text-[#6B7280]">مقدرناش نحمّل زرار جوجل. جرّب تاني.</span>}
      {error && (
        <span role="alert" className="text-[12px] font-medium text-[#B91C1C]">
          {error}
        </span>
      )}
    </div>
  );
}
```

Copy the existing Apple `<svg>` element into the button, replacing the JSX comment. Remove the old custom Google button and its SVG, because GIS draws its own. If `login-form.tsx` and `register-form.tsx` render an "أو" divider around the social buttons, hide it when the component returns `null`. The simplest way is to move the divider inside `SocialAuthButtons` above the buttons.

Pass `callbackUrl` from both forms: `<SocialAuthButtons prefix="continue" callbackUrl={callbackUrl} />`.

- [ ] **Step 6: Configure Google**

1. In Google Cloud Console → Credentials, create an OAuth client of type "Web application". Add authorized JavaScript origins `http://localhost:3213` and the production web origin. No redirect URI is needed for the popup flow.
2. Set `apps/web/.env.local` → `NEXT_PUBLIC_GOOGLE_CLIENT_ID=<id>`, and `central-app/.env` → `GOOGLE_CLIENT_IDS=<same id>` (comma-append the iOS/Android ids later).
3. Apple (later, when keys exist): create a Services ID with the web domain and return URL. Set `APPLE_AUTH_ENABLED=true` and `APPLE_CLIENT_IDS=<services id>` on the server, and `NEXT_PUBLIC_APPLE_CLIENT_ID`/`NEXT_PUBLIC_APPLE_REDIRECT_URI` on the web.

- [ ] **Step 7: Verify**

Run: `pnpm test && npx tsc --noEmit && npx eslint src`
Expected: clean.

Manual:
1. With `GOOGLE_CLIENT_IDS` empty, `/ar/login` shows no social row.
2. With it set, the Google button renders in Arabic on `/ar/login` and in English on `/en/login`.
3. Sign in with a new Google account. You land on `/ar/onboarding` at the **phone** step. Verify a fresh phone, then go through profile (names pre-filled), location, and birth date.
4. Repeat with a Google account whose email matches an existing verified customer. You log straight in (link by email).
5. Sign in with a new Google account and verify the phone of an existing account. The merge returns that account's session, and the header shows the existing account's name.

- [ ] **Step 8: Commit**

```bash
git add apps/web/.env.example apps/web/src
git commit -m "feat(web): google identity services and apple sign-in buttons"
```

---

### Task 10: Web — refresh the saved location in the background for returning users

The onboarding step only runs once. To keep "closest salons" accurate, refresh `last_lat/last_lng` silently once a day **only when the browser already granted permission**, so no prompt appears.

**Files:**
- Create: `apps/web/src/lib/hooks/user/use-location-sync.hook.ts`; export from index
- Create: `apps/web/src/components/atoms/location-sync/{location-sync.tsx,index.ts}`
- Modify: `apps/web/src/lib/contexts/providers.tsx`

**Interfaces:**
- Consumes: `syncLocation` (Task 4), `QK_LOCATION_SYNC` (Task 4), `useUser`.

- [ ] **Step 1: Hook**

```ts
"use client";

// تحديث صامت لموقع المستخدم مرة في اليوم، لو الإذن متاخد قبل كده بس (من غير popup)
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { syncLocation } from "@/lib/actions/user/location.action";
import { QK_LOCATION_SYNC, QK_USER } from "@/lib/data/constants/query-keys.constants";
import { useUser } from "./use-user.hook";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function useLocationSync() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  useQuery({
    queryKey: QK_LOCATION_SYNC(user?.id ?? "none"),
    enabled: !!user && user.onboarding.complete,
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const updated = user ? await syncLocation(user) : null;
      if (updated) queryClient.setQueryData(QK_USER, updated);
      return updated?.location ?? null;
    },
  });
}
```

- [ ] **Step 2: Mount it once**

`components/atoms/location-sync/location-sync.tsx`:

```tsx
"use client";

// مكوّن من غير واجهة: بيشغّل تحديث الموقع في الخلفية
import { useLocationSync } from "@/lib/hooks/user";

export function LocationSync() {
  useLocationSync();
  return null;
}
```

In `providers.tsx`, render `<LocationSync />` inside `QueryClientProvider`, next to `{children}`.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npx eslint src`
Manual: a user with `location_source = 3` (manual) never gets a sync request. Then log in as a user with `location_source = ip`, with the browser permission already "Allow" for `localhost:3213`. Reload `/ar`. One `PUT /me/location` with coordinates appears in the Network tab, and the DB source becomes `gps`. Reload again and no new request is sent. With permission "Ask", no prompt appears and no request is sent.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src
git commit -m "feat(web): silent daily location refresh when permission was already granted"
```

---

### Task 11: End-to-end checklist and docs

**Files:**
- Modify: `apps/bltdreeg-server/docs/superpowers/specs/2026-09-27-customer-auth-api-design.md`
  - §8.8: add "IP fallback never replaces a GPS location".
  - §11: the reset token lives in the React Query cache, not the URL; location refresh in the background.
- Modify: `bltdreeg-plan/plan/customer-app.md` (CA-A1: web onboarding, reset and social done; mobile follow-up)

- [ ] **Step 1: Run every automated check**

```bash
cd apps/bltdreeg-server/central-app && php artisan test --filter=CustomerAuth
cd ../../web && pnpm test && npx tsc --noEmit && npx eslint src
```

Expected: all green. Paste the summary lines into the PR description.

- [ ] **Step 2: Manual end-to-end run** (spec §13 web checklist, against the local Docker stack)

- [ ] As a guest, open `/ar/book/1`. You are sent to login with `callbackUrl=/book/1`.
- [ ] Register → OTP → onboarding → location allowed → pin shown on the map → confirmed → birth date skipped → back on `/ar/book/1`.
- [ ] Location with a simulated VPN (Sensors abroad): the map opens inside Egypt, the pin is moved to the real place, and it is saved as `manual`. A reload with permission granted does not overwrite it.
- [ ] Log out, then use OTP login → `/ar`.
- [ ] Google sign-up (new) → phone → profile → location denied (IP note) → done.
- [ ] Forgot password by phone → code → new password → logged in. Other devices' tokens are revoked (check the `personal_access_tokens` count).
- [ ] Forgot password by email → same.
- [ ] Open `/ar/login` while logged in and you go to `/ar`. Revoke the token in the DB and reload `/ar/login`: you land on `/ar`, the cookie is cleared, and `/ar/login` opens on the next visit (no loop).
- [ ] Open `/ar/account` with the onboarding cookie set and you go to `/ar/onboarding?callbackUrl=%2Faccount`.

- [ ] **Step 3: Update docs and commit**

```bash
git add apps/bltdreeg-server/docs bltdreeg-plan/plan/customer-app.md
git commit -m "docs(customer-auth): record onboarding, location and reset decisions"
```

---

## Out of scope (follow-ups)

- **"Closest salons" query itself.** `branches.latitude/longitude` are `string` columns in `packages/core/database/migrations/2024_01_01_000000_create_identity_tables.php`. Before writing a distance query, migrate them to `decimal(10,7)` and add an index on `(latitude, longitude)` for bounding-box pre-filtering. Then rank by Haversine against `customers.last_lat/last_lng`. This needs its own spec because it touches tenant-app branch editing.
- **Account → profile:** add/change email with a code dialog, and set/change password. It reuses `OtpCodeInput` from Task 5 (spec §11, last bullet). A "change my location" entry there reuses `LocationPickerMap` and `locationToSave` from Task 7b as-is.
- **Address search on the map** (type "مدينة نصر" and jump there). For a VPN user far from Cairo, tapping their region at Egypt zoom works but is slow. Search needs a geocoding provider (Nominatim's public API doesn't allow autocomplete traffic), so pick it together with the production tile provider.
- **Production tiles:** set `NEXT_PUBLIC_MAP_TILE_URL` to a hosted provider before launch (see Global Constraints).
- **Mobile wiring** (spec §14).
