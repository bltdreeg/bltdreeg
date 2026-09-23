# Queue and floor

## Open shop

Cashier opens the floor from the dashboard (phone, tablet, or computer). Opening records:

- Working hours and holidays
- Who is present today
- Which **chair** each present barber is on

Until that open exists for the current day, the salon is **closed**. Closed salons are listed as closed and **reject queue joins**. Do not send customers to a dark shop.

`Tenant.is_active` (the account exists) is not the same as **opened**.

## Join and ticket

The customer joins from the consumer app and sees:

- Ticket / turn number
- People ahead
- Expected wait

Expected wait is derived from **duration minutes** of services/packages on visits ahead, across open chairs. Do not guess wait.

## Disable chair

When a barber is absent or leaving, cashier disables that chair in one action.

- Visits waiting on that chair are reassigned to remaining chairs.
- **Arrival order is preserved.** They are not appended to the tail.
- Before confirm, show **impact preview**: count of affected customers, increase in expected wait.
- After confirm, notify each affected customer **in-app**.

Redistribute by original arrival timestamp in the salon queue, not by per-chair position.

## Notifications

Turn changes (delay, disable, reorder, people-ahead, wait) → in-app push only. No WhatsApp, SMS, or email for turn updates.
