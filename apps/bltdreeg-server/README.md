# bltdreeg-server

Two Laravel + Filament apps, one shared database, `tenant_id`-scoped tenancy.

```
apps/bltdreeg-server/
├── packages/core/   # User, Tenant, tenant_user, BelongsToTenant
├── central-app/     # landlord panel — create tenants
├── tenant-app/      # salon panel — services, categories, HR
└── infra/local/     # Docker Compose: MySQL, Redis, both apps
```

## Tenancy (single DB, `tenant_id`)

This is **not** [stancl/tenancy](https://tenancyforlaravel.com/). That package is strongest for database-per-tenant and domain switching inside one app. Here we already have two apps and one database, so:

1. **Filament tenancy** on the tenant panel (`->tenant(Tenant::class)`).
2. **`BelongsToTenant`** global scope on salon models (`tenant_id`).
3. **`TenantContext`** is a *scoped* container binding so Laravel Octane cannot leak the current tenant across requests.
4. Spatie permission `teams` uses `tenant_id`.

## Catalog vs tenant data

Central admins own the catalog: service categories, service types, job types, and role templates.

When a tenant is created, predefined roles are copied as system roles. Tenants can add their own roles. They import catalog services and categories, then set price and duration. Catalog job types show up in HR; tenants can also create their own.

## Octane

Both apps include `laravel/octane` (`config/octane.php`). `TenantContext` is flushed between requests so the current tenant cannot leak on a long-lived worker.

- Linux/macOS: `php artisan octane:start --server=frankenphp`
- Windows: `php artisan octane:start --server=roadrunner` (FrankenPHP has no Windows binary)

## Setup

From this directory, one Compose stack starts MySQL, Redis, and both apps (FrankenPHP). Host ports are **3308** (MySQL), **6382** (Redis), **8010** (tenant), and **8011** (central) so they do not clash with `apps/server` on 8001/8002.

```bash
make start         # build frontend assets, start stack, migrate (same as make up)
make assets        # npm install + vite build for central-app and tenant-app
make tenant-assets # rebuild tenant-app Vite theme/CSS and reload Octane
make migrate       # run pending migrations
make migrate-fresh # drop all tables and re-run migrations
make seed
```

### Local Dev Runner (Without Docker)

To run both apps and the queue worker with a single command from `apps/bltdreeg-server`:

```bash
npm run dev        # or .\dev.bat, .\dev.ps1, or make dev
```

This concurrently starts:
- **Central App (Landlord & Customer Auth API):** `http://127.0.0.1:8022`
- **Tenant App (Salon Panel):** `http://127.0.0.1:8011`
- **Queue Worker:** `php artisan queue:listen --queue=otp,default` (processes OTP deliveries asynchronously)

Pressing `Ctrl+C` cleanly shuts down all 3 processes.

`make` / `make start` / `make up` are the same. After editing `tenant-app/resources/css/filament/app/theme.css`, run `make tenant-assets` so the new hashed CSS is built and Octane picks it up. Without Make: build assets with `npm --prefix central-app install && npm --prefix central-app run build` (and the same for `tenant-app`), then `docker compose -f infra/local/docker-compose.yml up -d --build --wait`, then `docker compose -f infra/local/docker-compose.yml exec -T tenant-app php artisan migrate --force` and `db:seed --force`.

## Module layout

Domain code follows ATS-style modules:

- **`packages/core/src/Modules/{Tenancy,Auth,Catalog,Services,Hr,Onboarding}/`** — shared models, enums, policies, support (`Bltdreeg\Core\Modules\…`). Cross-cutting traits stay in `Concerns/`; `CoreServiceProvider` stays in `Providers/`.
- **`{central,tenant}-app/app/Modules/V1/{Domain}/`** — Filament UI (and tenant Livewire) per domain.
- **Each V1 module owns `{Domain}ServiceProvider`**, registered in that app’s `bootstrap/providers.php`. Module policies/bindings live there — not in `AppServiceProvider`.

See `docs/superpowers/plans/2026-09-23-modular-structure.md`, `.cursor/rules/module-service-providers.mdc`, and `.cursor/skills/bltdreeg-module-service-providers/SKILL.md`.

| App | URL | Login |
|-----|-----|-------|
| Landlord | http://localhost:8011/login | `super@admin.dev` / `password` |
| Bloom salon | http://localhost:8010/bloom | `owner@bloom.dev` / `password` |
| Petal studio | http://localhost:8010/petal | `owner@petal.dev` / `password` |

`apps/backend` is unchanged. This tree is the simpler split of that domain.
