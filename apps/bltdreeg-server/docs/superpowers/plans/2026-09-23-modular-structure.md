# Modular Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize `packages/core` into domain modules and finish tenant Filament modularization, matching ATS-style `Modules/V1/{Domain}` without changing behavior.

**Architecture:** Keep `Bltdreeg\Core` as the shared package; nest domain code under `src/Modules/{Domain}/`. Keep models in core. Finish tenant `app/Modules/V1/{Roles,Onboarding,Auth,Branches}` moves. Central only gets import updates.

**Tech Stack:** Laravel, Filament 5, shared Composer package `bltdreeg/core`

**Spec:** Approved design 2026-09-23 (scope 1B + shared models 2A)

## Global Constraints

- No behavior / API / schema changes — structure + namespaces only
- Do not move models out of `packages/core` into apps
- Do not introduce nwidart / module.json
- Composer autoload remains `"Bltdreeg\\Core\\": "src/"`
- Cross-cutting traits stay in `Bltdreeg\Core\Concerns`
- `CoreServiceProvider` stays in `Bltdreeg\Core\Providers`

---

## File map — `packages/core`

| Domain | Contents |
|--------|----------|
| **Tenancy** | Models: Tenant, Branch, UserTenant · Enums: TenantStatusEnum, CurrencyEnum · Support: TenantContext, TenantProvisioner, TenantSeeder, TenantSlug, BranchContext, BranchSelection, DemoData · Policies: TenantPolicy, BranchPolicy · Observers: TenantObserver · Factories: BranchFactory |
| **Auth** | Models: User, Role, Permission, RoleTemplate · Support: ShieldPermissions, RoleCatalog, RoleTemplateImporter · Policies: UserPolicy, RolePolicy |
| **Catalog** | Models: CatalogService, CatalogServiceCategory, CatalogJobType · Support: Catalog, CatalogImporter · Policies: Catalog*Policy · Factories: Catalog*Factory |
| **Services** | Models: Service, ServiceCategory · Factories: Service*Factory |
| **Hr** | Models: Shift, EmployeeAttendance, JobType · Enums: SalaryTypeEnum, AttendenceStatusEnum · Factories: Shift, EmployeeAttendance, JobType |
| **Onboarding** | Models: TenantLegalDocument, TenantOnboardingSubmission · Enums: ServiceLocationTypeEnum, LegalDocumentTypeEnum, TeamSizeEnum, SubmissionStatusEnum · Support: SalonRegistrationService, LegalTerms · Notifications: Onboarding* · Policies: TenantLegalDocumentPolicy, TenantOnboardingSubmissionPolicy · App services: tenant `OnboardingService` (submit/prefill), central `OnboardingReviewService` (approve/decline) |

Target FQCN example: `Bltdreeg\Core\Modules\Onboarding\Enums\ServiceLocationTypeEnum`

---

## File map — tenant-app Filament

| From | To |
|------|----|
| `app/Filament/Resources/Roles/*` | `app/Modules/V1/Roles/Filament/Resources/Roles/*` |
| `app/Filament/Pages/Onboarding.php`, `OnboardingStatus.php` + views/layout | `app/Modules/V1/Onboarding/...` |
| `app/Filament/Auth/*` | `app/Modules/V1/Auth/Filament/...` |
| `SelectBranch` + `BranchSwitcher` | `app/Modules/V1/Branches/...` |
| LocaleToggle (onboarding UX) | `app/Modules/V1/Onboarding/Livewire/` (or stay Livewire — prefer Onboarding module) |

---

### Task 1: Split `packages/core` into Modules/{Domain}

- [ ] Create domain directories under `packages/core/src/Modules/`
- [ ] Move each file; rewrite `namespace` + internal `use` statements
- [ ] Bulk-replace FQCNs across central-app, tenant-app, packages/core (152 PHP files)
- [ ] Update config string refs (auth model, filament-shield, permission, octane flush lists)
- [ ] `composer dump-autoload` in both apps (Docker)
- [ ] Run a smoke subset of tests

### Task 2: Tenant Roles → module

- [ ] Move Role resource tree; update namespaces to `App\Modules\V1\Roles\...`
- [ ] Update `AppPanelProvider` registration
- [ ] Run Shield/RBAC tests

### Task 3: Tenant Onboarding → module

- [ ] Move pages, views, layout, LocaleToggle as needed
- [ ] Update panel registration + view paths
- [ ] Run `SalonOnboardingTest`

### Task 4: Tenant Auth → module

- [ ] Move Login/Register/RegistrationResponse
- [ ] Update panel + AppServiceProvider bindings
- [ ] Run registration tests

### Task 5: Branches UX into Branches module

- [ ] Move SelectBranch + BranchSwitcher
- [ ] Update render hook / panel pages list
- [ ] Run BranchLoginTest

### Task 6: Verify

- [ ] Full tenant-app + central-app test suites
- [ ] Remove empty old directories
- [ ] Short note in `docs/` or README about module layout

---

**Commit policy:** commit only if the user asks.
