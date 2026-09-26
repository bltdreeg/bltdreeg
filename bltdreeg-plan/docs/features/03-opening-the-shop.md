# Feature 03 — Opening the Shop

**Status: DONE**

## Feature brief (from project overview)

Working hours, holidays, who is present today and on which chair; closed salon accepts no queue entries.

## Confirmed decisions (with reasons)

### The model is intentionally dumb
- **No weekly working-hours template, no holiday calendar, no branch schedules.** Only a current open/closed switch grown by hand each day.
- **Reason**: the shop already decides its own rhythm on the ground; precomputed schedules are machinery that would go stale the moment a barber is sick, a chair breaks, or a holiday lands differently.

### The daily flow
- **Day start**: the admin confirms which barber sits on which chair, then flips the branch to **open**.
- **Day end**: the admin flips to **closed**.
- Re-confirming the roster is **per branch** (each branch opens and closes on its own switch).

### What "open" means
- A **chair's queue runs** only while the branch is **open** AND that chair has an **assigned, checked-in barber**.
- Flipping open does **not** require ≥1 live chair — a branch can open with dead chairs (chairs with no assigned/checked-in barber). Choosing to open is the admin's call.
- **The open/closed switch gates join-now ONLY.** Slot booking is entirely independent: scheduling depends on the chair slots the admin defined (feature 1), never on open state.

### Chair control (cashier)
- The cashier can toggle any chair **off/on during the day** (e.g. turn chair 3 off for an hour, recovery from a late barber).
- A chair toggled off **stops accepting new joiners** on that chair; slot bookings keep their feature-1 behavior.
- Existing bookings/customers on a toggled-off chair are handled **manually by the cashier** (notify users, swap, cancel).

### Mid-day / emergency events — all cashier-driven, nothing automated
- The cashier handles emergencies by hand: **notify** booked users to reschedule or cancel; **stop queues** as needed; **keep already-checked-in customers served**; notify the rest manually.
- **Reason**: whatever automated policy we invented (auto-redistribute, auto-cancel windows) would guess the shop's real situation wrong. The person on the shop floor decides.

### Day-end close = grace, not flush
- On "closed", the door closes to **new joiners**; **already-checked-in customers are served out** (a seated customer finishing at close is normal).
- No feature-4 redistribution flush of seated/waiting customers at close.

## Open questions (pending)

None.

## Cross-feature dependencies (flagged, not decided)

- Feature 1: join-now gated by open state + a live chair; slot booking independent of open state (booked slot horizon unchanged).
- Feature 2: chair queue runs only when branch open AND chair has assigned checked-in barber; absent/offline barber = no new joins on that chair.
- Feature 4: emergency chair disable / redistribution fires only when the cashier decides a chair isn't coming back (true outage), not on close or short toggles.

## Decision log (resolved during grilling)

| # | Question | Decision |
|---|----------|----------|
| Q1 | What gates a chair's queue | Branch open AND assigned, checked-in barber; cashier can toggle chairs off/on during the day |
| Q2 | Must open require ≥1 live chair | No — open freely; chairs without a barber are dead chairs |
| Q3 | Mid-day emergencies | Cashier-driven manual control: notify reschedule/cancel, stop queues, keep checked-in customers |
| Q4/Q5 | Does open/closed affect scheduling | No — it gates join-now only; slot booking follows chair slots (feature 1) |
| Q6 | Chair toggled off | No new joiners; cashier handles existing bookings manually |
| Q7 | Day-end close | Grace: block new joiners, serve out checked-in customers |

## Nice-to-haves logged so far

- None yet.