# Customer App — Customer-Facing Mobile Surface

Separate surface from both Filament panels. Customer identity/auth talks to the
**central-app** `/api/v1` customer API (domain owned by `central-app`, not
`packages/core` or `tenant-app`). Salon browse/queue later uses central + tenant
backends as those features land; no panel code in the customer apps.

Legend — **Status**: `pending` (nothing for the customer app exists yet).
**Migrations**: draft filenames under `docs/schema/migrations-draft/` until
applied.

---

## Section A · Identity

### CA-A1 · Registration & login
Verified phone on every account; login by phone/email + password, phone OTP
(WhatsApp or SMS), Google / Apple; customer onboarding; Sanctum device tokens.
Guests browse, an account is required to book.
- **Status:** `designed` — API + web in progress, mobile wiring is a follow-up
- **Spec:** `apps/bltdreeg-server/docs/superpowers/specs/2026-09-27-customer-auth-api-design.md`
- **Migrations:** replaced by the spec's §4 (draft `2026_10_02_000000_create_customers_table.php` superseded)
- **Mobile follow-up:** `BACKEND=real`, channel picker, `/auth/options`,
  social buttons, onboarding, forgot password, nullable phone, error-code parsing.
- **Refs:** `01-customer-booking-and-live-queue.md`

---

## Section B · Discovery

### CA-B1 · Salon browse + ranking
List of branches from platform ranking query (SB-C13) with info/rating/tags;
search by `service_type`, `area`, `tagName`; branch detail shows services +
packages + wait.
- **Status:** `pending`
- **Migrations:** `2026_10_03_003000_create_ratings_table.php`,
  `2026_10_02_000200_create_packages_table.php`
- **Steps:** feed endpoint; branch detail; effective prices via SB-C3/BranchCatalog.
- **Refs:** `10-salon-rating-and-ranking.md`, `06-service-and-package-pricing.md`

---

## Section C · Live queue & slots

### CA-C1 · Join queue now
Join-now → live position/wait via SB-C1 + SB-C3; notify on full branch; leave
queue anytime before service start.
- **Status:** `pending`
- **Migrations:** `2026_10_02_002000_create_reservations_table.php`
- **Steps:** join entrypoint; live position endpoint; leave action.
- **Refs:** `01-customer-booking-and-live-queue.md`

### CA-C2 · Slot booking
Book future slot (SB-C4) respecting capacity/lead-time rules; manage current
slots (leave queue / cancel slot); auto-join on slot start.
- **Status:** `pending`
- **Migrations:** `2026_10_02_001000_create_slots_table.php`,
  `2026_10_02_002000_create_reservations_table.php`
- **Steps:** slot list + booking; my-slots screen; conflict-ask choice.
- **Refs:** `01-customer-booking-and-live-queue.md`

### CA-C3 · Service change + postpone / cancel
Mid-queue service switch (recomputes expected wait, never reseats); postpone
once per reservation; instant free re-join after removal. Two-strike absent
removal visible to the affected customer.
- **Status:** `pending`
- **Migrations:** `2026_10_02_004000_create_queue_events_table.php`
- **Steps:** actions wired to SB-C2 + SB-C3.
- **Refs:** `01-customer-booking-and-live-queue.md`

---

## Section D · QR & billing

### CA-D1 · QR scan & check-in
Scan branch QR (SB-C5) verifying window; random-join fixed code flows to join
form, profile-registered dynamic code flips reservation to checked-in (never
reorder).
- **Status:** `pending`
- **Migrations:** `2026_10_02_006000_create_qr_rotations_table.php`,
  `2026_10_02_007000_create_qr_scans_table.php`
- **Steps:** scanner component; verify counter increment on success.
- **Refs:** `09-qr-proof-and-discount.md`

### CA-D2 · Final bill view
Post-visit bill (lines, discounted total, app/QR-sourced flag derived from
`app_sourced`); snapshot-red prices per `06-…`; leave feedback entrypoint after
`service_finished_at`.
- **Status:** `pending`
- **Migrations:** `2026_10_03_000000_create_visits_table.php`
- **Steps:** bill endpoint; send-to-email/display; rating CTA.
- **Refs:** `07-revenue-model.md`, `09-qr-proof-and-discount.md`

---

## Section E · Notifications & feedback

### CA-E1 · Notifications + prefs
In-app inbox + push; turn-critical tier (cannot mute) vs informational tier
(individually muteable) per SB-C14; notification prefs screen backed by
`notification_prefs`.
- **Status:** `pending`
- **Migrations:** `2026_10_03_004000_create_notifications_and_settings_tables.php`
- **Steps:** inbox API; pref toggles; push registration.
- **Refs:** `05-notifications.md`

### CA-E2 · Post-visit ratings
Rate completed QR-verified visit once (SB-C13 gate); trigger turn-time alerts to
barber via existing dashboard notification path.
- **Status:** `pending`
- **Migrations:** `2026_10_03_003000_create_ratings_table.php`
- **Steps:** rating form endpoint; star + optional message.
- **Refs:** `02-barber-profiles.md`, `10-salon-rating-and-ranking.md`