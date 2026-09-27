# Domain rules for the customer web

Distilled from `bltdreeg-plan/docs/domain-model.md`, features 01–06 and 09–11, ADR 0004, and
`schema/schema-notes.md` (local only). This doc covers only what affects customer-facing code.
If this doc and the plan disagree, the plan wins. Update this doc when that happens.

## Places: salon → branch → chair → barber

- A **salon** (tenant) has many **branches**. Customers see a branch as "the salon" (الصالون).
- A branch has **chairs**. Each chair has one barber a day (the daily roster). **The queue and the slots belong to the chair**,
  so in practice each barber has their own queue.
- Booking order: branch → barber (chair) → service(s) → join now **or** pick a slot.
- Every barber does every service the branch sells. **There is no per-barber service list.**
- Each **branch** owns its own services, prices and durations. The same service name at two branches is two unrelated entries.
  Always read the price/duration for **this branch**.

## Joining: join now vs slot

- **You must register to book or join**: phone + SMS OTP, **or** email + password.
- **Join now**: the customer goes straight into the chair's queue, ordered by **join time**. No QR is needed to join.
- **Slot**: the customer books a moment on a chair. **At the slot's start time they join the queue as a new joiner**, with
  join time = that moment, *behind* everyone already waiting. A slot promises a join moment, **not** a service time.
  People who booked the same slot are ordered by when they booked it.
- **One live queue per customer**, across all salons. Future slots don't count against this, but there are **at most 2 future slots**,
  never two with the same start time.
- **Slot conflict**: if a slot starts while the customer is already in another live queue, a push asks them before the start:
  *leave that queue and take the slot*, or *keep that queue and cancel the slot*. No answer → the **slot is cancelled**.
- Slot capacity is set by the admin (default 1). **A full slot can't be booked.**
- The customer picks services by choosing a pre-defined **package** (one item, fixed price/duration) **or** any combination
  of single services (durations and prices add up). **Prices are shown before booking and locked at booking.**

## Gating: when joining is allowed

- A branch is **open** or **closed** by a manual switch. **There are no weekly hours, holiday calendar or schedules.**
- Open/closed **only blocks join-now**. Slot booking only depends on the slots the admin has defined.
- A chair's queue runs only when the branch is open **and** the chair has an assigned, **checked-in** barber.
  If the barber is offline or the chair is off, nobody new can join now on that chair. Slots can still be booked.
- A **suspended** branch (unpaid invoice) disappears from search and discovery. People already inside are still served.

## In the queue

- **Order = join time**, changed only by skips and postpones.
- **People ahead** = the live position, which corrects itself when people ahead cancel, skip or postpone.
- **Expected wait** = sum of the current service durations of everyone ahead + the barber's remaining time on the current customer.
  Future slot holders don't count.
- **Skip (two strikes)**: the customer's turn comes and they're absent (not checked in, or checked in but not at the chair):
  - 1st time → moved **one place back**, and warned that another miss removes them.
  - 2nd time → **removed**, told so, no penalty, and they can **rejoin right away** as a new joiner.
- **Postpone**: the customer moves themselves back **1, 2 or 3 places**, **once per reservation**, and then the control locks.
  A postpone never removes anyone.
- **Cancel** ("leave the queue"): any time before service starts. Everyone behind moves up one.
- **Change service**: any time before the barber starts. The position doesn't change; only the expected wait changes.
- **Barber absent, or a chair disabled**: the customer is asked to **swap barber or cancel**, or is moved and then told.
  Moves happen only within the **same branch**, merged by the original join time.

## QR check-in and discount

- Each branch shows **one rotating QR code** that changes every N minutes. The customer scans it **with their own app**.
- A scan means (1) proof they are physically there and (2) **checked in**, so they no longer drift back through skips.
  **A scan never changes queue order.**
- The scan can happen any time during the visit, including at the payment desk after service.
- **Discount** = app booking made before service **and** a QR-verified scan. If the customer's phone fails, the cashier can mark the
  visit app-sourced by hand (logged against the staff member). Staff must never scan *for* the customer as proof.
- Walk-ins: no scan, no discount, no commission, no rating.
- After the visit the customer sees the **final bill** in the app: one bill per visit.

## Rating

- Only after a **completed, QR-verified** visit. Once per visit, and final once sent (no editing).
- **One form, two independent ratings**: barber stars + salon stars, each with an optional comment. Comments are shown anonymised.
- Barber ratings belong to the barber's profile **at that salon**. If the barber moves to another salon, they start from zero.
- **Ranking**: average stars, with a minimum number of ratings required to appear at all. Ties are broken by the count of QR-verified visits.

## Notifications

- **Push plus an in-app inbox** that mirrors every push. Never WhatsApp, SMS or email.
- **Turn-critical, can't be muted**: you're next, you were skipped (with the warning), you were removed, swap-or-cancel questions,
  the slot-conflict question.
- **Informational, can be muted one by one**: expected wait updated (throttled, at most one per cooldown window), branch open/closed,
  slot reminders.
- **Two-stage turn warning**: "you're next" + "your turn in about N min" (N chosen by the customer, for example 5/10/15).

## Vocabulary

Use the **Domain term** in new code and docs. The **Web code today** column is what already exists, so don't rename it casually;
see Known drift below.

| Domain term | Web code today | Arabic UI | Avoid |
|---|---|---|---|
| Branch (customer-facing "salon") | `Shop`, `shopId`, `SalonDetails` | الصالون | shop, store, location |
| Salon (tenant) | not modelled | — | vendor |
| Barber | `Barber` | الحلاق | stylist, employee |
| Chair | not modelled | الكرسي | seat, station |
| Service / Package | `Service`, `SalonOffer` (bundle) | الخدمة / الباقة | offering |
| Reservation (join-now or slot) | `Booking` | الحجز | appointment (for join-now) |
| Slot | `Slot`, `startAt` | الميعاد | appointment slot as a guaranteed time |
| Queue position / people ahead | `queueNumber`, `peopleAhead` | رقمك في الدور / قدامك | ticket |
| Expected wait | `waitMinutes`, `estimatedStartAt` | الوقت المتوقع | ETA |
| Check-in (QR scan) | not modelled | — | arrival, registration |
| Skip / Postpone / Cancel | not modelled / not modelled / cancel dialog | — | defer, reschedule |
| App-sourced visit | not modelled | — | registered, online customer |
| Walk-in | not modelled | — | guest, offline |
| Customer | `User` | — | client, guest |
| Book (the action) | — | احجز ميعاد | — |

## Known drift: the web code vs the plan

The web was built from the old `BUSINESS.md` (slot appointments + a queue number fixed at booking). **Don't copy these
patterns into new work.** Fix them when you touch the related area, and remove each item from this list once it's fixed.

| Where | Today | Plan |
|---|---|---|
| `src/lib/types/booking/booking.interface.ts` | `queueNumber` is set at booking, and `startAt` is treated as the appointment time | Position is computed live. A slot holder joins at the slot start behind the current queue, so no number can be promised at booking |
| `src/lib/types/booking/booking-status.enum.ts` | `CONFIRMED / WAITING / DONE / CANCELLED` | status `booked / queued / in_service / served / cancelled / removed` + type `join_now / slot` + absence state + `postpone_used` |
| `src/lib/types/queue/punctuality.enum.ts`, `QueueStatus.delayMinutes`, `punctuality-badge` | Salon is "on time" or "running late" | No punctuality concept. The wait comes from durations |
| `src/lib/types/offer/offer.interface.ts` `OfferKind` | `discount / bundle / loyalty` offers | One contract discount for app-sourced visits, plus packages. **No loyalty scheme** |
| `salon/[id]/__components/salon-hours` + `lib/utils/hours.utils.ts` | Weekly working hours and "open now" worked out from hours | Only the manual open/closed switch, read live |
| `(app)/book/[salonId]` flow | Barber → slot → review only | Must also offer **join now** (gated by open branch + checked-in barber) |
| `(app)/bookings/[id]/rate` | Any existing booking can be rated | Only completed, QR-verified visits, once |
| Missing | — | QR scan/check-in, postpone, skip/removal states, notification inbox and preferences, slot-conflict question, final bill view |
| `../../.cursor/rules` + `.cursor/skills` | Opening sets hours/holidays · the cashier opens · settlement "wallet, InstaPay, or transfer" · move to "remaining chairs" | The admin opens and has no hours · the cashier toggles chairs · gateway only, no transfers · same branch only. **The plan wins** |
