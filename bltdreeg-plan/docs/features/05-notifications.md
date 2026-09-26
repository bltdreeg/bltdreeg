# Feature 05 — Notifications

**Status: DONE**

## Feature brief (from project overview)

Notifications (anything affecting a customer's turn).

## Confirmed decisions (with reasons)

### One pipeline
- **Every event is a push to the phone through the app** — never WhatsApp/SMS (locked in feature 1).
- System-authored events **and** cashier/admin-authored actions (swap, cancel, emergency asks) flow through the **same push channel** — a cashier action is just an event a dashboard creates.
- **In-app notification center mirrors every push**; a missed push stays recoverable there until the queue-window ends.
- **Group delivery**: everyone affected gets relevant updates — displaced AND target customers in redistribution (feature 4), the branch at large for close/silence events, not just the acted-on customer.

### Turn-critical vs informational (muteability)
- **Turn-critical pushes are NOT muteable**: "you're next", "you were skipped / will be skipped", **"you were removed"** (second absent call), swap/cancel asks, **the slot-conflict ask** (feature 1: slot starts while you're still in another live queue — leave-queue-take-slot vs keep-queue-cancel-slot).
  - **Reason**: the queue model (skip-absent, two-strike removal, one-back drift) assumes the customer can know their turn is coming; a muted customer would be silently punished through skips they never saw.
- **Informational pushes are individually muteable**: expected-wait updated, branch open/closed, slot reminders, etc.
  - Slot reminder sits here — missing it just means the customer auto-joins late and can cancel.

### Turn warning (two-stage)
1. **"You're next"** — the reliable anchor (join order is exact; current served customer is known).
2. **"Turn in ~N min"** — minute-based, derived from expected wait (an estimate per feature 1). N is **customer-tunable** (e.g. 5/10/15) or a salon setting.
- Both are **push** (feature 1: warns even when the app is closed).
- The app **re-warns** if the customer missed the warning.

### Spam control
- **Order-changing events push immediately**: you became next, you were skipped/postponed, **postpone confirmation stating it was the only one available** (feature 1: once per reservation), admin swap/cancel moved you.
- **Estimation drift is throttled/coalesced**: at most one "expected wait updated" push per cooldown window, carrying the latest number.
- **Reason**: raw position display stays live and self-correcting (feature 1); pushes about *others* ahead of you matter only when they cross your own turn semantics, which the immediate-push tier already covers.

### Missed "you're next" → skip rule (two-strike)
- Missed turns fall into the two-strike absence handling (feature 1): the first absent call moves one position back **and pushes a warning that the next absent call removes them**; a second absent call triggers the **removal notification** (penalty-free, instant rejoin).
- **Reason**: a silenced customer cannot claim unfairness for a tier they were allowed (but not forced) to keep on — and the system never abandons an unreachable member without a terminal, notified event.

## Notification inventory (canonical set, from features 1–4)

- Turn warnings: "you're next", "turn in ~N min".
- Position changes: you moved up (someone ahead cancelled/skipped), you moved back (you were skipped, a postponer overtook you), first-skip warning (next absent call removes you), removal notice (second absent call).
- Expected-wait changes (coalesced).
- Slot events: booking confirmed, slot-start auto-join, **slot-conflict ask** (already queued at slot start — drop queue or drop slot; no answer → slot cancelled, keep current queue).
- Absence flow (feature 2/4): swap-or-cancel ask; swap/cancel confirmations.
- Chair events (feature 3/4): chair paused, chair disabled → new chair, redistribution notices.
- Branch state: open/closed now.
- Admin/cashier manual actions: manual swap/cancel, reschedule asks, stop-queue notices.

## Open questions (pending)

None.

## Cross-feature dependencies (flagged, not decided)

- Feature 1: push-only channel; skip rule consumes "you're next" misses.
- Feature 2: absence flow's swap-or-cancel is a turn-critical ask.
- Feature 3: cashier-authored notices ride the same pipeline.
- Feature 4: redistribution notifications (new chair, increased wait for target customers).
- Feature 9: QR check-in/out events may generate confirmations.

## Decision log (resolved during grilling)

| # | Question | Decision |
|---|----------|----------|
| Q1 | Notification inventory | Confirmed canonical set above |
| Q2 | Turn warning type | Two-stage: "you're next" + customer-tunable "turn in ~N min", both push, re-warn on miss |
| Q3 | Spam control | Order-changing pushes immediately; estimation drift throttled/coalesced per window |
| Q4 | Opt-out | Turn-critical not muteable; informational muteable per item |
| Q5 | Channels | Single push pipeline (system + dashboard-authored); in-app mirror center; affected-group delivery |

## Nice-to-haves logged so far

- None yet.