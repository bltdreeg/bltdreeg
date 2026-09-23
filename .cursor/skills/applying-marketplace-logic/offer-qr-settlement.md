# Offer, QR, settlement

## Prices include minutes

Cashier sets **price** and **duration** on services and packages. Duration feeds the queue. Price feeds the offer.

## Offer split

The salon funds an offer on the app. The platform splits that offer 50/50 into **customer saving** and **platform fee**.

Canonical numbers (package hair + beard + blow-dry):

| Label | Amount |
|---|---|
| Unbundled list (context only) | 350 |
| Walk-in / salon package price | 250 |
| Offer rate the salon gives the app | 20% |
| Notional app price `250 * 0.80` | 200 |
| Gap `250 - 200` | 50 |
| Customer saving (half gap) | 25 |
| Platform fee (half gap) | 25 |
| App-acquired customer pays after scan | 225 |

Walk-in never pays 225. Only a **scanned app-acquired** visit does.

```text
gap            = walk_in_price * offer_rate
customer_pay   = walk_in_price - gap / 2
platform_fee   = gap / 2
```

## Visit paths

| Path | Who checks in | Customer scans rotating QR | Pays cash | Platform fee |
|---|---|---|---|---|
| App-acquired | Already in the system/queue | Required | 225 | 25 (ledger) |
| Walk-in | Cashier on the dashboard | No | 250 | 0 |

## Why the model holds

- Recording a walk-in costs the salon nothing, so reception will not hide them. The **queue stays complete**.
- Scan is from the **customer device**, not the salon device, so it is independent proof at month-end.
- No scan ⇒ no discount, so the customer demands the scan to receive the saving.

Do not let reception complete the scan. Do not apply the offer without a scan. Do not charge commission on walk-ins.

## Money movement

The customer pays the **full amount they owe in cash to the salon**. Example: 225 goes in the drawer. 25 is a ledger line on the salon, collected in **one monthly settlement** (wallet, InstaPay, or transfer). The customer never pays the platform.

## Ranking carrot

Each salon has a public rating used to order salons in the app. **Number of QR scans** lifts that ranking. More scans → higher list → more demand. The salon is incentivized to push the app.
