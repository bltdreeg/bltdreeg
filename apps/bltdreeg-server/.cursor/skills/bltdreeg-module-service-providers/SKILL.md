---
name: bltdreeg-module-service-providers
description: >-
  Create or update Modules/V1 domain service providers for bltdreeg-server
  tenant-app and central-app. Use when adding a module, moving policies/bindings
  out of AppServiceProvider, or editing bootstrap/providers.php.
---

# bltdreeg module service providers

## When to use

- Adding a new `app/Modules/V1/{Name}` domain
- Registering policies, bindings, observers, or Filament contracts for a module
- Cleaning `AppServiceProvider` of module-specific code

## Required layout

```
{tenant|central}-app/
  app/Modules/V1/{Name}/
    {Name}ServiceProvider.php
  bootstrap/providers.php   # must list every module provider
```

## Checklist

1. Create `App\Modules\V1\{Name}\{Name}ServiceProvider` extending `Illuminate\Support\ServiceProvider`.
2. Put module `Gate::policy(...)`, `$this->app->bind/singleton(...)`, `loadRoutesFrom`, etc. in that provider — **not** in `AppServiceProvider`.
3. Register the class in `bootstrap/providers.php` (both apps follow this).
4. Leave only cross-cutting app config in `AppServiceProvider` (LanguageSwitch, `Gate::before`, global Spatie registrar).
5. Shared core package concerns stay in `Bltdreeg\Core\Providers\CoreServiceProvider`.

## Examples already in tree

| App | Module provider | Owns |
|-----|-----------------|------|
| tenant | `AuthServiceProvider` | `RegistrationResponse` binding |
| tenant | `HrServiceProvider` | Employee / JobType / Shift / Attendance policies |
| tenant | `ServicesServiceProvider` | Service policies |
| tenant | `BranchesServiceProvider` | Branch policy |
| central | `Tenants|Users|Catalog|Branches|Onboarding`ServiceProvider | module entry points |

## Anti-patterns

- Adding `Gate::policy` for an HR model inside `AppServiceProvider`
- Forgetting to list a new module provider in `bootstrap/providers.php`
- One giant “ModulesServiceProvider” for all domains
- A new HTTP controller per private document type — use `PrivateStoredFile` + `PrivateFileRegistry` instead
