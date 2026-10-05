# 07 · Register + OTP verify + auth options

**Depends on:** 05, 06 · **Spec:** §7.2, §8.1

## Steps
- [ ] `GET /auth/options` → `{ otp_channels, social_providers, terms_version }` from live settings.
- [ ] `POST /auth/register`: `first_name, last_name, phone, password, email?, accepted_terms?, channel?`.
  - [ ] Duplicate phone → `auth.phone_taken`; duplicate verified email → `auth.email_taken`.
  - [ ] Issue a `register` challenge; `payload` holds the profile and the **already hashed** password.
  - [ ] **No customer row yet.** Return OtpChallenge.
- [ ] `POST /auth/otp/verify {purpose: register}`: one transaction creates the customer
      (`phone_verified_at`, `terms_accepted_at` + `terms_version` if accepted, `locale`); email →
      `pending_email` + email code; issue token → AuthSession. Unique-index race → `auth.phone_taken`.
- [ ] `POST /auth/otp/resend` (shared by 08 and 09).

Note: mobile's real data source does not send `accepted_terms` today, so mobile sign-ups will land with
`terms` in `onboarding.missing`. Expected; the mobile follow-up adds it (task 17).

## Done when
- [ ] Pest: happy path; phone/email taken; no customer before verify; unique race; resend.
- [ ] Endpoints appear correctly in Scramble.
