# Feature 06 — Service and Package Pricing

**Status: DONE**

## Feature brief (from project overview)

Service and package pricing, with durations in minutes which drive the expected wait.

## Confirmed decisions (with reasons)

### Catalog ownership (Q1, Q6)
- **Each branch owns its own service list, prices, and durations.** No mandated salon-level catalog and no shared seed.
- Branches are **fully independent**: branch A's "haircut" and branch B's "haircut" are unrelated catalog entries.
- Owner: **salon admin** manages the branch's catalog through the salon dashboard.

### Duration model (Q2)
- **Duration is per branch** — minutes defined per service in that branch's own catalog.
- **Every service/package must have a duration** — feature 1's exped wait arithmetic (= sum of durations ahead) assumes it.
- No per-barber durations (barber speed variability is over-precision that would leak into every queue/slot computation and be gameable).

### Packaging (Q3)
- **Two ways to book**:
  1. **Pre-defined packages** — the salon/branch defines a combo once (e.g. "haircut + beard = 60 min, 120 EGP"); the queue treats it exactly like a single service (one entry, fixed duration, one price).
  2. **Dynamic combination** — the customer picks one or more single services; **duration sums, price sums**.
- Both coexist: a customer either picks a pre-defined package *or* assembles their own set of singles.

### Pricing (Q4)
- **Prices are shown up-front in the app** and **locked at booking**: if the branch later changes the price, the customer's booked price sticks.
- **Reason**: customers deciding where to spend should see the price, and locking prevents "prices went up" disputes at the cash counter.

### Expected wait interaction (Q5)
- Wait arithmetic uses the **current** service of each queued customer, live.
- Packages / longer services ahead lengthen the displayed wait of everyone below.
- A customer **changing service** (allowed until the barber starts, feature 1) recomputes the wait instantly.

### Discount eligibility (Q7, mechanics deferred)
- **Everything can carry a discount**: pre-defined packages, custom combos, and single services.
- Nothing is excluded by type — the actual discount rates and split live in **feature 7**.

## Open questions (pending)

None (discount mechanics deferred to feature 7).

## Cross-feature dependencies (flagged, not decided)

- Feature 1: expected wait = sum of current durations ahead (this feature supplies durations).
- Feature 2: all barbers perform all branch services (no per-barber list — confirmed there).
- Feature 7: discount application on packages + combos + singles; rates and split decided there.

## Decision log (resolved during grilling)

| # | Question | Decision |
|---|----------|----------|
| Q1/Q6 | Catalog ownership | Each branch owns its own list, prices, durations; fully independent between branches |
| Q2 | Duration model | Per-branch minutes; mandatory on every service/package |
| Q3 | Combining | Pre-defined packages (single queueable item) AND dynamic multi-service (durations/prices sum) |
| Q4 | Pricing presentation | Shown up-front; locked at booking time |
| Q5 | Wait arithmetic | Uses each queued customer's current service, live |
| Q7 | Discount scope | Packages + combos + singles all eligible (rates/split in feature 7) |

## Nice-to-haves logged so far

- None yet.