# 06 · Tokens, middleware, rate limits

**Depends on:** 01, 02, 03 · **Spec:** §8.10, §10

## Steps
- [ ] `CustomerTokenIssuer`: `expires_at = now + 90 d`, `device_name` (request value or User-Agent
      summary), `platform`.
- [ ] `ExtendCustomerToken`: when under 60 days remain, push `expires_at` to +90 d (one write a month per device).
- [ ] Schedule `sanctum:prune-expired --hours=24` daily next to the OTP prune.
- [ ] `TrustBffClientIp`: only when `X-Bff-Secret` matches `BFF_SHARED_SECRET` (`hash_equals`),
      overwrite `REMOTE_ADDR` with `X-Client-Ip` so `$request->ip()` is right everywhere.
      **Prepend** it to the `api` group in `bootstrap/app.php` so it runs before `throttle`.
- [ ] Rate limiters in `CustomerAuthServiceProvider`: login 5/min per (normalised identifier + IP).
- [ ] `SetApiLocale` saves `customers.locale` **only when it changed** (no write per request).
- [ ] Resources: `CustomerResource` (spec §7.1: `area_name` always null, `onboarding` block from
      `OnboardingStatus`), `AuthSessionResource`, `OtpChallengeResource`.

## Done when
- [ ] Pest: expired token 401; sliding writes only under 60 days; revoked token 401;
      a Filament staff session gets 401 on an `auth:customer` route; `X-Client-Ip` ignored without the secret.
