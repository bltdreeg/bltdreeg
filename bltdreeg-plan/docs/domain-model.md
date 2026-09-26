# Salon Queue — Domain Model

Settings for the barbershop queue product. A glossary of the canonical terms for this project, maintained continuously as features are grilled and decided. Terms are added or sharpened the moment they crystallise.

## Language

**Salon** (tenant):
The business entity — owns the barbers and branches, sells services and packages, and is billed the monthly commission invoice. **This is the tenant.**
_Avoid_: shop, barbershop, store

**Branch**:
A physical venue of a salon where the queue runs: chairs, barbers, and the rotating QR all live here. The cashier dashboard serves one branch. A salon has many branches.
_Avoid_: store, location, site

**Customer**:
A person who joins a branch's queue via the mobile app, or walks in at the branch.
_Avoid_: user, client

**Walk-in**:
A customer registered by the branch's staff without a QR scan; gets no discount and generates no commission.
_Avoid_: guest, drop-in

**App-sourced customer**:
A customer whose visit is proven by a QR scan at a branch; unlocks the package discount and the platform commission.
_Avoid_: scan customer, digital customer

**Queue**:
The ordered list of customers waiting to be served at **one chair** (a chair is related to one barber) at one branch. Customers in a queue are ordered by arrival order. Must always stay complete and correct.
_Avoid_: waiting list, line

**Reservation**:
What a booking creates: an immediate, ordered place in the queue held by join time. Joining happens at booking — no QR needed to get into the queue. A reservation can never stall the queue — when its turn is reached while the customer is absent, the customer is skipped and pushed back. The one-active-reservation rule applies to **live queues only**; future slots are separate (see Slot) and capped at two in-flight.
_Avoid_: booking, slot

**Check-in**:
The verified physical presence of a customer at a branch, established exclusively by the QR scan (feature 9). Checking in does **not** create or reorder a queue position — it only marks presence so the customer may be served.
_Avoid_: arrival, registration

**Skip**:
What happens when a customer's turn is reached while they are not present (not checked in): the **first** absent call moves them **one position back** (re-evaluated on later rounds); the **second** absent call **removes them from the queue**. Removal is notified, carries no penalty, and the customer may rejoin **immediately as a fresh joiner** with a new join time. The queue never cycles forever on an unreachable member.
_Avoid_: pass, defer

**Postpone**:
A customer-initiated, voluntary move of their own turn back by 1, 2, or 3 positions. Available any time while in the queue before their turn is served; **once per reservation** — the postpone control locks for the rest of the reservation afterwards. Exhausting the postpone never removes anyone: a postponing customer is present and acting deliberately; if their turn is later reached while absent, the normal skip path (two-strike removal) applies, not the postpone.
_Avoid_: reschedule, delay

**Slot**:
A bookable time moment on a **chair** (each chair has its own slots; a chair is related to one barber) with a **capacity set by the admin when defining the slot (default 1)**. At slot start each booked customer **joins the chair's queue as a normal fresh joiner** with a **join time = the actual join moment** (not the booking moment), so the joiner sits behind everyone already queued; booking order only breaks ties between holders of the same slot. **Future slots do not count as the customer's active reservation** (a customer may hold **up to two in-flight future slots**, never two with the same start time). If a slot starts while the customer is still in another live queue, the system drops one — a push ask goes out ahead of slot start (leave current queue and take the slot, or keep the current queue and cancel the slot); no answer by slot start → **slot cancelled**, the customer keeps the queue they are physically waiting in. Slots do not preempt the queue and do not guarantee who serves; a full slot is no longer bookable.
_Avoid_: appointment

**User account**:
A customer's registered identity, used across all salons and branches. Required to use the app: a customer must register to see salons and to join/queue or book a slot. Registration is by phone + SMS OTP or email + password (both accepted).
_Avoid_: profile, login

**Notification**:
A push message delivered to the customer's phone through the app when something affects their turn. Delivered by push; never WhatsApp or SMS.
_Avoid_: alert, message, reminder

**Chair**:
A physical work station at a branch on which a barber serves customers.
_Avoid_: seat, station, bed

**Barber**:
A salon employee who serves customers at a chair in one of the salon's branches; has a profile with an independent rating that starts at zero for each salon they work at. Profiles are created and managed by the salon via the salon dashboard; a barber is deactivated, never deleted. All barbers perform all services the branch sells — there is **no per-barber service list** (the service catalog lives at branch level, feature 6).

**QR proof**:
A rotating QR code shown at a branch; scanning it from the customer's own device is the independent proof of a visit.
_Avoid_: ticket, scan code

**Service**:
A single hair service with a duration in minutes.
_Avoid_: offering, work

**Package**:
A bundle of services sold at a discount to app-sourced customers; the discount is split between platform commission and customer saving.

**Commission**:
The platform's share of app-sourced package revenue; collected from the salon (tenant) monthly in a single invoice.
_Avoid_: fee, cut (ambiguous)

**Invoice**:
The monthly bill the platform sends to the salon for the commission owed.
_Avoid_: bill

**Barber check-in**:
The action that starts a barber's working day and activates their chair's queue. A barber must be checked in ("online") for their queue to run and for customers to *join now*. Booking scheduled slots into their chair stays possible regardless.
_Avoid_: login, sign-in (those are account/authentication terms)

**Barber check-out**:
The action that ends a barber's working day: their chair's queue stops running, join-now is blocked, and customers in the queue / booked into remaining slots go through the absence flow.
_Avoid_: logout

**Barber absence flow**:
When a barber is absent for a day (or checks out with obligations pending), booked customers are notified and the salon offers **a barber swap** or **cancellation** of their booking. The **customer chooses** swap-or-cancel; a **salon admin may manually swap or cancel a user's booking** at any time (admin override always available). Redistribution of a live queue follows feature 4's rules.

**Rating**:
Independent customer feedback scored for a barber or a branch. A barber rating belongs to the (salon, barber) profile pair: it resets to zero only when the barber moves to a new salon (new profile); moving branches within a salon keeps the rating. Only **app customers with a QR-verified visit** can rate, once per visited service — barber and salon fields alike; walk-ins have no app account and no verified visit, so they cannot rate.

## System surfaces

- **Cashier dashboard** (branch): mobile, tablet, or desktop — runs one branch's queue, check-ins, and service records.
- **Salon dashboard** (tenant): manages the salon's branches, barbers, services, and books a view across all branches.
- **Admin dashboard** (platform): oversees all salons (tenants) and branches on the platform.

## Relationships

- A salon (tenant) has many branches and many barbers.
- A branch has many chairs. A chair is staffed by one barber at a time.
- A barber belongs to one salon at a time (via their profile for that salon), has a **default chair**, and on any given day works at the chair the salon assigns them to (feature 3 presence determines the day's assignment).
- A **queue and the slots belong to the chair**. A barber is related to that chair as staff, so per-chair queue ≈ per-barber queue. A customer is in exactly one queue at a time.
- **Booking/navigation hierarchy**: branch → chair → barber → service → customer.
- **Slot inventory hierarchy**: branch → chairs → per-chair slots (each barber's chair has its own bookable slots).
- A branch has exactly one rotating QR.
- A customer visit is either QR-proven (app-sourced) or not (walk-in).

## Invariants (confirmed so far)

- The queue must always stay complete and correct.
- A closed branch accepts no queue entries.
- A walk-in never receives a discount and never generates a commission.
- Customers are served by join order within their barber's queue, adjusted only by skips (absent → one position back) and postpones (voluntary 1–3 positions back). This join order feeds feature 4 redistribution.
- A reservation can never stall the queue: an absent customer is skipped (one back) and, on a **second** absent call, removed — the queue always moves.
- A customer is removed only after **two consecutive absent calls** (never before); removal is auto, notified, and penalty-free, and the customer may rejoin immediately.
- "People ahead" is shown as raw join-order position, refreshed live; it self-corrects when customers ahead are skipped, postpone, or cancel.
- A customer may cancel at any time before service starts; their slot vacates and everyone behind moves up one.
- A customer has exactly one active reservation at a time, across all salons and branches — **live queues only**; future slots are excluded (capped at two, no duplicated start time, see Slot).
- Expected wait = sum of the service durations of everyone currently ahead (live order) + the barber's remaining time on the current customer.
- A customer who is checked in but not ready when called (at the chair) is marked "not present" by the salon and treated exactly like the absent case: one position back, next customer called.
- A customer may change their service any time before the barber starts serving, with no effect on queue position; only expected-wait arithmetic updates.

## Slot booker flow (feature 1)

- User picks a **barber**, then chooses: **join the queue now**, or **schedule** (book a slot).
- If scheduling: the branch shows that barber's **chair slots**; the user picks one (a precise time moment).
- At slot start, the user **automatically joins the chair queue as a fresh joiner with a join time equal to the actual join moment (not the booking moment)** — sitting behind everyone already queued; no manual confirm, no preemption. Absence after auto-joining is handled by the normal skip rule (one back, then removed on a second absent call).
- Many customers may book the same slot **up to its admin-set capacity (default 1)**; within the same slot, ordered by **booking order**. A full slot is no longer bookable.
- **Active slot cap**: a customer may hold **up to two in-flight future slots at any time**, never two with the same start time. Future slots do not count against the one-active-reservation rule (live queues only).
- **Slot start while already queued**: the system never holds a customer in two queues at once. A push ask goes out **ahead of slot start** — leave the current queue and take the slot, or keep the current queue and cancel the slot. **No answer by slot start → the slot is cancelled** and the customer keeps the queue they are physically waiting in.
- Once in the queue, all live-queue rules apply (join order, skip with two-strike removal, postpone, cancel, service change).
- A slot does not preempt the live queue and does not guarantee a service time — only a join moment. Expected wait counts only customers already in the queue.
- A barber's queue only runs while the barber is checked in. Customers cannot *join now* with a barber who is not online; booking scheduled slots on their chair remains available.
- When a barber is absent for the day, their booked customers are notified and offered a barber swap or a booking cancellation.
- A chair's queue runs only while the branch is **open** AND the chair has an **assigned, checked-in barber**.
- **Join-now** is gated by the branch open/close state; **slot booking is NOT** — scheduling depends only on the chair slots the admin has defined (feature 1), independent of open/closed.
- If a chair is turned off / its barber off-line: it stops accepting **new joiners only**; the cashier handles the rest manually (notify users, swap/cancel).
- Emergency events are handled manually by the cashier (reschedule/cancel notifications, stop queues selectively keep already-checked-in customers); there is no automated closure policy.

## Emergency chair disabling (feature 4)
- **Trigger**: cashier disables a chair that is not coming back (true outage); flows for a single chair, several chairs — and collapses to the feature-2 swap/cancel notifications when no live chair remains in the branch (whole-branch closure).
- **Redistribution target**: live chairs in the **same branch only**, never other branches.
- **Merge rule**: displaced customers + target-queue members merge into one queue **ordered purely by join time** (interleave). Target customers may slip back and are notified their expected wait increased.
- **Mid-service customer** at disable time is **not redistributed** — they're being served; the cashier arranges for another barber to finish them.
- **Who gets redistributed**: checked-in + remotely waiting + slot-holders alike — everyone queued, by join time (slot-holders auto-join the target chair at their slot start, in join order).
- **Cashier holds the control**, two supported modes:
  - **Ask first**: send notification asking the customer to pick swap-or-cancel (feature 2 consent flow); the customer chooses.
  - **Swap then notify**: move the customer to the new chair immediately, notify them with the new chair; the customer may still cancel friction-free afterward (feature 1).
- **Impact preview**: before committing, the cashier sees the numeric impact (who moves where, new positions / new expected waits for displaced AND affected target customers).
- The whole flow stays manual — no automated redistribution policy.

## Notifications (feature 5)
- **One pipeline**: every event is a push to the phone through the app (never WhatsApp/SMS, per feature 1). System-authored events and cashier/admin-authored actions (swap, cancel, emergency asks) flow through the **same push channel**.
- **In-app notification center** mirrors every push; a missed push stays recoverable there until the queue-window ends.
- **Turn-critical pushes are NOT muteable**: "you're next", "you were skipped", swap/cancel asks. Everything informational (wait updated, branch open/closed, slot reminders) is individually muteable.
- **Turn warning is two-stage**: (1) "you're next" anchor, (2) minute-based "turn in ~N min" from expected wait, N customer-tunable (a.s. 5/10/15) or salon-set. The app re-warns if skipped (missed warning). Both are push.
- **Spam control**: order-changing events push immediately (you became next, you were skipped/postponed, admin swap/cancel). Estimation drift is throttled/coalesced — at most one "expected wait updated" push per cooldown window.
- **Group delivery**: everyone affected gets relevant updates — displaced AND target customers in feature 4 redistribution; the branch at large in close/silence events; not just the acted-on customer.
- **Missed "you're next" → the normal skip rule** (absent → one back), because a silenced customer cannot claim unfairness if they muted what they could have chosen to keep.

## Services and pricing (feature 6)
- **Each branch owns its own service list, prices, and durations** — no mandated salon-level catalog (each branch has its own list / price, Q1; per-branch duration, Q2).
- A service = name + price + duration(min). **Every service/package must have a duration** — wait arithmetic assumes it.
- **Packages exist as pre-defined catalog items** (salon/branch defines once; queue treats package exactly like a single service).
- **Customers may also pick any combination of single services dynamically** → duration sums, price sums (Q3: a+b — either a pre-defined package OR choose one or more services).
- **Prices are shown up-front and locked at booking** — if the branch changes the price after booking, the customer's booked price sticks (Q4).
- **Expected wait uses the current service of each queued customer, live**: packages/longer services lengthen everyone's displayed wait; a service change recomputes instantly (feature 1).
- **Discount eligibility is broad (Q7, mechanics live in feature 7/8)**: pre-defined packages, custom combos (≥2 services picked dynamically), AND individual single services can all carry a discount — nothing is excluded by type. Feature 7 decides the discount rates/split.
- **Branches are fully independent catalog-wise (Q6)**: branch A's "haircut" and branch B's "haircut" are unrelated entries (no shared seed required).

## Revenue model (feature 7)
- **Contract per salon**: salon agrees, by contract, to a discount rate for **app-sourced customers** (e.g. 20%). Worked example: walk-in pays 250 in-shop; 20% off = 200; the 50 discount is split half-and-half: customer pays 225 cash, salon owes the platform 25; salon nets 200 (= 250 − 20%).
- **Discount base = the branch's in-shop service price** (point 1).
- **Discount applies to the whole bill**, whatever was ordered — all services, packages, custom combos (point 2, consistent with feature 6 Q7).
- **The platform owns the split** between itself and the customer (e.g. 10/10 of the 20%). The salon has no say in the split; the split exists to encourage app use and the platform controls it (point 3). Salon's net is always "price − agreed discount %, regardless of split."
- **Rounding differences go to the platform** (point 4).
- The salon's owed amount (**commission**) is recorded against the salon and collected monthly → feature 8.
- Walk-ins: no discount, no commission (QR-verified app-sourced customers are the only discounted class).

## Revenue model details (feature 7, frontier resolved)
- **App-sourced = app booking AND QR-verified visit** (both true). A walk-in cannot scan the rotating QR — scanning happens from the app after booking — so every QR-verified visit is necessarily app-sourced. An app-booked visit that is never QR-verified gets **no discount** (full in-shop price). (Q1: a+b.)
- **Terms snapshot at booking**: the contract discount rate AND the platform's split are **both snapshotted when the booking is created**. A later service change (allowed until service start, feature 1) recomputes the discounted price using the **snapshotted terms**, never the current ones. (Q2: b.)
- **Split/contract changes apply to new bookings only** — in-flight bookings keep the snapshot; a renegotiated contract applies from its effective date on new bookings. (Q3: a.)
- **One visit = one bill = one commission line**: the discounted bill is the sum of all orders in the visit; the platform reconciles a single commission number per visit (feeds feature 8's monthly ledger). The customer sees the **final visit bill in the app** (the QR proves the visit, not the amount). (Q4: a.)

## Payment and monthly collection (feature 8, REVISED)
- Customer pays the salon **in cash** (cash-only messaging in app). If a salon accepts other instruments on its own, the platform neither processes nor records the instrument — only the amount (Q1, unchanged).
- **Commission ledger**: one line per QR-verified visit (from feature 7).
- **One fixed invoice day for all salons**: the invoice is issued on the **1st of each month** and covers all visits of the **previous calendar month** (Q4, replaced).
- **Minimum 3 visits**: below that, **no invoice is issued** and the amount due **rolls over** to the following month (replaces the operator-set payment window). The ≥3 threshold is checked against the **accumulated outstanding un-invoiced visits**: once the running total reaches ≥3, an invoice issues covering all carried-over months.
- **Payment gateway only**: the salon pays its invoice **from the invoice page in its dashboard** through a payment gateway. No transfers outside the system, no manual payment recording by the platform (Q6, replaced).
- **Methods**: Fawry, InstaPay, any mobile wallet (Q8).
- **No partial payments**: the invoice is paid in full or stays due; there is no "partial" state (Q9).
- **Transfer fee charged to the salon**, displayed as separate mandatory lines (the fee must look like a payment-provider fee, not a commission increase):
  - App share 480 EGP / Transfer fee 12 EGP / Total to pay 492 EGP
  - The platform receives the **full app share with no deduction** (Q10).
- **Due → Paid trigger** (one event, two technical paths): (1) **automatic** — a webhook from the gateway confirming success (no human involved); (2) **manual** — a direct query of the transaction status from the gateway. The trigger records: type (webhook / lookup), the gateway's **transaction reference**, time, amount, payment method. It **executes once per invoice** — the same transaction reference must never be recorded twice, because webhooks retry automatically. The invoice is **closed instantly** and **any suspension is lifted immediately**, with no platform intervention (Q11).
- **Escalation (one week maximum)** (Q5, replaced — earlier ad-hoc "admin decides" is gone):
  - Day 1: invoice issued, status **due**.
  - Days 2–5: grace period.
  - Day 6: **one warning** — banner in the branch dashboard + notification.
  - Day 7: last day to pay.
  - Day 8: **suspension** — dashboard locked, branch disabled on the app.
  - Suspension is **a single level**, lifted **instantly** once payment succeeds.
  - During suspension: (1) dashboard locked except the **invoice and payment page**; (2) branch **disappears from search/discovery** → no new queue entries; (3) the **existing queue is drained to the end** — reception can press "finish" for customers already inside only.
  - **Never lock the screen on customers standing in the shop** — the customer is not a party to the dispute.

## QR proof and discount (feature 9)
- **Rotating QR**: shown at the salon (screen/display), **changes every N minutes** (window is a tuning decision). Customer **scans from their own app** when arriving at the branch; scan must land inside the current window (else re-scan with the next code). Photo-replay is useless because the code rotates.
- **The scan does two things** (Q1): proves physical presence at the branch, AND flips the customer's queue state to **arrived/checked in** (they stop drifting back via skips). Queue order itself never changes (feature 1: reservations order by join time).
- **Discount eligibility** (feature 7): an **app booking made before service starts**, plus the QR-verified scan. Verification may happen **at payment time** (payment is cash-after-service anyway); the **cashier applies the discount** and can mark the visit app-sourced manually if the customer's phone fails (assisted, staff-logged). (Q3, Q4, Q7.)
- A customer who scans "arrived" but is not at the chair when called → feature 1's normal "checked in but not ready" handle → staff marks not-present → skip (Q5).

## Salon rating and ranking (feature 10)
- **Salon rating mirrors barber rating** (feature 2): 1–5 stars + optional comment, average + count displayed, comments anonymized, **served customers only** (must have a completed QR-verified visit), once per visit (Q1, Q3).
- **One post-visit form asks both rates**: barber stars + salon stars in the same screen, independent fields (Q2).
- **Ranking**: order by **rating average**, with a **minimum-ratings floor** to appear at all (e.g. ≥5), ties broken by **QR scan (verified visit) count** — the ranking factor (Q4).
- **Floor counts QR-verified app visits only** — walk-ins served do not contribute to the salon's ranking floor or scan count; only app-produced visits drive discoverability (Q5).

## Employee roles and permissions (feature 11)
- **One permission engine, two level-scoped configs**: (a) platform-level RBAC (platform admin creates users, roles, assigns permissions to roles) for the platform dashboard; (b) salon-level RBAC for branch-scoped employees (salon admin creates employees, assigns job types with permission sets).
- **Platform catalog** = a reference palette of categories, services, and job types. Branches choose from it and get **their own copy** (copy-on-take, no propagation from platform edits); a branch may also add its **own** services (Q1=a).
- **Every employee is assigned to exactly one branch** (Q5=a) — sees only that branch after login.
- **Salon admin** is salon-scoped: picks which branch's data to display.
- **Job-type catalog presets** (Q3): **Salon admin** (full salon scope, all branches), **Cashier** (single branch: queue, check-in, finish, QR-verify), **Reception** (single branch: walk-in registration + finish only, no money/queue control), **Barber** (catalog entry **only — no credentials, no permissions, no login**; chair/roster handled by features 2/3), plus **custom** job types with arbitrary permission subsets (Q3, Q4=a).
- Employee vs job type: an employee is a user; assigning a job type grants that job type's permission set.
- **Feature 2 unchanged**: the cashier still presses barber check-in/out — barbers have no account of their own.

## Employee authentication (feature 11, continued)
- **Employees log in with email + password**, created by the salon admin from the dashboard when adding the employee (no self-registration). The employee's branch scope derives from their assignment (Q6).

## Permission-gated actions (feature 11, continued)
- **Every dashboard action is gated by a permission**; a **role is a set of permissions**. Any role holding a permission can perform the action — nothing is hardcoded to a named role.
- **Catalog job types ship with default permission sets** (cashier and reception get their default permissions automatically).
- Reference partition of already-locked features onto permissions (Q7):
  - **Salon admin permission set**: daily roster / chair assignment, open/close switch, invoice & payment page, employee management, branch catalog changes.
  - **Cashier permission set**: barber check-in/out, chair toggles (feature 3), emergency chair disabling (feature 4), cashier-authored alerts (feature 5).
  - **Reception permission set**: walk-in registrations + "finish" on in-progress customers only (feature 8 suspension drain).
- **Platform roles fully configurable (Q8)**: the platform admin creates roles and assigns permissions freely (admin + finance + anything else is up to the operator); raising no preset ceiling.
- **Barber job type**: catalog entry only — no credentials, no permissions (Q3/Q4).

## Branch open state (feature 3, simplify)
- No weekly template, no holiday calendar, no branch schedules. Only **current state**: open or closed.
- Day start: the admin confirms which barber sits on which chair, then flips the branch to **open**.
- Day end: admin flips to **closed** — gates the door (new joiners stop), already-checked-in customers are served out (grace).
- Flipping open does not require ≥1 live chair (option b): a branch can open with chairs that have no barber — those chairs are simply dead.
- The cashier can toggle any chair off/on during the day (e.g. turn chair 3 off for an hour); off = no new joins on that chair, cashier handles existing bookings manually.
- **The open/closed switch controls join-now ONLY.** Scheduled-slot booking is unaffected and depends on chair slots (feature 1), not on open state.
- Emergency control (mid-day): manual, cashier-driven (notify reschedule/cancel, stop queues, keep already-checked-in).

## ADRs

See `docs/adr/` for architecture decision records (created as decisions crystallise).