# Feature 08 — Payment and Monthly Collection

**Status: DONE (REVISED)**

## Feature brief (from project overview)

Payment and monthly collection (cash to salon, commission billed monthly).

## Confirmed decisions (with reasons)

### Customer-side payment (Q1, unchanged)
- The customer pays the salon **in cash** — the app message explicitly says cash only.
- If a salon accepts other instruments (card, instapay) on its own, that is its own business; **the platform records only the amount**.

### Invoice timing (REVISED)
- **One fixed day for all salons**: the invoice is issued on the **1st of each month** and covers all visits of the **previous calendar month**.
- **Minimum of 3 visits**: below that, **no invoice is issued** and the amount due **rolls over** to the following month.
- **Rollover semantics**: the ≥3 threshold is checked against the **accumulated outstanding un-invoiced visits** — once the running total reaches ≥3, an invoice issues covering all carried-over months.
- **Reason**: fewer than 3 app-sourced visits in a month is noise — issuing micro-invoices for 1–2 visits annoys salons and burns gateway fees. Counting accumulated visits prevents micro-invoices while never letting a legitimate balance drift un-invoiced.

### Invoice content (REVISED)
- The invoice is paid **in full or stays due** — **no partial payments**, no "partial" state in the system.
- **Transfer fee is charged to the salon** and shown in **separate mandatory lines** so the fee reads as a payment-provider fee, **not** an increase in the platform commission:
  ```
  App share            480 EGP
  Transfer fee          12 EGP
  Total to pay         492 EGP
  ```
- The platform receives the **full app share with no deduction** (the fee topology is internal to the gateway).

### Payment method: gateway only (REVISED)
- The salon pays its invoice **from the invoice page in its dashboard** through a **payment gateway**.
- **No transfers outside the system**, **no manual payment recording** by the platform.
- Methods available to the salon: **Fawry, InstaPay, any mobile wallet**.
- **Reason**: fully self-serve payment removes reconciliation labor and the risk of unrecorded off-channel payments.

### The trigger: due → paid (one event, two technical paths)
- **Automatic path**: the gateway sends a **webhook confirming success** — no human involved.
- **Manual path**: a **direct query of the transaction status** from the gateway.
- Both paths drive **the same event**, recording:
  - type (webhook / lookup)
  - the gateway's **transaction reference**
  - time, amount, payment method (Fawry / InstaPay / wallet)
- **Idempotency**: executes **once per invoice** — the same transaction reference must never be recorded twice (webhooks retry automatically).
- Effect: invoice **closed instantly**, **any suspension lifted immediately**, with **no platform intervention**.

### Escalation: one week maximum (REVISED — replaces earlier admin-decided handling)
- **Day 1**: invoice issued, status **"due"**.
- **Days 2–5**: **grace period**.
- **Day 6**: **one warning** — banner in the branch dashboard + a notification.
- **Day 7**: **last day to pay**.
- **Day 8**: **suspension** — dashboard locked, branch disabled on the app.
- **Suspension is a single level** and is **lifted instantly** once payment succeeds.
- **During suspension**:
  1. The dashboard is **locked except the invoice and payment page**.
  2. The branch **disappears from search and discovery**: no new queue entries.
  3. The **existing queue is drained to the end**: reception can press "finish" for customers already inside only.
- **Never lock the screen on customers standing in the shop** — the customer is not a party to the dispute.
- **Reason**: the customer who is physically present bought a service; the salon-vs-platform dispute must never punish them.

## Open questions (pending)

None.

## Cross-feature dependencies (flagged, not decided)

- Feature 7: produces the per-visit commission ledger lines (the invoice's "app share").
- Feature 9: QR-verified visits are the source of billed lines and the visit count that gates "≥3 visits".
- Feature 3: suspension disables the branch on the app (appearance/search) — same surface as open/close but customer-facing gating differs (locked dashboard vs closed branch).
- Feature 10: suspended branches disappear from ranking/discovery.

## Decision log (resolved during grilling)

| # | Question | Decision |
|---|----------|----------|
| Q1 | Customer payment | Cash; platform records amount only |
| — (rev) | Invoice timing | 1st of month; covers previous month; all salons |
| — (rev) | Minimum visits | ≥3 else roll over; threshold on accumulated outstanding visits (completed) |
| — (rev) | Payment method | Gateway only, from dashboard; Fawry/InstaPay/wallet; no off-channel transfers; no manual recording |
| — (rev) | Partial payments | None — full or due |
| — (rev) | Transfer fee | Charged to salon; shown as separate lines; full app share net to platform |
| — (rev) | Due→Paid trigger | Webhook or gateway query; one event; idempotent on transaction reference; instant close/lift |
| — (rev) | Escalation | Day1 due, Days2–5 grace, Day6 warning, Day7 last day, Day8 suspension (single level, instant lift, drain-only) |
| — (rev) | Customer protection | Never lock screen on customers in the shop |

## Nice-to-haves logged so far

- Automated reconciliation if ledger volumes grow.