# Feature 09 — QR Proof and Discount

**Status: DONE**

## Feature brief (from project overview)

Rotating QR, scan from the customer's device, walk-in handling. The QR is the independent proof that the visit was app-sourced — it unlocks the discount and the commission.

## Confirmed decisions (with reasons)

### The rotating QR
- **A single rotating QR** shown at the salon (on a screen/display at the branch), **changing every N minutes** — the exact window is a tuning decision, not a per-visit code.
- **Reason**: a short rotation window makes photo-replay useless (by the time a photo travels, the code has rotated) while keeping one screen for everyone — no per-appointment code distribution friction.
- The customer **scans from their own app** when arriving. The scan must land inside the current window (expired code → scan again with the next one).
- *Note: per-visit codes were considered (user initially chose them, then reverted) — rejected in favor of timed rotation.*

### What the scan proves and does
- **Two outputs of one tap** (Q1):
  1. **Presence proof**: proves the customer is physically at the branch.
  2. **Checked in**: flips the customer's queue state to arrived/checked-in, so they **stop drifting back via skips** (feature 1's "QR confirms physical presence" made concrete).
- **Queue order never changes** — reservations order by join time (feature 1); the scan does not re-seat anyone.

### Scan timing
- Scan may happen **any time during the visit, including at payment time after service** (Q3=a) — payment is cash-after-service anyway, so verifying at the counter is the natural flow.

### Discount eligibility (with feature 7)
- **App booking must be made before service starts** (Q7=a): the purchase decision came from the app first.
- Plus a **QR-verified scan** (feature 7 Q1).
- **The cashier applies the discount** at payment and may mark the visit app-sourced **manually if the customer's phone fails** (battery/no data) — an assistant, staff-logged path (Q4).
- **Reason**: strict own-device-only would punish real app customers with dead phones; the staff trail keeps the assisted path auditable.

### Skip interplay (Q5)
- A scanned-in ("arrived") customer who isn't at the chair when called → feature 1's "checked in but not ready" → staff marks not-present → the normal skip applies (one back). Nothing about skip mechanics changes.

## Open questions (pending)

- The rotation window **N** (minutes) — tuning decision to be set by the platform.

## Cross-feature dependencies (flagged, not decided)

- Feature 1: scan = presence/checked-in; order unchanged; skip feeds handled by staff not-present.
- Feature 7: app booking + QR-verified = discount eligibility; scan triggers the commission line.
- Feature 10: QR scan count as a salon ranking factor.

## Decision log (resolved during grilling)

| # | Question | Decision |
|---|----------|----------|
| Q1 | What the scan proves | Presence + checked-in (stops skips); never re-seats |
| Q2Q6 | QR mechanics | Rotating, changes every N minutes (not per-visit); customer scans with own app |
| Q3 | Scan window | Any time during visit, incl. at payment after service |
| Q4 | Who may scan/apply | Customer's app = strict; cashier assisted mark if phone fails (staff-logged) |
| Q5 | Scanned but not at chair | Normal not-present skip rule |
| Q7 | App-sourced cutoff | App booking before service; verification at payment |

## Nice-to-haves logged so far

- None yet.