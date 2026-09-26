# Feature 01 — Customer Booking and Live Queue

**Status: DONE**

## Feature brief (from project overview)

Customers join a live queue from the mobile app and see their position, how many are ahead, and the expected wait. In-app notifications only, no WhatsApp. **Scope grew during grilling: an advance booked-slot system coexists with the live queue.**

## Confirmed decisions (with reasons)

### Identity and registration
- **Registration is mandatory.** A customer must register to see salons and to book. The rest of the app is gated behind an account.
- **Registration methods**: phone + SMS OTP **or** email + password — both accepted. (Customer's note: "both i mean user registration" — these are account-registration methods, not the queue-join mechanism.)
- **Joining happens at booking**: the moment you book (join now or slot), you are in the queue ordered by join time — no QR is involved in joining. If your turn comes and you're not at the salon, the normal skip rule applies.
- **Reason**: a stable ID prevents queue-gaming (one person parking multiple spots), and phone is the natural identity in Egypt.

### Notifications
- **Push notifications to the phone** through the app; never WhatsApp or SMS. Not "message center only in the app".
- **Reason**: the live queue must warn a customer *before* their turn even when the app is closed. Content of alerts is feature 5.

### Queue structure
- **The queue and the slots belong to the chair**; the chair is related to a barber. So a queue is per chair (one chair ↔ one barber), effectively per-barber, but the queue's owner is the chair, not the barber object.
- **Reason**: matches "position / people ahead" having a per-chair meaning; customers wait for a chair's barber, and feature 2 keeps barber ratings salon-independent. *Flagged: makes feature 4 (emergency chair disabling) redistribute per-chair queue customers in join order — to resolve in feature 4.*

### Booking flow
- **Join = barber + service** (durations from feature 6 drive expected wait).
- **Service changeable any time before the barber starts serving**, with no position change; only expected-wait arithmetic updates.
- **One active reservation at a time — live queues only**: a customer can hold one **live queue** reservation across all salons; joining a second queue requires leaving the first. **Future slots do not count as the active reservation** (see Scheduled slots: capped at two in-flight, no same-start-time duplicates). A customer is never in two live queues at once.
- **Reason**: a reservation is about a place in line, not a locked service; changing the service must never re-seat you.

### Live queue semantics
- **Reservation model**: joining from home (book now) immediately enters the queue, ordered by **join time**. The QR (feature 9) has **one** job in this flow: confirming physical presence ("checked in") — it is not the join mechanism and does not change queue order. Only checked-in customers can be served. Customers see the queue, their turn, and time remaining.
- **Ordering**: by join time; adjusted only by skips and postpones. This join order also feeds feature 4 redistribution.
- **Skip (absent when their turn is reached)**: **first** absent call → moved **one position back**, re-evaluated each round, the person behind goes next, and the **first-skip notification warns that a second absent call removes them**. **Second** absent call → **removed from the queue** (notified, no penalty, may rejoin immediately as a fresh joiner with a new join time). Automatic (the app skips).
- **Skip (checked in but not ready at the chair)**: salon staff marks "not present" → identical two-strike handling (first: one position back, next called; second: removed). The barber never waits idle for a reachable customer.
- **Postpone (customer-initiated)**: move own turn back by 1, 2, or 3 positions, any time while in the queue before the turn is served; **once per reservation** — the postpone control locks afterwards for the rest of the reservation (the customer waits their turn or cancels); if fewer people behind than the chosen N, they go to the back (swap semantics: the N behind move up one each). Exhausting the postpone never removes anyone — removal comes only from the absence path (two-strike skip), never from the postpone.
- **Two-strike skip limit (replaces "never auto-dropped")**: a skipped customer is **not** kept indefinitely. First absent call → one back + a warning that the second absent call removes them; **second absent call → removed** from the queue, notified, no penalty, may rejoin immediately as a fresh joiner with a new join time. This is the stop condition: the chair never cycles forever on an unreachable member.
- **Cancellation**: one "leave queue" action any time before service starts; slot vacates, people behind move up one. No penalty.
- **Reason for "two-strike" + skip + postpone combination**: the queue can never stall (reservation can't block — a first skip moves them back and the chair serves the next), and the two-strike limit gives the termination guarantee a live chair needs. The first skip is a fair warning (keeps your spot once); the second is a clean, penalty-free exit. "Complete and correct" is preserved by the explicit exits: cancel, served, close, staff removal, or two absent calls — with always-open rejoin restoring the customer at any time.

### Display and wait
- **"People ahead" = raw join-order position**, refreshed live; it self-corrects as people ahead skip, postpone, or cancel.
- **Expected wait = sum of the service durations of everyone currently ahead (live order) + the barber's remaining time on the current customer** (feature 6 supplies durations).

### Scheduled slots — booking vs scheduling (feature 1 scope, DECIDED)
- User picks a **barber**, then chooses either **join the queue now** or **schedule**.
- Slots live on the **chair** (each barber's chair has its own bookable slots). Choosing *schedule* shows that barber's chair slots; the user picks one (a precise time moment).
- **Slot join time = the moment of actual join, not the booking moment.** A slot booked yesterday for 10:00 enters the queue at 10:00 with a 10:00 join time, sitting **behind everyone already queued**. Booking order only breaks ties between holders of the **same** slot.
- **Active-slot cap (future slots don't touch the one-active-reservation rule)**: a customer may hold **up to two active future slots at any time**, and **never two slots with the same start time**. The one-active-reservation rule governs **live queues only**; slot holders book freely within that cap.
- **Slot start while already in a live queue**: the system must drop one — it **never holds a customer in two queues at once**. A push goes out **ahead of slot start** asking: *leave the current queue and take the slot*, or *keep the current queue and cancel the slot*. **No answer by slot start → the slot is cancelled** and the customer keeps the queue they are physically waiting in.
- **At slot start (no conflict) the user automatically joins the chair queue as a normal fresh joiner** — no manual confirm, no preemption. Absence after auto-joining is handled by the normal skip rule (one back, then removed on the second absent call).
- **Slot capacity is admin-set** when defining chair slots: **default 1**; the admin may raise it (fast chair, quiet period). **Once a slot is full it is no longer bookable**; within a slot, holders keep **booking order** as today (was: unlimited). A capacity of 1 still does not make a slot an appointment — the holder joins at slot start **behind the live queue**.
- **Slot-definition screen warns when slots are spaced closer than the branch's typical service duration** (they would accumulate faster than the chair can serve them).
- **Cancellation** = same as queue cancel (friction-free anytime).
- **Booking horizon** = any day for which the admin has defined chair slots (feature 3: NOT tied to a branch open/closed schedule — open/close gates *join-now* only, never slot booking).
- A slot guarantees a join moment, **not** a service time or a specific barber — the customer already picked the barber at booking.

## Open questions (pending)

None open — all round-7 through round-10 questions answered.

## Decision log (resolved during grilling)

| # | Question | Decision |
|---|----------|----------|
| R3 | Join shape | From-home reservation by join time; list entry is immediate at booking — QR only confirms presence |
| R3 | Registration | Mandatory to use the app |
| R4 | Skip destination | First absent call → one position back, re-evaluated each round |
| R4 | Postpone rules | Once per reservation; 1–3 positions; control locks afterwards |
| R4 | Zombie cleanup | Second absent call → removed; notified, penalty-free, instant rejoin |
| R5 | People-ahead display | Raw join-order position, live |
| R5 | Cancellation | Anytime before service; slot vacates |
| R5 | One queue at a time | Across live queues only; future slots excluded |
| R5 | Expected wait | Sum of durations ahead + barber's remaining time; only queued customers count |
| R6 | Present but not ready | Staff marks "not present" → same skip |
| R6 | Service change | Any time before barber starts; position unaffected |
| R6 | Live vs slots | Both coexist |
| R7 | Slot capacity | Admin-set per slot while defining chair slots; default 1; full slot no longer bookable |
| R7 | Active slot cap | Up to 2 in-flight future slots per customer; no two with the same start time |
| R7 | Slot granularity | Slot length = admin-defined chair slot (start moment), not service duration |
| R7 | Slot precedence | None — slot start = auto join as normal fresh joiner |
| R7 | Slot cancel/no-show | Same as queue cancel |
| R7 | Booking horizon | Any day with admin-defined chair slots; open/closed gates only join-now |
| R7 | Multi-tenancy | Salon = tenant; branch = venue; salon/admin/branch dashboards |
| R8 | Slot per barber | Slots per chair; barber ↔ chair |
| R8 | Join at slot start | Automatic fresh join (confirmed); join time = actual join moment, not booking |
| R8 | No preemption | Confirmed; expected wait excludes future slot-holders |
| R8 | Same-window order | Booking order within the same slot |
| R8 | Slot conflict at start | Ask ahead of slot start (leave-queue-take-slot vs keep-queue-cancel-slot); no answer → slot cancelled, keep current queue |
| R9 | Queue model | Stays per-barber (per chair) |
| R9 | Slot capacity | Admin-set cap per slot (default 1), not unlimited |

## Cross-feature dependencies (flagged, not decided)

- Feature 3 (opening): closed salon accepts no **join-now** entries; it does NOT affect slot booking. Absent barber's chair blocks new joins.
- Feature 4: redistribution preserves this feature's join order.
- Feature 9: QR scan is the **presence/proof-of-visit confirmation** (not the join mechanism); walk-in handling lives there.
- Feature 6: service durations drive both expected wait and slot lengths.

## Nice-to-haves logged so far

- None yet.