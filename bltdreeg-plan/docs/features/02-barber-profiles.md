# Feature 02 — Barber Profiles

**Status: DONE**

## Feature brief (from project overview)

Barber profiles, owned by the salon, seated on a chair, independent rating; a barber who moves salons gets a new profile with rating from zero.

## Confirmed decisions (with reasons)

### Ownership and lifecycle
- **The salon (via the salon dashboard) creates and manages its own barbers.** The platform admin does not manage barbers — only tenants and branches.
- A barber is **deactivated, never deleted**: history, ratings, and past obligations must survive for accounting and continuity.
- If a barber leaves / is deactivated, the chair's pending work is handled by the absence flow + feature 4 redistribution.

### Profile contents
- Name, photo, active status, default chair, rating.
- **No per-barber service list.** All barbers perform all the services the branch sells (the catalog lives at branch level, feature 6).
- Reason: booking is barber + service (feature 1), but nothing restricts a barber's skill set at this stage — everyone does every branch service.

### Chairs
- A barber has a **default chair**; the queue and the slots belong to the **chair** (feature 1 decision).
- **The day's assignment** ("who is present on which chair") is feature 3's responsibility: on any given day the salon seats the barber on the chair it assigns, and that chair's queue/slots carry their customers that day.
- Reason: predictability from a stable default; flexibility via daily rostering without rebuilding queues.

### Rating
- Rating belongs to the **(salon, barber) profile pair**.
- **Scale**: 1–5 stars + optional short comment, shown as average + count (comments anonymized).
- **One rating per served visit**, final once submitted (no editing — editing invites gaming).
- **Only app customers with a QR-verified visit** can rate — barber and salon fields alike (shared post-visit form). **Walk-ins cannot rate**: no app account to receive/attach the rating identity to, and feature 10 gates the whole rating surface on verified app visits. The sampling bias this would have guarded against is accepted deliberately — an unverified rating path would weaken the QR/scan incentive that makes the model work.
- **Reset on salon move**: new salon → new profile → rating **from zero**, **no trace/history** (indistinguishable from a fresh hire). The old salon keeps the full archived profile; **no cross-salon identity link** exists (clean tenant isolation).
- Moving **branches within the same salon**: same profile, rating continues.

### Barber presence (check-in/check-out)
- **Check-in/check-out is performed by the salon cashier** from the branch dashboard — barbers are a dashboard-managed resource, no barber app.
- A barber's queue **only runs while the barber is checked in**.
- **Join-now** is blocked for an offline barber; **scheduled slot bookings remain bookable** regardless.
- When a slot's booker auto-joins while the barber is offline, they **still land in the chair's queue** in join order; the queue simply is not running until the barber checks in (or the absence flow resolves them).

### Absence flow
- Trigger: barber absent for the day, or checks out with obligations pending (also: deactivation).
- Affected booked customers get notified with **swap or cancel**.
- **The customer chooses** between the proffered swap and cancellation.
- **The salon admin can manually swap or cancel any user's booking at any time** (admin override always available).
- A swap places the customer in the replacement barber's chair queue **preserving their original join time** (join order, not their slot time). Live-queue redistribution follows feature 4's rules.

## Open questions (pending)

None.

## Cross-feature dependencies (flagged, not decided)

- Feature 1: booking = branch → chair → barber → service; queue/slots belong to the chair.
- Feature 3: daily presence + chair assignment; its schedule feeds slots and check-in/out context.
- Feature 4: live-queue redistribution on chair disabling/barber deactivation, join-order preserving.
- Feature 6: the branch's service catalog (all barbers perform all of it).
- Feature 9: QR-verified visits (app-sourced) are the **eligibility gate** for rating both barber and salon; walk-ins are excluded.
- Feature 10: salon/branch rating and ranking mechanics (same post-visit form, already authoritative on eligibility).

## Nice-to-haves logged so far

- None yet.