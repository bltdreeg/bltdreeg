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

From this directory, one Compose stack starts MySQL, Redis, and both apps (FrankenPHP). Host ports are **3308** (MySQL), **6382** (Redis), **8000** (tenant), and **8011** (central) so they do not clash with `apps/server` on 8001/8002.

```bash
make up          # build and start everything
make migrate     # shared DB, from tenant-app
make seed
```

`make` is the same as `make up`. Without Make: `docker compose -f infra/local/docker-compose.yml up -d --build`, then `docker compose -f infra/local/docker-compose.yml exec -T tenant-app php artisan migrate --force` and `db:seed --force`.

| App | URL | Login |
|-----|-----|-------|
| Landlord | http://localhost:8011/login | `super@admin.dev` / `password` |
| Bloom salon | http://localhost:8000/bloom | `owner@bloom.dev` / `password` |
| Petal studio | http://localhost:8000/petal | `owner@petal.dev` / `password` |

`apps/backend` is unchanged. This tree is the simpler split of that domain.
