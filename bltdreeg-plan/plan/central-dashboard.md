# Central Dashboard — Platform Panel (`central-app`, Filament panel `admin`)

All work in this file lives in `central-app`, is platform-scoped (every tenant +
branch), and never uses branch switchers. It consumes `shared-backend.md` engines
where relevant (suspension derivation, invoice oversight).

Legend — **Status**: `done` · `pending` · `inProgress`. **Migrations**: draft
filenames under `docs/schema/migrations-draft/` until applied.

---

## Section A · Existing work (reconcile — `done`)

### CD-A1 · Platform CRUD baseline
Tenant resource (with Branch/User/Service/Category/JobType/Role relation
managers), User, Branch, CatalogService/CatalogServiceCategory/CatalogJobType,
RoleTemplate, OnboardingSubmission resources + review queue + onboarding
notifications.
- **Status:** `done`
- **Migrations:** all existing identity/catalog/RBAC/onboarding
- **Refs:** `11-employee-roles-and-permissions.md`, `06-service-and-package-pricing.md`

---

## Section B · Tenancy & contract terms

### CD-B1 · Tenant contract terms
Contract fields on `tenants` (contract_discount_pct, split customer/platform)
surfaced in the Tenant form; full contract edit history via
`salon_contract_logs` (versioned, who/what/when).
- **Status:** `pending`
- **Migrations:** `2026_10_01_000000_add_contract_fields_to_tenants_table.php`,
  `2026_10_01_002000_create_salon_contract_logs_table.php`
- **Steps:** form fields + validation; write-through to contract log on change;
  relation manager of contract logs.
- **Refs:** `07-revenue-model.md`, `08-payment-and-monthly-collection.md`

### CD-B2 · Platform settings
`PlatformSetting` page for `qr_rotation_minutes`, split defaults,
`invoice_due_days`, `ranking_min_ratings`; engines read via SB-C15 typed
accessor.
- **Status:** `pending`
- **Migrations:** `2026_10_03_004000_create_notifications_and_settings_tables.php`
- **Steps:** single-row settings resource/page; validate enums + integers.
- **Refs:** `05-notifications.md`, `08-…`, `09-…`, `10-…`

---

## Section C · Catalog & RBAC platform-side

### CD-C1 · CatalogJobType attribute + grants_login
Add `grants_login` field editing on CatalogJobType; platform-level role presets
carry `is_catalog_preset` + `source_job_type_id` (import drives DS-D2).
- **Status:** `pending`
- **Migrations:** `2026_10_01_008000_add_rbac_columns_to_catalog_job_types_and_roles_table.php`
- **Steps:** field on CatalogJobType resource; preset badge on roles; import
  action.
- **Refs:** `11-employee-roles-and-permissions.md`

### CD-C2 · Grants-login gating feedback
Surface which job types currently grant login vs not; warn on toggle that
branch-side provisioning reads this (SB-D1).
- **Status:** `pending`
- **Migrations:** `2026_10_01_008000_add_rbac_columns…`
- **Steps:** list/info column + hint text.
- **Refs:** `11-employee-roles-and-permissions.md`

---

## Section D · Platform visibility & oversight

### CD-D1 · Branch / tenant state overview
Platform table of branches showing live `is_open` + derived suspended /
discoverable flags (SB-C10), last state event, overdue invoice touchpoint.
- **Status:** `pending`
- **Migrations:** `2026_10_01_001000_add_live_state_fields_to_branches_table.php`,
  `2026_10_01_007000_create_branch_state_events_table.php`,
  `2026_10_03_002000_create_invoices_table.php`
- **Steps:** read-only dashboard/resource columns; drill to branch details.
- **Refs:** `03-opening-the-shop.md`, `08-payment-and-monthly-collection.md`

### CD-D2 · Commission & invoice oversight
Read-only Commission lines + monthly Invoice overview (tab-per-branch due/paid,
rollover accumulation, platform share totals per contract).
- **Status:** `pending`
- **Migrations:** `2026_10_03_001000_create_commission_lines_table.php`,
  `2026_10_03_002000_create_invoices_table.php`
- **Steps:** aggregate widgets (pending-only month balance) + rollover details.
- **Refs:** `08-payment-and-monthly-collection.md`

### CD-D3 · Platform investment tracking coarse dashboard
High-level revenue/investment view using invoice + contract snapshot data
(does not restate feature 07 exact formulas — those live in engine tests).
- **Status:** `pending`
- **Migrations:** `2026_10_03_002000_create_invoices_table.php`
- **Steps:** KPI cards (MRR estimate, platform commissions, array churn).
- **Refs:** `07-revenue-model.md`