# 10 · Account (`/me`) + onboarding gate

**Depends on:** 08 · **Spec:** §7.3, §7.4, §8.5 (non-merge paths), §8.7, §8.8, §8.9

## Steps
- [ ] `GET /me`; `PUT /me` (names, `email?`, `birth_date?`, `accepted_terms?`; `area_name` ignored).
  - [ ] `birth_date` accepts a date **or an ISO datetime** (mobile sends `toIso8601String()`); store the date part.
  - [ ] New email → `pending_email` + code; same email → no-op; `null` removes it.
- [ ] `POST /me/email/resend`, `POST /me/email/verify` (taken meanwhile → `auth.email_taken`).
- [ ] `PUT /me/password`: `current_password` required when one exists; revoke other tokens; 204.
- [ ] `POST /me/phone` + `/me/phone/verify`: free phone → set + verify, AuthSession with current token;
      taken and caller already has a phone → `auth.phone_taken`. The "caller has no phone" merge path is
      task 11 (only incomplete social accounts can hit it).
- [ ] `PUT /me/location`: with lat/lng → Egypt bounding box, source `gps`. Without → `IpGeolocator`
      on the trusted IP. Bind a `NullIpGeolocator` (returns null) for now; task 13 adds the real one.
- [ ] `DELETE /me` via `CustomerDeletion` (one transaction: tokens, social accounts, tombstone hash,
      anonymise, soft delete).
- [ ] Disabling a customer (`is_active = false`) revokes all tokens: one `CustomerAccess::disable()`
      action used by the admin panel (task 12), not a model observer, so it's explicit and testable.
- [ ] `EnsureCustomerOnboarded` (alias `customer.onboarded`) → 403 `auth.onboarding_required` with
      `missing`. Auth and `/me*` routes exempt. Add a line to `plan/customer-app.md` that every booking,
      favorites and rating route must use it.

## Done when
- [ ] Pest: profile update (incl. ISO datetime birth date); pending email flow; password change revokes
      others; phone set / taken; location gps, no-coords (null), outside Egypt; deletion anonymises and the
      phone can register again; gate response and `onboarding` block.
