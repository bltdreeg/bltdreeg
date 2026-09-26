# Feature 07 — Revenue Model

**Status: DONE**

## Feature brief (from project overview)

Revenue model — discount split between platform commission and customer saving.

## Confirmed decisions (with reasons)

### The model (user-specified, worked example)
- **Contract per salon**: the salon agrees, by contract, to a discount rate for **app-sourced customers** (e.g. 20%).
- **Walk-in** (no app, no scan): pays normal in-shop price (250). No discount, no commission.
- **App-sourced, QR-verified visit**: salon price after full 20% is 200. The 50 difference is split between customer and platform (half and half): **customer pays 225 cash**, the **salon owes the platform 25**.
- Salon nets 200 (= 225 collected − 25 owed) = 250 minus the agreed 20%. Exactly the contract.

### Locked rules (user's four points)
1. **Discount base = the branch's in-shop service price.**
2. **Discount applies to the whole bill, whatever was ordered** — all services, packages, custom combos (consistent with feature 6 Q7).
3. **The platform owns the split** between itself and the customer. The salon has no say in how the share divides; the split exists to encourage app use and the platform controls it. Salon's net is always "price − agreed discount %", regardless of split.
4. **Rounding differences go to the platform.**

### Frontier resolutions
- **App-sourced = app booking AND QR-verified visit (Q1: a+b).** A walk-in cannot scan the rotating QR — scanning happens from the app after booking — so every QR-verified visit is necessarily app-sourced. An app-booked visit that is never QR-verified gets **no discount**.
- **Terms snapshot at booking (Q2: b).** The contract discount rate AND the platform's split are both snapshotted when the booking is created. A service change (allowed until service start, feature 1) recomputes the discounted price using the **snapshotted terms**, never current ones.
- **Split/contract changes apply to new bookings only (Q3: a).** In-flight bookings keep their snapshot; a renegotiated contract applies from its effective date to bookings created after it.
- **One visit = one bill = one commission line (Q4: a).** Discounted bill = sum of all orders in the visit; a single commission number per visit feeds feature 8's monthly ledger. The customer sees the **final visit bill in the app** — the QR proves the visit, not the amount.

## Open questions (pending)

None.

## Cross-feature dependencies (flagged, not decided)

- Feature 8: the salon's owed commission is recorded and collected monthly (this feature produces the ledger entries).
- Feature 9: the QR-verified visit is the eligibility trigger for the whole model.
- Feature 6: pricing locked at booking; discount terms snapshot rides on the same booking.
- Feature 1: service changes (pre-service-start) drive recomputation; one active reservation = one visit.

## Decision log (resolved during grilling)

| # | Question | Decision |
|---|----------|----------|
| Q1 | App-sourced definition | App booking + QR-verified visit; walk-ins can't scan; unverified app booking = no discount |
| Q2 | When price fixes | At booking + recompute on service change using booking-time snapshot (rate + split) |
| Q3 | Contract/split changes | New bookings only; effective date governs |
| Q4 | Multiple orders in a visit | One bill, one commission line per visit |

## Nice-to-haves logged so far

- None yet.