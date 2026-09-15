# Filament Multi-Tenant CRM — Design

**Date:** 2026-09-14
**Status:** Approved design, pending spec review
**Target:** `bltdreeg/apps/server`

## Goal

A Laravel backend where a landlord app manages tenants and each tenant gets a
Filament-based CRM powered by `venturedrake/laravel-crm`. Folder structure and
Docker workflow mirror `ATS-Backend`, but multi-tenancy is **shared-database,
tenant-id scoped** — not database-per-tenant.

## Tenancy Model

A tenant is a row in `teams`. Its primary key is the tenant id, and it is the
same id `laravel-crm` writes to the `team_id` column on every `crm_*` table.
There is one database. No `stancl/tenancy`, no database switching, no
per-tenant connections.

Three layers enforce isolation, and all three must hold:

1. **CRM data** — `LARAVEL_CRM_TEAMS=true` activates the package's
   `BelongsToTeams` trait and `BelongsToTeamsScope` global scope. Every CRM
   model is filtered by `auth()->user()->currentTeam` and stamped with
   `team_id` on create.
2. **Panel access** — the Filament tenant panel uses `Team` as its tenant
   model. `User::canAccessTenant()` rejects any team the user is not a member
   of, which closes URL-guessing.
3. **Request binding** — panel middleware sets `current_team_id` on the
   authenticated user to the Filament tenant for the duration of the request,
   so layers 1 and 2 always agree on which tenant is active.

`laravel-crm` does not require Jetstream or Spark despite what its Teams page
says. It resolves the host team through the user's `allTeams()` /
`ownedTeams()` / `currentTeam` surfaces, which this project implements
directly on its own `User` and `Team` models. Spatie Permission is required
with `teams` support enabled, which the CRM installer already pulls in.

## Known Risk: Filament CRM Plugin Is Not Tenant-Aware

`venturedrake/laravel-crm-filament` states plainly that it does not support
`LARAVEL_CRM_TEAMS=true`, and that there is not one `Filament::getTenant()`
call in the package. Its installer refuses without `--allow-teams`.

The exposure is **not** the CRM records. Those inherit
`BelongsToTeamsScope` from the core models the plugin's resources wrap, so
leads, deals, people, organisations, tasks and products stay scoped. The
exposure is everything the plugin touches that is not a CRM model:

- the host `users` table (user resource, CSV import, invitations)
- Spatie `roles` and `permissions` queries
- the CRM teams list

The design's response is to not register those surfaces:

- The plugin is installed with `--allow-teams` and configured with
  `->allowUnsupportedTenancy()`, so running it is a recorded decision in the
  panel provider rather than a suppressed warning.
- The plugin's identity resources are excluded from the tenant panel. The
  panel provides its own tenant-scoped `UserResource` reading `team_user`.
- The CRM teams module stays off (`->withTeams()` not called), so
  `CrmTeamResource` never registers.
- `LARAVEL_CRM_USER_INTERFACE=false`. The Livewire `/crm` UI does not mount;
  the Filament panel is the only UI.

This is a standing maintenance obligation: every upgrade of
`laravel-crm-filament` must be re-checked for newly registered identity
resources. The isolation test suite below is what makes that check cheap.

## Repository Layout

```
bltdreeg/apps/server/
├── packages/core/          # bltdreeg/core — shared identity + tenancy domain
│   ├── src/Models/{User,Team}.php
│   ├── src/Concerns/HasTeams.php
│   ├── src/Providers/CoreServiceProvider.php
│   └── database/migrations/
├── central-app/            # landlord Filament panel
│   └── app/Modules/V1/{Tenants,Users}/
├── tenant-app/             # tenant Filament panel + CRM
│   └── app/Modules/V1/{Crm,Settings}/
├── infra/local/
│   ├── docker-compose.yml
│   └── traefik/dynamic.yml
├── Makefile
└── README.md
```

`packages/core` exists because both apps read and write the same `users`,
`teams` and `team_user` tables. Duplicating the models in two apps would let
the tenancy contract drift between them, and a drifted `canAccessTenant()` is
a data leak. Both apps require it through a Composer path repository.

Within each app, `app/Modules/V1/<Feature>/` follows ATS-Backend's module
shape (`Http/`, `Models/`, `Services/`, `routes/`, `Database/migrations/`).
CRM data lives in the package's own `crm_*` tables and gets no module.

## Applications

**central-app** — landlord, `http://admin.localhost`, Filament panel `admin`,
no tenancy. Resources: Tenants (create a team, attach an owner), Users. Owns
the identity migrations via `packages/core`.

**tenant-app** — `http://app.localhost/app/{tenant}`, Filament panel `app`
with `->tenant(Team::class)`. Hosts the CRM plugin and the tenant-scoped user
resource. Path-based tenancy is chosen over subdomains for v1 because it needs
no wildcard DNS or per-tenant Traefik rules; Filament's `tenantDomain()` is
the documented upgrade path.

## Data Flow

A user signs in to the tenant app and lands on the tenant chooser, which lists
only teams from `team_user`. Choosing one enters `/app/{tenant}`, where the
middleware verifies membership through `canAccessTenant()` and sets
`current_team_id`. From that point every CRM query the panel issues carries
`where team_id = <tenant>` from the global scope, and every insert is stamped
with the same id.

Switching tenants re-runs the middleware and flushes the CRM settings cache,
which the package partitions per team.

## Infrastructure

Docker only, mirroring ATS-Backend's `infra/local` + `Makefile` workflow.
Services: `traefik` (routes `admin.localhost` → central, `app.localhost` →
tenant), `mysql` (8.x, one shared database), `redis` (cache, queue, session),
`central`, `tenant`, and a `tools` profile running `composer-central` /
`composer-tenant`.

MySQL rather than ATS-Backend's Postgres: `laravel-crm`'s stated requirements
are MySQL 5.7+ / MariaDB 10.2.7+, and its published migrations and backfills
are not validated against Postgres.

Migration order matters and is encoded in `make migrate`: central first (it
creates `users`, `teams`, `team_user`), then tenant (the CRM installer's
migrations reference them).

## Testing

Pest feature tests in `tenant-app`, run by `make test`. These are the gate on
the plugin risk above, so they are written as part of the tenancy task rather
than after it:

- a member of team A gets 403 on `/app/{team-B}`
- a lead created under team A is absent from a team B query
- creating a lead while acting as team A stamps `team_id = A`
- the tenant chooser lists only the signed-in user's teams
- the tenant user resource does not return users outside the current team

## Scope

**In:** the two apps, the shared core package, Docker + Makefile, Filament
panels, CRM install with teams on, tenant-scoped user resource, seeds for a
landlord admin and two demo tenants, the isolation tests.

**Out:** billing and subscriptions, Passport/API modules, subdomain tenancy,
CRM feature customisation, production infra (`infra/prod`), queue workers
beyond the default container.
