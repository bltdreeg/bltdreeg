# ADR 0004: Derived values are never stored columns

## Status
Accepted

## Context
Several values are cheap to compute from other rows but expensive to keep
consistent if stored: queue position (changes on every skip/postpone/cancel of
anyone ahead), `branches.suspended`/`discoverable` (changes the instant an
invoice is paid), `slots.full` (changes on every booking/cancellation),
`visits.app_sourced` (a join between reservation and QR scan). Storing any of
these creates a second source of truth that can drift from the rows it's
derived from — exactly the class of bug the product's core invariant ("the
queue must always stay complete and correct") cannot tolerate.

## Decision
None of these are columns. Each is computed on read:
- Queue position — live projection over `reservations.join_time` for the chair.
- `branches.suspended` / `discoverable` — derived from whether the branch has
  an invoice overdue past day 8 (`SB-C10`).
- `slots.full` — holder count vs. `slots.capacity`.
- `visits.app_sourced` — `reservation exists AND qr_scan exists`.
- Salon/barber rating average & rank — aggregated over `ratings` at query time,
  including the minimum-ratings floor and scan-count tie-break.

## Consequences
- No cache-invalidation logic needed for these values — they cannot go stale
  because they are never written.
- Read paths that need them (queue board, branch discovery list, ranking page)
  must go through the shared engine/query that computes them, not raw model
  attributes — a naive `$branch->suspended` on a stale in-memory instance would
  be wrong; it must be a computed accessor or query-time join.
- Trades a small amount of read-time computation for eliminating an entire
  category of consistency bugs. Acceptable given queue/board reads are already
  live-polled (Livewire), not cached long-term.

## Refs
`docs/schema/schema-notes.md` ("Derived columns" table, decision 6),
`docs/domain-model.md` (core property: "the queue must always stay complete and correct").
