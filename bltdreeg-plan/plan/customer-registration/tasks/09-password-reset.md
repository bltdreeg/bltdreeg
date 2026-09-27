# 09 · Forgot / reset password

**Depends on:** 08 · **Spec:** §8.6

## Steps
- [ ] `POST /auth/password/forgot`: phone (whatsapp/sms) or verified email (email channel);
      unknown → `auth.account_not_found`; disabled → `auth.account_disabled` before sending.
- [ ] `POST /auth/password/verify`: code → random 64-char `reset_token`, valid 10 min, single use.
      Store it as **`hash('sha256', token)`**, not `Hash::make`: `/reset` only receives the token, so the
      server must look the challenge up by its hash, and bcrypt can't be looked up. SHA-256 is enough
      for a 64-char random value.
- [ ] `POST /auth/password/reset`: find challenge by `reset_token_hash`, check expiry, set password
      (also gives social-only accounts one), revoke **all** tokens, return a new AuthSession.
      Bad/used/expired → `auth.reset_token_invalid`.

## Done when
- [ ] Pest: reset by phone and by email; token single use and expiry; all old tokens revoked; disabled account.
