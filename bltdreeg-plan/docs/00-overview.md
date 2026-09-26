# Salon Queue — Project Overview

## Summary

A salon queue app for barbershops in Egypt. Customers join a live queue from the mobile app and see their position, how many people are ahead, and the expected wait time. Salons run a cashier dashboard (mobile, tablet, desktop).

Customers pay the full amount in cash at the salon. The platform earns a commission from a discount the salon gives on packages for **app-sourced customers**, collected monthly in a single invoice. A rotating **QR** shown at the salon, scanned by the customer from their own device, is the independent proof of a visit — it unlocks the discount and the commission. **Walk-ins** are registered by the salon's staff with no scan, no discount, no commission.

**Core property of the product: the queue must always stay complete and correct.**

## Feature List

| # | Feature | Status |
|---|---------|--------|
| 1 | Customer booking and live queue (position, people ahead, expected wait, in-app notifications only, no WhatsApp; **coexists with advance time slots**) | done |
| 2 | Barber profiles (owned by the salon, seated on a chair, independent rating; a barber who moves salons gets a new profile with rating from zero) | done |
| 3 | Opening the shop (open/close switch gates join-now only; admin confirms daily chair assignment; cashier controls chairs and mid-day events) | done |
| 4 | Emergency chair disabling (redistribute customers by join time into same-branch live chairs; cashier controls ask-first or swap-then-notify; numeric impact preview before confirming) | done |
| 5 | Notifications (single push pipeline, two-stage turn warning, turn-critical not muteable; system + cashier events, in-app mirror center) | done |
| 6 | Service and package pricing (branch-owned catalogs; per-branch durations feed expected wait; packages + dynamic combos; prices locked at booking) | done |
| 7 | Revenue model (per-salon contract discount on branch prices; platform owns the split; terms snapshotted at booking; QR-verified app-sourced = eligible; one bill per visit) | done |
| 8 | Payment and monthly collection (cash at salon; invoice on the 1st covering previous month, ≥3 visits else rollover; gateway-only payment Fawry/InstaPay/wallet; 1-week escalation to suspension; drain-only, never lock out customers in-shop) | done |
| 9 | QR proof and discount (rotating QR, changes every N minutes; customer scans from app → presence + checked-in; app booking before service + scan = discount; cashier-assisted path) | done |
| 10 | Salon rating and ranking (served-customers-only rating, one post-visit form for barber+salon; rank by average with minimum-ratings floor, tie-break by QR scan count) | done |
| 11 | Employee roles and permissions (one permission engine; platform catalog copy-on-take; job types salon-admin/cashier/reception/barber+custom; email+password, one branch per employee) | done |

## Status Legend

- `not started` — no grilling session held yet
- `in progress` — currently being grilled; feature document exists with **IN PROGRESS** status
- `done` — grilling finished, feature document marked **DONE**

## Related Documents

- [Domain model](./domain-model.md) — entities, terms, relationships, invariants (maintained continuously)
- [Pending questions](./pending-questions.md) — questions the customer could not answer
- [Nice to have](./nice-to-have.md) — ideas outside the current scope
- [Features](./features/) — one document per finished feature