# 11 · Social login (Google, Apple behind a flag) + account merge

**Depends on:** 06, 10 · **Spec:** §8.4, §8.5 (merge path)

## Steps
- [ ] `SocialTokenVerifier` contract; `GoogleTokenVerifier`, `AppleTokenVerifier` on `firebase/php-jwt`
      (JWKS cached 1 h; `iss`; `aud` ∈ configured client ids; `exp`; `nonce`, required for Apple).
- [ ] Apple off until keys exist → `auth.provider_unavailable`; `/auth/options` omits it.
- [ ] `SocialAuthService`: existing link → login; provider-verified email equals a customer's verified
      email → link + login; else create an incomplete customer (phone null, names from token/body,
      verified email if free) → link → login.
- [ ] `POST /auth/social/{provider}` → AuthSession; `onboarding.missing` has `phone`, `terms` (+ `name`).
- [ ] Merge in `/me/phone/verify` when the phone belongs to account B and the caller has no phone,
      in one transaction:
  - [ ] Move the caller's social accounts to B; B already has a different account for that provider →
        `auth.social_conflict` (409).
  - [ ] `forceDelete()` the caller (the model soft-deletes by default; it can't have bookings because of the gate).
  - [ ] Revoke its tokens; return AuthSession for **B** with a new token.

## Done when
- [ ] Pest with fake verifiers: new → incomplete; login by link; link by email; invalid token; Apple
      unavailable; merge; `social_conflict`.
