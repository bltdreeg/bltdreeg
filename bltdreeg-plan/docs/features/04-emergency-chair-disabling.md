# Feature 04 — Emergency Chair Disabling

**Status: DONE**

## Feature brief (from project overview)

Emergency chair disabling (redistribute customers preserving arrival order, with a numeric impact preview before confirming).

## Confirmed decisions (with reasons)

### Trigger and scope
- **Trigger**: the cashier disables a chair that is not coming back (true outage — not the feature-3 "off for an hour" toggle).
- **Works for a single chair or several chairs at once** — same mechanism.
- **Whole-branch closure** collapses to the **feature-2 absence flow** (swap-or-cancel notifications): with no live chair left in the branch there is no place to redistribute to.

### Redistribution target
- Displaced customers move to **live chairs in the same branch only**. Never other branches — a cross-branch move adds a commute nobody asked for and breaks per-branch queue locality.

### Merge rule (preserving arrival order)
- Displaced + target-queue members merge into **one queue ordered purely by join time** (interleave by real join time), not appended as a block.
- **Reason**: consistent with the core property (queue complete and correct by arrival order) and the already-locked "swaps preserve join time" (feature 2). Appending would punish early-displaced customers twice.
- Consequence: **target customers may slip back** and are **notified that their expected wait increased**.

### Mid-service customer
- The customer **in the chair when it's disabled is not redistributed** — they're mid-service, paying, physically seated. The cashier arranges for another barber to finish them.
- Redistribution covers **everyone still queued**.

### Who gets redistributed
- Checked-in (at the salon), waiting-at-home (joined remotely), and **slot-holders** alike — everyone queued.
- Slot-holders auto-join the **target chair** at their slot start, in join order.

### Cashier control — two supported modes
The cashier holds the control in every case:
1. **Ask first**: send notification asking the customer to choose **swap-or-cancel** (feature 2 consent) — the customer picks.
2. **Swap then notify**: move the customer to the new chair **immediately** and notify them of the new chair; the customer may still **cancel friction-free** afterward (feature 1).

### Impact preview
- **Before committing**, the cashier sees the **numeric impact**: who moves where, new positions and new expected waits for **both** the displaced customers and the affected target customers.
- **Reason**: interleave redistribution can be disruptive; the preview exists so the cashier sees the damage numbers before pulling the trigger.

### Automation stance
- The entire flow stays **manual** — no automated redistribution policy. The person on the shop floor decides.

## Open questions (pending)

None.

## Cross-feature dependencies (flagged, not decided)

- Feature 1: join order + cancel-anytime are the redistribution substrate.
- Feature 2: absence flow (swap/cancel) is the fallback when no live chair remains; barber move/check-out overlaps this flow.
- Feature 3: chair toggle-off (short) vs disable (permanent) — toggles do NOT redistribute.
- Feature 5: all the notifications (increased wait, new chair, swap-or-cancel ask, cancellations) are feature 5's job.
- Feature 6: durations drive the new-expected-wait arithmetic in the impact preview.
- Feature 9: QR-checked-in vs remote status distinguishes who is physically present at disable time.

## Decision log (resolved during grilling)

| # | Question | Decision |
|---|----------|----------|
| Q1 | Incident size / target | Same mechanism for 1..N chairs; redistribution only to live chairs in the same branch; whole-branch closure → feature-2 swap/cancel |
| Q2 | Merge into target | Interleave by real join time (not appended block); target customers notified of increased wait |
| Q3 | Mid-service customer | Not redistributed; cashier has another barber finish them |
| Q4 | Populations affected | Checked-in, waiting, and slot-holders all redistributed by join time |
| Q5 | Displaced customer agency | Cashier controls: ask-first OR swap-then-notify (customer may cancel after) |

## Nice-to-haves logged so far

- None yet.