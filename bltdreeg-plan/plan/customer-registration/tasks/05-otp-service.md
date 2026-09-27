# 05 · OTP service rules

**Depends on:** 04 · **Spec:** §6

## Steps
- [ ] `issue(identifier, purpose, channel, payload?, customer?)`:
  - [ ] **If an open challenge exists for (identifier, purpose), respect it:** locked → `auth.otp_locked`;
        before `next_resend_at` → `auth.otp_resend_too_soon`; otherwise treat it as a resend (keep
        `attempts`, lock and `send_count`). Only a consumed or expired, unlocked challenge is replaced
        fresh. *Why:* the spec's "a new challenge replaces the old one" would let anyone lift the
        5-wrong lock just by calling `/auth/otp` again.
  - [ ] 6-digit code, hashed; 5 min expiry from each send.
- [ ] `resend`: new code on the same challenge (old code dies); cooldown 60 s → 120 s → 300 s;
      does not reset attempts or lift a lock.
- [ ] `verify`: wrong → `auth.otp_invalid` with `attemptsLeft`; 5 wrong → locked 15 min
      (`auth.otp_locked`, `lockMinutes`); expired → `auth.otp_expired`; success sets `consumed_at`.
- [ ] Send limits, **both through Laravel `RateLimiter`**, checked before any provider is called:
      `otp:id:{identifier}` 5/hour across purposes, `otp:ip:{ip}` 20/hour. Challenges get replaced and
      pruned, so counting rows in the DB would undercount.
- [ ] Point `cache.limiter` at the `redis` store (Redis already runs in `infra/local/docker-compose.yml`).
      The default cache store is `database`, which would cost a DB write on every limiter hit. Tests keep `array`.
- [ ] `OTP_FIXED_CODE` only when `app()->isLocal()`.
- [ ] Daily prune command: consumed/expired challenges, and `otp_deliveries` older than 90 days.

## Done when
- [ ] Pest with time travel: expiry, lock, **re-issue while locked is refused**, escalating cooldown,
      hourly caps, resend kills the old code, `attempts_left` values.
