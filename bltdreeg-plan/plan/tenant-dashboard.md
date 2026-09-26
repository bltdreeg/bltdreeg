# Tenant Dashboard — Salon / Branch Panel (`tenant-app`, Filament panel `app`)

All work in this file lives in `tenant-app`, is scoped to the currently selected
branch (`SelectBranch`/`BranchSwitcher` exists), and consumes the engines from
`shared-backend.md`. Engines themselves (queue projection, redistribution,
slot scheduler, QR, billing) are NOT built here.

Legend — **Status**: `done` · `pending` · `inProgress`. **Migrations**: draft
filenames under `docs/schema/migrations-draft/` until applied.

---

## Section A · Existing work (reconcile — `done`)

### TD-A1 · Branch context + branch-scoped collection screens
Branch resource + `SelectBranch`/`BranchSwitcher`, Services, ServiceCategories,
Employees, Attendance + widgets, Shifts, JobTypes, Roles, onboarding flow pages,
`CatalogImporter` (imports catalog into branch services).
- **Status:** `done`
- **Migrations:** all existing identity/catalog/services/HR/RBAC/onboarding
- **Refs:** `11-employee-roles-and-permissions.md`, `06-service-and-package-pricing.md`

---

## Section B · Floor & staff operations

### TD-B1 · Barber profiles screen
CRUD over `BarberProfile` (name, job-type-driven permissions, default chair,
active flag, star badges) + deactivate safety net (no active obligations or
deflects to redistribution waitlist).
- **Status:** `pending`
- **Migrations:** `2026_10_01_004000_create_barber_profiles_table.php`
- **Steps:** resource via `TenantScope`; deactivate guard; badge/star display.
- **Refs:** `02-barber-profiles.md`

### TD-B2 · Chairs screen
CRUD over `Chair` (number, job type, `is_active`). Toggle-off routes through the
redistribution preview (see TD-C4); never hard-removes.
- **Status:** `pending`
- **Migrations:** `2026_10_01_003000_create_chairs_table.php`
- **Steps:** resource; status toggle with confirm; disable → TD-C4.
- **Refs:** `03-opening-the-shop.md`, `04-emergency-chair-disabling.md`

### TD-B3 · Daily roster + open/close switch
Per-day `ChairDayAssignment` from the roster panel; cashier sees `is_open`
switch on `branches` (default closed); opening applies the day's roster;
closing runs the collapse-to-absence flow.
- **Status:** `pending`
- **Migrations:** `2026_10_01_005000_create_chair_day_assignments_table.php`,
  `2026_10_01_001000_add_live_state_fields_to_branches_table.php`,
  `2026_10_01_007000_create_branch_state_events_table.php`
- **Steps:** roster builder (copy-previous); is_open action + state event log;
  close action → SB-C12 absence flow + leave-state flag (BarEntry rule).
- **Refs:** `03-opening-the-shop.md`

### TD-B4 · Barber check-in / check-out (cashier)
Check-in sets `chair_day_assignments.check_in_at` (queue-state presence);
check-out refuses while that barber has obligations (offers swap/cancel via
absence flow). Distinct from HR `employee_attendances`.
- **Status:** `pending`
- **Migrations:** `2026_10_01_005000_create_chair_day_assignments_table.php`
- **Steps:** action pair on roster; obligations check → SB-C12; attendance kept
  separate.
- **Refs:** `02-barber-profiles.md`, `03-opening-the-shop.md`

---

## Section C · Live queue cashier board

### TD-C1 · Queue board (per chair)
Live list per chair: customer, service-with-duration, effective slot,
position-as-project (never stored), expected-wait. Livewire polling by join
state; only visible while branch `is_open`.
- **Status:** `pending`
- **Migrations:** `2026_10_02_002000_create_reservations_table.php`
- **Steps:** board columns via `liveQueue(chair)`; wait display from SB-C3;
  realtime refresh + turn notifications trigger.
- **Refs:** `01-customer-booking-and-live-queue.md`

### TD-C2 · Board actions
Call next (not-present → two-strike skip via SB-C2), service finish (→ support
Visit via SB-C6), postpone/absent controls. Every action persists a
`QueueEvent` for audit.
- **Status:** `pending`
- **Migrations:** `2026_10_02_004000_create_queue_events_table.php`
- **Steps:** action wiring; absence→skip counters; finish→startVisit.
- **Refs:** `01-customer-booking-and-live-queue.md`

### TD-C3 · Walk-in registration
Reception registers a walk-in as a fresh live-queue joiner (mid-queue OK);
branch's side registers a customer identity so visits keep rating/bill history.
- **Status:** `pending`
- **Migrations:** `2026_10_02_000000_create_customers_table.php`
- **Steps:** registration form → create-or-find customer + reservation
  (walk-in); no reorder allowed.
- **Refs:** `09-qr-proof-and-discount.md`, `11-employee-roles-and-permissions.md`

### TD-C4 · Emergency chair disable + redistribution
Trigger with impact preview (who merges where, estimated new wait); confirm →
`Redistribution` status flow; per-target notifications. Whole-branch close
collapses to absence flow instead.
- **Status:** `pending`
- **Migrations:** `2026_10_02_005000_create_redistributions_table.php`
- **Steps:** call SB-C11 preview; modal confirm; status transitions set by
  engine; board reflects placed customers.
- **Refs:** `04-emergency-chair-disabling.md`

---

## Section D · Customer-facing branch output

### TD-D1 · QR onboarding (new customer)
QR join screen generating a new customer (via SB-C5). Needs an owner decision:
does the flow auto-skip straight to join, or land the new customer on a
profile-completion screen first? (Flagged during implementation — resolve
before building this task; add the answer to `docs/pending-questions.md` if the
owner hasn't weighed in yet.)
- **Status:** `pending`
- **Migrations:** `2026_10_02_006000_create_qr_rotations_table.php`,
  `2026_10_02_007000_create_qr_scans_table.php`
- **Steps:** verification view toggleable by branch; records scan + increments
  verify counter; new-customer join entrypoint.
- **Refs:** `09-qr-proof-and-discount.md`

### TD-D2 · QR display screen
Branch-facing live QR (rotating per platform config): random-join fixed mode,
profile-registered dynamic mode; prominent + fresh menu.
- **Status:** `pending`
- **Migrations:** `2026_10_02_006000_create_qr_rotations_table.php`
- **Steps:** fullscreen display component; rotation client via SB-C5; menu
  switchable.
- **Refs:** `09-qr-proof-and-discount.md`

### TD-D3 · Branch catalog overrides (per-branch pricing)
Branch-level services & packages CRUD: override price/duration (nullable →
fall back to salon/parent); toggle package revision visibility; activation.
- **Status:** `pending`
- **Migrations:** `2026_10_02_000100_create_branch_services_table.php`,
  `2026_10_02_000300_create_branch_packages_table.php`,
  `2026_10_02_000200_create_packages_table.php`
- **Steps:** two resources (branch_services, branch_packages) prefilled from
  parent catalog (import pattern like `CatalogImporter`); effective-value
  display via SB-C3 helper.
- **Refs:** `06-service-and-package-pricing.md`

---

## Section E · Billing & revenue

### TD-E1 · Slots definition
Slot CRUD screen (per brand chair, full capacity default 1, two-active-future +
no-same-start-time rules enforced by SB-C4).
- **Status:** `pending`
- **Migrations:** `2026_10_02_001000_create_slots_table.php`
- **Steps:** resource + validation from engine; capacity view of booking load.
- **Refs:** `01-customer-booking-and-live-queue.md`

### TD-E2 · Visit / payment handling
Cashier finishes a Visit (SB-C6), shows final bill; customer pays (self-serve)
via gateway OPS invoice screen or cash at branch; payment screen uses
SB-C9 lookup path when webhook missed.
- **Status:** `pending`
- **Migrations:** `2026_10_03_002000_create_invoices_table.php`,
  `2026_10_03_000000_create_visits_table.php`
- **Steps:** bill view; gateway pay flow; idempotent lookup button.
- **Refs:** `07-revenue-model.md`, `08-payment-and-monthly-collection.md`

### TD-E3 · Invoice list + pay (salon self-serve)
List of monthly invoices for the branch; details (lines, platform share,
transfer fee); pay-later allowed; PayNow → SB-C9 gateway.
- **Status:** `pending`
- **Migrations:** `2026_10_03_002000_create_invoices_table.php`
- **Steps:** resource; transition to paid; fresh-split default NIC signed per
  `08-…` permutations.
- **Refs:** `08-payment-and-monthly-collection.md`

### TD-E4 · Branch state history
Read-only listing of `BranchStateEvent`s (open/close/flags) for audit.
- **Status:** `pending`
- **Migrations:** `2026_10_01_007000_create_branch_state_events_table.php`
- **Steps:** relation manager pages on Branch.
- **Refs:** `03-opening-the-shop.md`