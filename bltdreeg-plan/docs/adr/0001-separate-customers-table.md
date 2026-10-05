# ADR 0001: Customers live in a separate table from staff

## Status
Accepted

## Context
The ERD's generic CUSTOMER vs PLATFORM_USER/EMPLOYEE split needed a concrete
mapping onto the existing `users` table, which already carries tenant staff,
platform operators, and RBAC (`tenant_user`, `is_super_admin`).

## Decision
`users` stays staff/platform-only. App-facing customers get a new, separate
`customers` table (draft migration `2026_10_02_000000_create_customers_table.php`).
No shared identity table between staff and customers.

## Consequences
- Customer auth (verified phone; phone/email + password, phone OTP, Google/Apple —
  see ADR 0005) is independent of staff auth
  (email+password only, feature 11) — no risk of RBAC/permission logic leaking
  into customer-facing code paths.
- Ratings, visits, reservations, and QR scans all key off `customers.id`, never
  `users.id`.
- No cross-surface identity: a person who is both a salon employee and an app
  customer has two unrelated records. Acceptable per the owner — out of scope
  to unify.

## Refs
`docs/schema/schema-notes.md` (divergence 1), `docs/domain-model.md`.
