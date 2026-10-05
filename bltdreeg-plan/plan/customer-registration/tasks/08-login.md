# 08 · Password login, OTP login, logout

**Depends on:** 07 · **Spec:** §8.2, §8.3, §8.9

## Steps
- [ ] `POST /auth/login`: `phone` or `email` + `password`; email matches verified `email` only.
      Wrong password / unknown / social-only → same `auth.invalid_credentials`. Disabled →
      `auth.account_disabled`. Throttled per (normalised identifier + IP).
- [ ] `POST /auth/otp`: unregistered → `auth.phone_not_registered`; **disabled → `auth.account_disabled`
      before anything is sent** (no SMS cost for dead accounts); else `login` challenge.
- [ ] `POST /auth/otp/verify {purpose: login}` → AuthSession.
- [ ] `POST /auth/logout` → deletes the current token, 204.

## Done when
- [ ] Pest: phone and email login; pending email rejected; social-only rejected; disabled (password and
      OTP paths); throttling; OTP login; logout revokes only the current token.
