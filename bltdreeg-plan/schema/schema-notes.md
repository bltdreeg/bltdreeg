# Schema notes — Salon Queue

Companion to `erd.mermaid`. Records how the ERD (domain model + features 1–11)
maps onto the **actual** codebase schema, the conventions we keep, and where the
DB enforces an invariant versus where the application layer must.

## Source of truth and location

- Decisions: `docs/domain-model.md`, `docs/features/01-*.md` … `11-*.md`.
- Diagrams: `docs/schema/erd.mermaid` (aligned to real table names).
- **Existing, applied migrations**: `packages/core/database/migrations/` (24 files, do not edit).
- **New drafts** (this work): `docs/schema/migrations-draft/` — 26 files dated
  `2026_10_01`…`2026_10_03`, sorted after the existing ones. They are **drafts**;
  moving them into `packages/core/database/migrations/` and running `php artisan
  migrate` is a tracked task (see `plan/shared-backend.md`).

## ERD → actual name mapping

| ERD entity | Actual table | Notes |
|---|---|---|
| SALON | `tenants` | Existing tenancy model. Keeps `tenant_id` column name everywhere. |
| BRANCH | `branches` | Existing. |
| EMPLOYEE / PLATFORM_USER | `users` (+ `tenant_user` pivot) | Single identity table stays; employees = user + `tenant_user.job_type_id` + one `users.branch_id`; platform operators = `users.is_super_admin`. **No separate employee/platform_user tables**. |
| CUSTOMER | `customers` | **New separate table** (decision 1) — staff stay on `users`. |
| ROLE / PERMISSION | `roles` / `permissions` (Spatie) | `roles.tenant_id` required, `unique(tenant_id,name,guard)`. Platform powers live in `role_templates`, not platform-scope roles (decision 2). |
| CATALOG_* | `catalog_*` | Existing. `catalog_job_types.grants_login` added. |
| SERVICE | `services` (+ `branch_services`) | `services` = salon copy-on-take template; `branch_services` = per-branch divergence (decision 3). |
| PACKAGE / PACKAGE_SERVICE | `packages` / `package_service` (+ `branch_packages`) | Same divergence pattern for packages (user decision). |

## New tables (26 migrations) at a glance

| Group | Tables | Migration draft file(s) |
|---|---|---|
| Tenancy alters | `tenants` (+contract), `branches` (+live state) | `2026_10_01_000000…`, `…_001000…` |
| Contract history | `salon_contract_logs` | `2026_10_01_002000…` |
| Floor ops | `chairs`, `barber_profiles`, `chair_day_assignments`, `barber_absences`, `branch_state_events` | `2026_10_01_003000…007000…` |
| RBAC alters | `catalog_job_types` (+`grants_login`), `roles` (+preset link) | `2026_10_01_008000…` |
| Marketing identity | `customers` | `2026_10_02_000000…` |
| Catalog override | `branch_services`, `packages`, `branch_packages`, `package_service` | `2026_10_02_000100…000400…` |
| Queue | `slots`, `reservations`, `reservation_lines`, `queue_events`, `redistributions` | `2026_10_02_001000…005000…` |
| Presence proof | `qr_rotations`, `qr_scans` | `2026_10_02_006000…007000…` |
| Billing | `visits`, `visit_lines`, `commission_lines`, `invoices`, `gateway_transactions` | `2026_10_03_000000…002000…` |
| Feedback | `ratings` | `2026_10_03_003000…` |
| Notifications/config | `notifications`, `notification_prefs`, `platform_settings` | `2026_10_03_004000…` |

## Conventions kept (decision 4)

- **Money**: `decimal(10, 2)` — matches existing `services.price` / `users.salary`.
  ERD's `numeric(12,2)` was **not** adopted to avoid a half-Egyptian number format.
- **Currency**: existing `tenants.currency` `tinyInteger` → `CurrencyEnum` kept; ERD's
  `varchar currency 'EGP'` **not** adopted.
- **PKs** (decision 5): every table uses `id()` bigint PK + unique index instead
  of ERD composite PKs, matching `user_services` / `tenant_user` convention.
  `reservation_lines`/`visit_lines` use `unique(reservation_id|visit_id, line_no)`;
  `package_service` uses `unique(package_id, service_id)`;
  `notification_prefs` uses `unique(customer_id, type)`.
- FK style `foreignId()->constrained()->cascadeOnDelete()`, nullable staff FKs
  `nullOnDelete()`, `timestamps()`, guarded `Schema::hasColumn/hasTable` on alters.

## Derived columns — NOT stored (computed in app)

| Derived value | Where computed |
|---|---|
| Queue position | Live projection over `reservations.join_time`, transient skips/postpones. Never stored. |
| `branches.suspended` / `discoverable` | From overdue invoice (day 8). |
| `slots.full` | holder count ≥ capacity. |
| `visits.app_sourced` | reservation AND qr_scan present. |
| `visit.platform_commission` etc. | Sum of lines + discount split at service end. |
| Salon/barber rating average & rank | Aggregate over `ratings` incl. minimum-ratings floor + scan-count tie-break. |

## Invariants and where they are enforced

- **One active live-queue reservation per customer**: PostgreSQL partial unique
  index `reservations_one_live_queue_per_customer` (in the draft). On
  MySQL/MariaDB/SQLite (no partial indexes) the **queue engine** enforces it.
- **One booking per slot**: `unique(customer_id, slot_id)` enforces a customer
  never holds the same slot twice; capacity/full is app-enforced.
- **Two active future slots, no same start time**: app-enforced (slot engine).
- **Ratings once per visit per target**: `ratings_visit_target_unique` unique
  index + app check (nullable target ids make the index insufficient alone).
- **Walk-ins never discounted/commissioned**: app-enforced in the billing engine;
  `commission_lines.unique(visit_id)` guarantees one line per visit.
- **Invoice no-partial state**: `invoices.status` in (`due`,`paid`); app + enum.
- **`gateway_ref` idempotency**: `gateway_transactions.gateway_ref` unique.
- **Turn-critical notifications never muted**: app-enforced in the prefs layer.

## Deliberate divergences from the ERD (decided with the owner)

1. **`customers` is a separate table**; ERD's CUSTOMER vs PLATFORM_USER/EMPLOYEE
   separation was resolved as: `users` = staff/platform, `customers` = app users.
2. **No platform-scope `roles`**: `role_templates` (central catalog) cover
   platform powers; `roles.tenant_id` stays NOT NULL. Thought-through, keeps RBAC
   rework intact.
3. **Per-branch catalog override** via `branch_services` / `branch_packages`
   (price + duration nullable, coalesce to the salon-level row) instead of a
   salon-only `SERVICE`/`PACKAGE`. Keeps feature 6's independence + feature 11's
   copy-on-take and keeps wait arithmetic / discount base branch-consistent.
4. **`services`/`packages` stay salon-scoped templates**; `branch_*` pivot rows
   let branches diverge. (Package branching confirmed by owner, same pattern.)
5. **Derived fields are not columns.**
6. **`ratings` composite uniqueness** uses real nullable FKs; the ERD's
   `unique(visit_id, target_type, barber_profile_id, salon_id)` survives as the
   `ratings_visit_target_unique` index with app-side completion gating.

## Things to fold into the plan

- Copy drafts → `packages/core/database/migrations/`, then `php artisan migrate`.
- Add models/relations for every new table under `packages/core/src/Modules/…`
  following the `Module` structure (model + factory + policy + enums).
- Queue/slot/QR/commission/notification **engines** are tracked in
  `plan/shared-backend.md`; dashboard surfaces in `plan/tenant-dashboard.md`,
  `plan/central-dashboard.md`, and the customer surface in `plan/customer-app.md`.