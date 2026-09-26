# ADR 0002: No platform-scope roles; platform powers via role_templates

## Status
Accepted

## Context
The RBAC rework (Spatie `roles`/`permissions`) requires `roles.tenant_id` to be
non-null for every tenant-scoped role. Platform admins (feature 11) also need
configurable roles ("platform roles fully configurable", domain-model.md Q8),
but a platform-scope role doesn't fit a schema built around `unique(tenant_id,
name, guard)`.

## Decision
No platform-scope `roles` rows. Platform-level role/permission catalogs live in
the existing `role_templates` table instead. `roles.tenant_id` stays `NOT NULL`.

## Consequences
- Platform admin role management is a distinct code path from tenant role
  management (different table), not a variant of the same resource.
- Avoids a nullable `tenant_id` special case rippling through every tenant-role
  query and unique index.
- If the platform ever needs true Spatie-role semantics (e.g. permission
  caching helpers, `HasRoles` trait) at the platform level, `role_templates`
  will need those capabilities added explicitly — it does not inherit them for
  free from `roles`.

## Refs
`docs/schema/schema-notes.md` (divergence 2), `docs/features/11-employee-roles-and-permissions.md`.
