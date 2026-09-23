# RBAC rework plan

Status: implemented (Phases 0–8).

Scope: `packages/core`, `central-app`, `tenant-app` in `apps/bltdreeg-server`.

## The five problems, as they exist in the code today

1. **Two "super admins", one name.** `users.is_super_admin` is a platform flag that
   short-circuits every gate (`central-app/app/Providers/AppServiceProvider.php:26`,
   `tenant-app/app/Providers/AppServiceProvider.php:45`) and gates Central panel access
   (`packages/core/src/Models/User.php:55`). Separately, `TenantProvisioner` creates a
   Spatie role literally named `super_admin` per tenant for the salon owner
   (`TenantProvisioner.php:87`). Same name, unrelated meaning.

2. **Two apps, one permission table.** `central-app/config/filament-shield.php` and
   `tenant-app/config/filament-shield.php` are byte-identical, and both set
   `discovery.discover_all_resources => false`. Shield only walks the *current* panel's
   resources, so Central's role editor renders a map that is missing every tenant-only
   subject (Attendance, Shift, Employee) while both write to the same `permissions` rows.

3. **Central Roles is a trap.** `FilamentShieldPlugin::make()->centralApp()`
   (`AdminPanelProvider.php:135`) exposes a fully editable Shield role resource on the
   landlord panel, while the per-tenant view
   (`.../RelationManagers/RolesRelationManager.php:16`) is `isReadOnly() => true`.
   The editable surface is the wrong one.

4. **Permission blast.** `ShieldPermissions::names()` crosses 12 subjects — Central *and*
   tenant subjects mixed — with 12 affixes, giving 149 permissions, then
   `grantSuperAdmin()` / `assignTenantSuperAdminRole()` call
   `syncPermissions($permissionClass::query()->pluck('name'))` — *every* permission in the
   table, including Central's `Tenant`/`Catalog*` ones, onto a tenant role
   (`TenantProvisioner.php:97` and `:152`). No model in the repo uses `SoftDeletes`, so
   `Restore`/`ForceDelete`/`RestoreAny`/`ForceDeleteAny` are dead; nothing calls
   `replicate` or `reorder` either.

5. **Inconsistent checks.** Central registers **no** policies — it relies purely on
   `Gate::before` plus `canAccess()` flag checks on each resource. Tenant registers nine
   policies (`tenant-app/app/Providers/AppServiceProvider.php:35-43`). The eight policies in
   `packages/core/src/Policies/` are referenced by nothing — verified by grep, zero hits
   outside their own directory.

Also relevant: role templates already existed and were deleted by
`2026_09_21_000000_drop_role_templates.php`. This plan brings them back deliberately, as a
catalog that mirrors the existing `CatalogService` / `CatalogImporter` pattern rather than
the old `json permissions` blob.

## Decisions taken

| Question | Decision |
|---|---|
| Spatie `teams` | **Off.** Keep a plain `roles.tenant_id` column, scope via global scope. |
| Central role powers | Template catalog CRUD; tenant roles stay read-only for support. |
| Name collision | Tenant owner role renamed `super_admin` → `owner`. `is_super_admin` keeps its meaning. |
| Permission set | Split into Central vs tenant subject lists; drop the six unused affixes. |

## Target model

```
users.is_super_admin ──► platform operator. Gate::before bypass, Central panel access.
                         Never holds a tenant role.

role_templates       ──► Central-owned catalog. name, description, permissions (pivot),
                         is_active. No tenant_id.

roles.tenant_id      ──► every role belongs to exactly one tenant. NOT NULL.
roles.source_template_id ──► nullable; set when imported, for drift reporting.
roles 'owner'        ──► is_system, seeded per tenant, holds the full TENANT permission set.
```

Spatie `teams` goes to `false`. The team column disappears from `model_has_roles` and
`model_has_permissions`; `roles.tenant_id` stays as an ordinary column with a global scope
and `unique(tenant_id, name, guard_name)`. A user's role assignment is then global at the
pivot level, but every role row is tenant-owned, so the effective grant is still
tenant-scoped — and `SyncShieldTenant` / `setPermissionsTeamId()` juggling and its Octane
leak risk both disappear.

**Known consequence, stated plainly:** with teams off, a user who belongs to two tenants and
holds a role in each will, on one request, have `$user->roles` return both. Permission
*checks* stay correct only because each role's permission set is tenant-appropriate. Where a
check must be tenant-exact, the global scope on `Role` filters the relation. This is the
tradeoff of dropping teams; it is acceptable here because staff belong to one salon in
practice, but it is the single riskiest part of this plan and Phase 1 must prove it with a
test before anything else lands.

## Phases

### Phase 0 — safety net
Write the characterisation tests *first*, against current behaviour, so the refactor has a
baseline:
- owner of tenant A cannot read tenant B's roles
- owner cannot edit an `is_system` role
- a user with only `ViewAny:Service` cannot reach Attendance
- seeding twice is idempotent

Files: `tenant-app/tests/Feature/RbacBaselineTest.php`.

### Phase 1 — turn off Spatie teams
- `central-app/config/permission.php` + `tenant-app/config/permission.php`: `teams => false`.
- New migration `2026_09_23_100000_denormalize_role_tenancy.php`:
  - drop the team column from `model_has_roles` / `model_has_permissions`, rebuild their
    primary keys without it
  - `roles.tenant_id` → `NOT NULL`, FK to `tenants` cascade-on-delete, keep
    `unique(tenant_id, name, guard_name)`
- `packages/core/src/Models/Role.php`: add a `tenant` global scope reusing
  `BelongsToTenant::currentTenantId()`, plus a `forTenant()` escape hatch for provisioning
  and Central's read-only view. Replace the `team()` relation with `tenant()`.
- Remove `SyncShieldTenant` from both panels' `tenantMiddleware`.
- Remove `->tenantRelationshipName('roles')->tenantOwnershipRelationshipName('team')` from
  `AppPanelProvider.php:114-115`.
- Delete every `setPermissionsTeamId()` call in `TenantProvisioner` and `DemoData:40`.

Gate: Phase 0 tests green.

### Phase 2 — split the permission vocabulary
Rewrite `packages/core/src/Support/ShieldPermissions.php`:

```php
CENTRAL_SUBJECTS = [Tenant, User, CatalogJobType, CatalogService, CatalogServiceCategory]
TENANT_SUBJECTS  = [User, Role, Branch, JobType, Service, ServiceCategory,
                    Shift, EmployeeAttendance]
AFFIXES          = [ViewAny, View, Create, Update, Delete]   // was 12
CUSTOM           = Import:{JobType,Service,ServiceCategory},
                   CheckIn:EmployeeAttendance, CheckOut:EmployeeAttendance
```

New API: `ShieldPermissions::central()`, `::tenant()`, `::all()`. Keep `LEGACY_MAP` — the
`2026_09_22_121000` migration references it.

Both `config/filament-shield.php` files stop being identical: Central's
`custom_permissions` keeps only Central's, tenant's keeps the Import/Check ones.

Migration `2026_09_23_110000_prune_unused_permissions.php` deletes the dead affix rows
(`Restore*`, `ForceDelete*`, `Replicate:*`, `Reorder:*`) and their pivots.

### Phase 3 — role templates
- Migration `2026_09_23_120000_create_role_templates.php`:
  `role_templates` (id, name unique, description, is_active, timestamps),
  `role_template_permissions` (template_id, permission_id, unique pair),
  `roles.source_template_id` nullable FK null-on-delete.
  This is a forward re-add, not a revert of `drop_role_templates` — the old table's `json
  permissions` column is intentionally not reinstated; real FK'd permissions replace it.
- `packages/core/src/Models/RoleTemplate.php` with a `permissions()` belongsToMany.
- `packages/core/src/Support/RoleTemplateImporter.php`, mirroring `CatalogImporter`:
  `importTemplate(RoleTemplate, Tenant): Role` — `firstOrCreate` on
  `(tenant_id, source_template_id)`, copies name + permission set, `is_system = false` so
  the tenant can edit it afterwards.
- Central: `App\Modules\V1\Catalog\Filament\Resources\RoleTemplates\RoleTemplateResource`
  (+ List/Create/Edit pages), permission picker sourced from `ShieldPermissions::tenant()` —
  **not** from Shield's panel discovery, which is exactly what made Central's map wrong.

### Phase 4 — move RBAC to the tenant panel
- `AdminPanelProvider.php:135`: drop `->centralApp()`, and exclude Shield's `RoleResource`
  from the Central panel entirely. Central keeps `RoleTemplateResource` only.
- Keep `RolesRelationManager` read-only (decision above); point its query at
  `Role::forTenant($tenant)`.
- Tenant panel: keep Shield's role resource, add an **Import from catalog** header action
  listing active `RoleTemplate`s and calling `RoleTemplateImporter`.
- `owner` role stays `is_system`; `RolePolicy::update/delete` already block system roles.

### Phase 5 — rename `super_admin` → `owner`
- Both `config/filament-shield.php`: `super_admin.name => 'owner'`.
- Migration `2026_09_23_130000_rename_tenant_super_admin_role.php`: rename every
  `roles` row where `name = 'super_admin' AND tenant_id IS NOT NULL`, handling the
  unique index if an `owner` row already exists.
- `TenantProvisioner`: replace `grantSuperAdmin()` / `assignTenantSuperAdminRole()` with a
  single `ensureOwnerRole(Tenant): Role` that syncs **`ShieldPermissions::tenant()`**, not
  `Permission::all()`.
- `syncSuperAdminAccess()` / `revokeSuperAdminRoles()`: platform super admins stop being
  granted a tenant role at all — `Gate::before` already covers them, and
  `User::getTenants()` already returns all tenants for the flag. This deletes the loop at
  `TenantProvisioner.php:38` that walks every tenant on every super-admin save.

### Phase 6 — consistent checks
- Move the eight unused `packages/core/src/Policies/*` into use: register them from
  `CoreServiceProvider::boot()` so both apps bind the same policies, instead of the
  current tenant-only registration block.
- Central: register `TenantPolicy`, `UserPolicy`, `Catalog*Policy`; replace the six
  `canAccess() => Auth::user()?->is_super_admin` resource overrides with policy-driven
  `viewAny`. `Gate::before` still admits the platform flag, so behaviour is preserved while
  the check moves to one place.
- Delete the now-duplicated `central-app/app/Policies/RolePolicy.php` and
  `tenant-app/app/Policies/RolePolicy.php` (identical files) in favour of one in core.

### Phase 7 — seeds
Rework `packages/core/src/Support/DemoData.php` and add
`packages/core/src/Support/RoleCatalog.php`:

```
RoleCatalog::seed()   // Central-owned templates, mirrors Catalog::seed()
  Salon manager   — everything tenant-side except Role management
  Receptionist    — Branch/Service/ServiceCategory view, Attendance CheckIn/CheckOut
  Stylist         — own attendance + service view only
  Accountant      — read-only across the tenant
```

`DemoData::seed()` then, per tenant: provision → `ensureOwnerRole` → import *Salon manager*
and *Receptionist* from the catalog → seed one demo staff user per imported role, so the
seeded database actually demonstrates non-owner permission levels. Today it only ever
produces owners.

Both `DatabaseSeeder`s keep calling `DemoData::seed()`; no change there.

### Phase 8 — verification
- `php artisan migrate:fresh --seed` on both apps
- full Pest run, both apps
- manual: log in as each seeded role, confirm the nav matches the grant
- confirm `permissions` row count dropped from 149 to ~45, and that the `owner` role no
  longer holds `Create:Tenant`

## Risks

- **Dropping teams is the load-bearing risk** (see consequence note above). Phase 1 gates
  everything; if the multi-tenant user test fails there, stop and revisit the teams decision
  rather than pushing through.
- The permission prune is destructive. It runs against pivots as well as `permissions`;
  take a dump first.
- Renaming `super_admin` → `owner` while `filament-shield.super_admin.name` still reads the
  old value in a cached config will silently create a *second* role. Phase 5 must
  `config:clear` as its first step.

## Out of scope

Branch-level permissions, API/token auth, and the `apps/server` tree.
