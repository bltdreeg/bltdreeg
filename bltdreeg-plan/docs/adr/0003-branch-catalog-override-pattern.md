# ADR 0003: Per-branch catalog override via branch_services / branch_packages

## Status
Accepted

## Context
Feature 6 requires each branch to own its own service list, prices, and
durations independently (no mandated salon-level catalog, no shared seed
required between branches of the same salon). Feature 11 separately requires a
platform catalog that branches copy-on-take (no propagation from platform
edits). Both need to coexist without duplicating the full service definition
per branch when a branch doesn't diverge from its salon template.

## Decision
Keep `services` / `packages` as salon-scoped templates (populated via
copy-on-take from the platform catalog). Add `branch_services` /
`branch_packages` as pivot/override rows with nullable `price`/`duration` that
coalesce to the parent row when null. A branch that never overrides a service
incurs only the pivot row, not a duplicated template.

## Consequences
- Effective price/duration must always be read through a resolver
  (`BranchCatalog::effective(service|package, branch)` — `SB-B2`), never off
  `services`/`packages` directly, or branch overrides silently get ignored.
- Wait-time arithmetic (`SB-C3`) and discount base (feature 7) both depend on
  this resolver being the single source of truth for "the price/duration that
  applies right now at this branch."
- Package branching follows the identical pattern (`package_service` stays
  salon-level; `branch_packages` overrides), so there is exactly one override
  mechanism to reason about, not two.

## Refs
`docs/schema/schema-notes.md` (divergence 3–4), `docs/features/06-service-and-package-pricing.md`,
`docs/features/11-employee-roles-and-permissions.md`.
