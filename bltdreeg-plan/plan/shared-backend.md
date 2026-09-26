# Shared Backend — Schema, Models, Engines, RBAC Grounding

Everything that is not tied to one dashboard surface: the database continuation,
the domain models it needs, and the engines that implement the locked decisions
of `docs/features/01…11-*.md`. UI that simply eats these engines is tracked in
`tenant-dashboard.md`, `central-dashboard.md`, `customer-app.md`.

Legend — **Status**: `done` · `pending` · `inProgress`. **Migrations**: by
filename; draft names live under `docs/schema/migrations-draft/` until task
SB-S3.

---

## Section A — Schema

### SB-A1 · Existing applied schema (baseline)
Identity/tenancy, catalog, services, RBAC, HR, onboarding — 24 migrations already
applied. Never modified; later work only adds new migrations.
- **Status:** `done`
- **Migrations:** all 24 in `packages/core/database/migrations/`
- **Refs:** — (foundation)

### SB-A2 · Draft continuation schema authored
26 new migration drafts covering the full domain gap (see index migration table).
- **Status:** `done` — files written and lint-clean under
  `docs/schema/migrations-draft/`.
- **Migrations:** the 26 draft files in `00-index.md`
- **Refs:** all features (per-table mappings in `schema-notes.md`)

### SB-A3 · Apply the continuation schema
Copy the 26 drafts into `packages/core/database/migrations/` preserving sort
order, run `php artisan migrate`, verify with `make migrate-fresh` + seed.
- **Status:** `pending`
- **Migrations:** the 26 draft files (moved into place)
- **Steps:**
  1. Copy drafts → package migration dir (date order `2026_10_01…2026_10_03`).
  2. `php artisan migrate` in both apps (shared DB).
  3. Spot-check key tables (reservations partial unique index on Postgres,
     branch_services/branch_packages unique pairs, ratings unique).
  4. Confirm no existing migration was opened.
- **Refs:** `schema-notes.md`

### SB-A4 · Schema documentation
`erd.mermaid` (aligned to real tables + new tables) and `schema-notes.md`
(mapping, conventions, derived columns, invariant enforcement).
- **Status:** `done`
- **Migrations:** none
- **Refs:** all features

---

## Section B — Models & relations

Add to `packages/core/src/Modules/…` following the existing module pattern
(model + `BelongsToTenant`/`BelongsToBranch` cross-cutting concerns + factory +
policy for Filament where needed). Grouped for trackability.

### SB-B1 · Floor-operations models
`Chair`, `BarberProfile`, `ChairDayAssignment`, `BarberAbsence`,
`BranchStateEvent`. Relationships: branch hasMany chairs/state events; profile
belongs to tenant, hasMany assignments/absences, belongsTo default chair;
assignment belongs to branch+chair+profile with `unique` guard.
- **Status:** `pending`
- **Migrations:** `2026_10_01_003000…007000…` (chairs, barber_profiles,
  chair_day_assignments, barber_absences, branch_state_events)
- **Steps:** models; casts (status/leaving_status enums); relations; factories.
- **Refs:** `02-barber-profiles.md`, `03-opening-the-shop.md`,
  `04-emergency-chair-disabling.md`

### SB-B2 · Identity + catalog-override models
`Customer`, `BranchService`, `Package`, `BranchPackage`. Effective price/duration
helper `BranchCatalog::effective(service|package, branch)` resolving
coalesce(branch_*, parent).
- **Status:** `pending`
- **Migrations:** `2026_10_02_000000…000400…`
- **Steps:** models; BranchService/BranchPackage scoped by branch; factory +
  policy; shared `effective…()` service used by queue + billing engines.
- **Refs:** `01-customer-booking-and-live-queue.md`, `06-service-and-package-pricing.md`

### SB-B3 · Queue models
`Slot`, `Reservation`, `ReservationLine`, `QueueEvent`, `Redistribution`.
Reservation state machine enums (type/status/absence_state) live here.
- **Status:** `pending`
- **Migrations:** `2026_10_02_001000…005000…`
- **Steps:** models; enum classes; Scopes for active live-queue + slots;
  ReservationLine `unique(reservation_id, line_no)` guard.
- **Refs:** `01-customer-booking-and-live-queue.md`, `04-emergency-chair-disabling.md`

### SB-B4 · Presence + billing models
`QrRotation`, `QrScan`, `Visit`, `VisitLine`, `CommissionLine`, `Invoice`,
`GatewayTransaction`.
- **Status:** `pending`
- **Migrations:** `2026_10_02_006000…007000…`, `2026_10_03_000000…002000…`
- **Steps:** models; Visit `app_sourced` accessor (derived); Invoice status enum;
  GatewayTransaction `gateway_ref` unique assert.
- **Refs:** `09-qr-proof-and-discount.md`, `07-revenue-model.md`,
  `08-payment-and-monthly-collection.md`

### SB-B5 · Feedback + notification models
`Rating`, `CustomerNotification`, `NotificationPref`, `PlatformSetting`.
- **Status:** `pending`
- **Migrations:** `2026_10_03_003000…`, `…_004000…`
- **Steps:** models; PlatformSetting typed getter (`qr_rotation_minutes`,
  `split_customer_pct`, `split_platform_pct`, `invoice_due_days`,
  `ranking_min_ratings`); Rating enums.
- **Refs:** `02-barber-profiles.md`, `05-notifications.md`,
  `10-salon-rating-and-ranking.md`

---

## Section C — Engines (shared services)

### SB-C1 · Queue engine — join, ordering, projection
Join-now inserts a Reservation ordered solely by `join_time`; the queue is a live
projection, never stored. Enforces one active live-queue per customer (Postgres
partial unique index + engine gate).
- **Status:** `pending`
- **Migrations:** `2026_10_02_002000_create_reservations_table.php`
- **Steps:** joinNow(); liveQueue(chair); position stream; gates for closed
  branch / off chair / offline barber; emit `QueueEvent(join)` + notification
  hooks.
- **Refs:** `01-customer-booking-and-live-queue.md`

### SB-C2 · Queue engine — skip / postpone / cancel (two-strike)
First absent call → one position back + warning; second absent call → remove
(notify, penalty-free, instant rejoin). Postpone once per reservation (1–3 back,
control locks). Cancellation anytime before service start.
- **Status:** `pending`
- **Migrations:** `2026_10_02_002000…`, `…_004000_create_queue_events_table.php`
- **Steps:** skip(); postpone(); cancel(); absence_state transitions; emit events
  with `positions`/`detail`; hook notification pipeline (turn-critical tier).
- **Refs:** `01-customer-booking-and-live-queue.md`, `05-notifications.md`

### SB-C3 · Expected-wait computation
Sum of branch-effective durations of everyone ahead + barber's remaining time on
the current customer. Recomputes on service change using duration_at_booking
snapshots; never re-seats.
- **Status:** `pending`
- **Migrations:** `2026_10_02_003000_create_reservation_lines_table.php`,
  `2026_10_02_000100…`/`…000300…` (branch-effective values)
- **Steps:** waitFor(chair/reservation); serviceChange() recompute; feed push +
  board displays.
- **Refs:** `01-customer-booking-and-live-queue.md`, `06-service-and-package-pricing.md`

### SB-C4 · Slot scheduler
Slot CRUD (capacity default 1), full-slot gate, two-active-future-slots + no
same-start-time rules, slot-conflict ask at start (leave queue / cancel slot;
no answer → cancel slot), auto-join at slot start as a normal fresh joiner.
- **Status:** `pending`
- **Migrations:** `2026_10_02_001000_create_slots_table.php`,
  `2026_10_02_002000_create_reservations_table.php`
- **Steps:** bookSlot(); releaseSlot(); processSlotStart() (queued job or
  scheduled task); conflict push; capacity/join-time bookkeeping.
- **Refs:** `01-customer-booking-and-live-queue.md`

### SB-C5 · QR rotation engine
Generates rotating codes per branch, hashes the payload, tracks
valid_from/valid_until against `platform_settings.qr_rotation_minutes`; scan
must land inside a valid window.
- **Status:** `pending`
- **Migrations:** `2026_10_02_006000_create_qr_rotations_table.php`,
  `2026_10_02_007000_create_qr_scans_table.php`
- **Steps:** rotationService; verify(code, branch); recordScan(scan|assisted,
  assisted_by when staff path); flip reservation checked-in (never reorder).
- **Refs:** `09-qr-proof-and-discount.md`

### SB-C6 · Visit & billing engine
Reservation → Visit on service start; walk-in registration branch; finish() sums
lines, computes discount from snapshots, sets customer_paid/platform_commission;
service change cutoff until service_started_at.
- **Status:** `pending`
- **Migrations:** `2026_10_03_000000_create_visits_table.php`
- **Steps:** startVisit(); registerWalkIn(); finish(); recompute on change;
  derive `app_sourced`; open rating + bill surfaces.
- **Refs:** `07-revenue-model.md`, `09-qr-proof-and-discount.md`

### SB-C7 · Commission line engine
One line per QR-verified visit; snapshots of contract + platform split ride on
the reservation; rounding differences go to the platform.
- **Status:** `pending`
- **Migrations:** `2026_10_03_001000_create_commission_lines_table.php`
- **Steps:** createLine(visit) guarded by `unique(visit_id)`; snapshot terms.
- **Refs:** `07-revenue-model.md`, permutations in `08-payment-and-monthly-collection.md`

### SB-C8 · Invoice scheduling (monthly, rolling)
1st-of-month job; accumulates un-invoiced commission lines; issues only when
total ≥ 3 else rolls over; `status in (due, paid)` only; transfer_fee shown as a
separate line.
- **Status:** `pending`
- **Migrations:** `2026_10_03_002000_create_invoices_table.php`
- **Steps:** invoiceJob(); attachLines(); due→paid transition; no-partial guard.
- **Refs:** `08-payment-and-monthly-collection.md`

### SB-C9 · Gateway payment orchestration
Self-serve salon payment via Fawry/InstaPay/wallet; webhook + lookup paths drive
one idempotent event; `gateway_ref` unique; paid → invoice closed + suspension
lifted instantly.
- **Status:** `pending`
- **Migrations:** `2026_10_03_002000_create_invoices_table.php`
- **Steps:** recordWebhook(); recordLookup(); idempotency guard; closeInvoice()
  + lift suspension.
- **Refs:** `08-payment-and-monthly-collection.md`

### SB-C10 · Suspension derivation (overdue invoice)
`branches.suspended/discoverable` derived from an overdue invoice (day 8). A
paid transaction lifts it instantly.
- **Status:** `pending`
- **Migrations:** `2026_10_01_001000_add_live_state_fields…` (is_open backup),
  `…_002000_create_invoices…` (billing inputs)
- **Steps:** overdueAt(); derive flags; refresh on payment; power central
  visibility + tenant rules.
- **Refs:** `03-opening-the-shop.md`, `08-payment-and-monthly-collection.md`

### SB-C11 · Redistribution engine (feature 4)
Disable chair(s) → displaced customers merge into live chairs in the SAME branch
by join time (interleave), impact preview produced before confirm; two modes
ask_first / swap_then_notify; mid-service customer never redistributed;
whole-branch close collapses to absence flow.
- **Status:** `pending`
- **Migrations:** `2026_10_02_005000_create_redistributions_table.php`
- **Steps:** preview(); commit(); interleave logic; status flow
  offered/accepted/declined/cancelled/placed; target-customer notifications.
- **Refs:** `04-emergency-chair-disabling.md`

### SB-C12 · Barber absence flow
Notified swap-or-cancel on absence/check-out-with-obligations; customer chooses;
salon admin manual swap/cancel override at any time.
- **Status:** `pending`
- **Migrations:** `2026_10_01_006000_create_barber_absences_table.php`,
  `2026_10_02_005000_create_redistributions_table.php`
- **Steps:** absenceService; dispatch ask; resolve choice; admin override guard.
- **Refs:** `02-barber-profiles.md`

### SB-C13 · Ratings gate + ranking query
Only completed QR-verified app customers rate, once per visit; ranking = average
with minimum-ratings floor, tie-break by scan/verified-visit count.
- **Status:** `pending`
- **Migrations:** `2026_10_03_003000_create_ratings_table.php`
- **Steps:** eligibility guard; submitRating(); aggregates; rankingFor(area).
- **Refs:** `02-barber-profiles.md`, `10-salon-rating-and-ranking.md`

### SB-C14 · Notification pipeline
One pipeline for system AND dashboard-authored events → push + in-app inbox;
turn-critical (never muteable) vs informational (individually muteable);
estimates throttled/coalesced; two-stage turn warning (you're next / turn in ~N
min).
- **Status:** `pending`
- **Migrations:** `2026_10_03_004000_create_notifications_and_settings_tables.php`
- **Steps:** event → notification factory; push adapter (mobile); cooldown
  coalescing; prefs enforcement; inbox endpoints.
- **Refs:** `05-notifications.md`

### SB-C15 · Platform settings accessor
Typed reads for `qr_rotation_minutes`, splits, `invoice_due_days`,
`ranking_min_ratings`; used by engines above.
- **Status:** `pending`
- **Migrations:** `2026_10_03_004000…`
- **Steps:** settings service + cache-friendly reader.
- **Refs:** `05-notifications.md`, `08-…`, `09-…`, `10-…`

---

## Section D — RBAC grounding (feature 11)

### SB-D1 · grants_login enforcement
Barber job type grants no login; employee rows for barber = records only.
- **Status:** `pending`
- **Migrations:** `2026_10_01_008000_add_rbac_columns…`
- **Steps:** guard on panel access + provisioner; barber rows get no credentials.
- **Refs:** `11-employee-roles-and-permissions.md`

### SB-D2 · Job-type preset → role import
`roles.is_catalog_preset` + `source_job_type_id`; taking a catalog job type
carries its default permission set (taxied via existing role_templates).
- **Status:** `pending`
- **Migrations:** `2026_10_01_008000_add_rbac_columns…`,
  existing `2026_09_23_120000_create_role_templates…`
- **Steps:** preset service; importRoleFromJobType(); drift reporting.
- **Refs:** `11-employee-roles-and-permissions.md`

### SB-D3 · Branch-scope foundation (done) + reuse
Every employee user belongs to exactly one branch; query scope derives from it.
- **Status:** `done` — `BelongsToBranch`, `users.branch_id`, `SelectBranch`,
  `BranchSwitcher` already exist. New queue/HR dashboards must reuse these
  scopes; enforcement of new permission-gated actions is still pending.
- **Migrations:** existing `2024_01_01_000000_create_identity_tables.php`
- **Refs:** `11-employee-roles-and-permissions.md`

### SB-D4 · Legacy pivot reconcile
`user_services` implies per-barber service lists, which feature 2 removed (no
per-barber skill lists). Confirm it is unused/dead and decide drop vs keep as
history.
- **Status:** `pending` (flagged, low priority, needs owner confirmation)
- **Migrations:** existing `2026_09_15_041957_create_user_services_table.php`
- **Refs:** `02-barber-profiles.md`

---

## Section E — Docs & tooling

### SB-E1 · Plan/docs deliverables
This plan set, schema-notes, aligned ERD, draft migrations.
- **Status:** `done`
- **Migrations:** none
- **Refs:** all features

### SB-E2 · Test coverage for engines
Unit tests for queue two-strike, postpone-once, slot cap/conflict, idempotent
gateway, invoice rollover, ratings gate.
- **Status:** `pending`
- **Migrations:** none (depends on engines above)
- **Refs:** acceptance criteria of features 1, 4, 5, 8, 10