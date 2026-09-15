# bltdreeg server

Multi-tenant CRM on Filament + [venturedrake/laravel-crm](https://laravelcrm.com).
Shared MySQL database; each tenant is a `teams` row (`team_id` scoping).

## Quick start

```bash
cd bltdreeg/apps/server
make start
```

| Panel | URL | Login |
|-------|-----|-------|
| Landlord | http://admin.localhost:8085 | `admin@bltdreeg.test` / `password` |
| Tenant (Acme) | http://app.localhost:8085/acme | `owner@acme.test` / `password` |

## Tenancy

1. **CRM data** — laravel-crm `BelongsToTeamsScope` filters by the user's `currentTeam`.
2. **Panel access** — Filament `HasTenants`; non-members get 404.
3. **BindCrmTenant** — keeps `currentTeam` + Spatie permission team id aligned with the Filament tenant.
4. **TenantSafeCrmPlugin** — strips the plugin's unscoped Users/Roles/Invites/CrmTeams resources; Settings owns those surfaces.

## Layout

```
apps/server/
├── central-app/     # landlord Filament (tenants)
├── tenant-app/      # tenant Filament + CRM
├── packages/core/   # shared User, Team, migrations
├── infra/local/     # Docker Compose, PHP image, MySQL init
└── Makefile
```

## Make targets

- `make start` — up, install, assets, migrate, seed
- `make test` — PHPUnit/Pest in both apps (uses `bltdreeg_central_test` / `bltdreeg_test`)
- `make fresh` — migrate:fresh + seed
