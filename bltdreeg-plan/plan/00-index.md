# Salon Queue — Implementation Plan Index

Status of the whole build across the four workstream files. Facts verified
against the codebase (not assumed): two Filament panels already exist
(`central-app` = platform/`admin`, `tenant-app` = salon/`app` + Filament
tenancy), shared schema lives in `packages/core`, and the customer surface is a
separate (mobile) app with no panel.

## Repo map

| Path | Role in this plan |
|---|---|
| `packages/core/database/migrations/` | **existing, applied** migrations — never edited |
| `bltdreeg-plan/docs/schema/migrations-draft/` | **26 new draft migrations** (this deliverable) |
| `bltdreeg-plan/docs/schema/erd.mermaid` | ERD aligned to actual table names |
| `bltdreeg-plan/docs/schema/schema-notes.md` | mapping, conventions, invariant enforcement |
| `bltdreeg-plan/docs/features/NN-*.md` | acceptance criteria (cross-referenced below) |
| `bltdreeg-plan/plan/tenant-dashboard.md` | salon/branch panel work | see file |
| `packages/core/src/Modules/{Tenancy,Auth,Catalog,Services,Hr,Onboarding}/` | shared models/policies/engines |
| `central-app/app/Modules/V1/*` | platform Filament UI |
| `tenant-app/app/Modules/V1/*` | salon/branch Filament UI + Livewire |

## Workstream files

| File | Scope | Status |
|---|---|---|
| `00-index.md` | This index | done |
| `shared-backend.md` | Schema, models, queue/slot/QR/billing/invoice/rating/notification engines, RBAC grounding | see file |
| `tenant-dashboard.md` | Salon/branch panel (`tenant-app`, panel `app`) | see file |
| `central-dashboard.md` | Platform panel (`central-app`, panel `admin`) | see file |
| `customer-app.md` | Customer mobile app (separate surface) | see file |

Why these five: the codebase already has exactly the tenant+central panel split,
so the plan mirrors it (`tenant-dashboard.md` / `central-dashboard.md`). The
customer-facing app is a third surface distinct from both panels
(`customer-app.md`). Everything dashboard-agnostic — schema, domain engines,
notification pipeline — lives in `shared-backend.md`.

## Migration index

**Existing, already applied (24)** — status `done`, do not modify:

```
2024_01_01_000000_create_identity_tables.php
2024_01_02_000000_create_catalog_tables.php
2026_09_15_040229_create_permission_tables.php
2026_09_15_041141_create_service_categories_table.php
2026_09_15_041538_create_services_table.php
2026_09_15_041957_create_user_services_table.php
2026_09_16_120000_add_job_type_id_to_tenant_user_table.php
2026_09_16_190000_split_catalog_job_types.php
2026_09_20_190000_create_employee_attendance_table.php
2026_09_20_200000_create_shifts_table.php
2026_09_20_201000_add_shift_id_to_tenant_user_table.php
2026_09_20_202000_add_shift_id_to_employee_attendance_table.php
2026_09_21_000000_drop_role_templates.php
2026_09_22_120000_add_employee_fields_to_users_table.php
2026_09_22_121000_migrate_legacy_permissions_to_shield.php
2026_09_22_122000_fix_employee_attendance_unique_index.php
2026_09_23_100000_denormalize_role_tenancy.php
2026_09_23_110000_prune_unused_permissions.php
2026_09_23_120000_create_role_templates.php
2026_09_23_130000_rename_tenant_super_admin_role.php
2026_09_24_100000_add_onboarding_fields_to_tenants_table.php
2026_09_24_101000_add_onboarding_fields_to_branches_table.php
2026_09_24_102000_create_tenant_onboarding_tables.php
2026_09_24_103000_make_service_location_type_json.php
```

**New drafts (26)** — `bltdreeg-plan/docs/schema/migrations-draft/`, pending apply:

| # | Draft file | Creates/alters |
|---|---|---|
| 1 | `2026_10_01_000000_add_contract_fields_to_tenants_table.php` | `tenants` + contract/split |
| 2 | `2026_10_01_001000_add_live_state_fields_to_branches_table.php` | `branches` + is_open/opened_at/closed_at/created_by_emp |
| 3 | `2026_10_01_002000_create_salon_contract_logs_table.php` | `salon_contract_logs` |
| 4 | `2026_10_01_003000_create_chairs_table.php` | `chairs` |
| 5 | `2026_10_01_004000_create_barber_profiles_table.php` | `barber_profiles` |
| 6 | `2026_10_01_005000_create_chair_day_assignments_table.php` | `chair_day_assignments` |
| 7 | `2026_10_01_006000_create_barber_absences_table.php` | `barber_absences` |
| 8 | `2026_10_01_007000_create_branch_state_events_table.php` | `branch_state_events` |
| 9 | `2026_10_01_008000_add_rbac_columns_to_catalog_job_types_and_roles_table.php` | `catalog_job_types`.grants_login, `roles`.preset link |
| 10 | `2026_10_02_000000_create_customers_table.php` | `customers` |
| 11 | `2026_10_02_000100_create_branch_services_table.php` | `branch_services` |
| 12 | `2026_10_02_000200_create_packages_table.php` | `packages` |
| 13 | `2026_10_02_000300_create_branch_packages_table.php` | `branch_packages` |
| 14 | `2026_10_02_000400_create_package_service_table.php` | `package_service` |
| 15 | `2026_10_02_001000_create_slots_table.php` | `slots` |
| 16 | `2026_10_02_002000_create_reservations_table.php` | `reservations` |
| 17 | `2026_10_02_003000_create_reservation_lines_table.php` | `reservation_lines` |
| 18 | `2026_10_02_004000_create_queue_events_table.php` | `queue_events` |
| 19 | `2026_10_02_005000_create_redistributions_table.php` | `redistributions` |
| 20 | `2026_10_02_006000_create_qr_rotations_table.php` | `qr_rotations` |
| 21 | `2026_10_02_007000_create_qr_scans_table.php` | `qr_scans` |
| 22 | `2026_10_03_000000_create_visits_table.php` | `visits`, `visit_lines` |
| 23 | `2026_10_03_001000_create_commission_lines_table.php` | `commission_lines` |
| 24 | `2026_10_03_002000_create_invoices_table.php` | `invoices`, `gateway_transactions` |
| 25 | `2026_10_03_003000_create_ratings_table.php` | `ratings` |
| 26 | `2026_10_03_004000_create_notifications_and_settings_tables.php` | `notifications`, `notification_prefs`, `platform_settings` |

## Entity → owner file (where the work lands)

| Entity | Schema | UI work lands in |
|---|---|---|
| tenants/branches/contract terms | 1–3 | central-dashboard |
| chairs/barbers/roster/absences | 4–8 | tenant-dashboard |
| catalog job types / roles presets | 9 | central-dashboard + shared-backend |
| customers | 10 | customer-app |
| branch services/packages + packages | 11–14 | tenant-dashboard (UI), shared-backend (resolution) |
| slots/reservations/lines/events/redistribution | 15–19 | shared-backend (engine), tenant-dashboard (board), customer-app (booking) |
| qr rotations/scans | 20–21 | shared-backend (engine), tenant-dashboard (display), customer-app (scan) |
| visits/billing/commission/invoices/gateway | 22–24 | shared-backend (engine), tenant-dashboard (pay), central-dashboard (oversight) |
| ratings | 25 | shared-backend + customer-app |
| notifications/prefs/settings | 26 | shared-backend (pipeline), customer-app (prefs), central-dashboard (settings) |

## Reconcile: work already done (flagged everywhere below)

- **Schema**: identity, catalog, services, Spatie RBAC, role templates, HR
  (shifts/attendance), onboarding — all migrated and applied.
- **Backend models**: `User`, `Tenant`, `Branch`, `Role`, `RoleTemplate`,
  `Catalog*`, `Service`, `ServiceCategory`, `Shift`, `JobType`,
  `EmployeeAttendance`, onboarding models + enums, policies, factories.
- **Central panel**: Tenant (with Branch/User/Service/Category/JobType/Role
  relation managers), User, Branch, CatalogService\*, CatalogJobType, RoleTemplate,
  OnboardingSubmission resources + review service + onboarding notifications.
- **Tenant panel**: Branch (SelectBranch/BranchSwitcher), Services, ServiceCategories,
  Employees, Attendance (+widgets), Shifts, JobTypes, Roles, Onboarding flow pages,
  `CatalogImporter`, Attendance service, branch scoping via `BelongsToBranch`.
- Each task that is fully covered by the above is marked `done`; my marking
  rationale is written inline in `Reconcile` notes. Correct me if any is only
  partially finished.

## Decisions locked for this plan (owner-confirmed)

1. `customers` = new separate table (staff stays on `users`).
2. No platform-scope `roles`; platform powers via `role_templates`.
3. Per-branch catalog override `branch_services` (+ `branch_packages`) with
   nullable price/duration coalescing to the salon template; packages follow the
   same pattern.
4. Money `decimal(10,2)`; currency stays `CurrencyEnum tinyint`.
5. All tables `id()` PK + unique index (no composite PKs).
6. Derived values never stored (queue position, suspended, discoverable, full,
   app_sourced).
7. Barber presence = `chair_day_assignments.check_in_at` (queue state) kept
   distinct from HR `employee_attendances`.