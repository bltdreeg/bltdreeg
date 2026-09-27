# 02 · Data model & migrations

**Depends on:** 01 · **Spec:** §4

## Goal
All tables, models, enums, and factories for customer auth exist in `central-app`
(`app/Modules/V1/CustomerAuth/`), not in `packages/core` or `tenant-app`.

## Steps
- [ ] Migrations in `central-app/database/migrations/`. They run on the **central** DB and in
      central-app tests on **in-memory SQLite**, so keep them SQLite-compatible.
  - [ ] `customers` — columns per spec §4 (bigint PK + `ulid`, names, E.164 `phone` unique nullable,
        verified `email` unique, `pending_email`, nullable `password`, `birth_date`, location columns,
        terms columns, `locale`, `is_active`, `phone_tombstone_hash`, soft deletes).
  - [ ] `customer_social_accounts` — unique (`provider`, `provider_user_id`) and (`customer_id`, `provider`).
  - [ ] `personal_access_tokens` — Sanctum's standard columns + `device_name`, `platform`.
  - [ ] `otp_challenges` — per spec §4, plus an index on `reset_token_hash` (task 09 looks tokens up by it).
  - [ ] `otp_channel_settings` — **insert the three default rows in the migration itself**
        (`whatsapp` off, `sms` on/`log`, `email` on/`mail`). Production doesn't run seeders, and the
        dispatcher can't work without these rows.
  - [ ] `otp_deliveries`.
- [ ] Enums: `OtpChannelEnum`, `OtpPurposeEnum`, `SocialProviderEnum`, `LocationSourceEnum`, `OnboardingStepEnum`.
- [ ] Models (under `CustomerAuth`):
  - [ ] `Customer`: `HasApiTokens`, `SoftDeletes`, `HasUlids` with `uniqueIds(): ['ulid']` (bigint PK stays),
        route key `ulid`, `hashed` password cast.
  - [ ] `CustomerSocialAccount`, `OtpChallenge` (`payload` → `encrypted:array`), `OtpChannelSetting`, `OtpDelivery`.
- [ ] `CustomerFactory` states: `incompleteSocial`, `withVerifiedEmail`, `withPendingEmail`, `disabled`.

## Done when
- [ ] Fresh migrate + rollback is clean on MySQL (Docker) and SQLite (test suite).
- [ ] Unique indexes reject duplicate phone/email; the three channel rows exist after migrate.
