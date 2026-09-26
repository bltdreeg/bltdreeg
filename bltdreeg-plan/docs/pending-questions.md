# Pending Questions

Questions the customer could not answer during grilling sessions. Each entry records the feature it belongs to, the exact question, why it matters (or what it blocks), and the options discussed.

_Entries are only added when the customer asks for them._

_No unresolved feature-grilling questions right now. Feature 1 is done; the slot-flow answers it once carried now live in `docs/features/01-customer-booking-and-live-queue.md`._

## Open implementation questions (not feature-grilling, tracked here for visibility)

- **`user_services` pivot table** — implies a per-barber service list, which
  feature 2 explicitly removed (no per-barber skill list; all barbers perform
  all services the branch sells). Confirm the table is unused/dead and decide
  drop vs. keep-as-history before or during `SB-A3` (applying the continuation
  schema). See `plan/shared-backend.md` → `SB-D4`.
- **QR onboarding landing screen (TD-D1)** — after a first-time customer scans
  a branch's QR and a new `customers` row is created, does the flow auto-skip
  straight into joining the queue, or land them on a profile-completion screen
  first? Blocks `plan/tenant-dashboard.md` → `TD-D1`.