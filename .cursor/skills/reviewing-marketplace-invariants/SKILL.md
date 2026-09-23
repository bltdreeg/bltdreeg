---
name: reviewing-marketplace-invariants
description: Use when reviewing pull requests, diffs, designs, or tests that touch queue, chairs, open shop, barber profiles, ratings, wait time, notifications, offers, QR, walk-ins, settlement, or salon ranking in bltdreeg.
---

# Reviewing marketplace invariants

## Verdict order

1. Name visit type (app-acquired vs walk-in) and actor.
2. Run this checklist against the diff.
3. Report **blockers** (invariant breaks) before style notes.

## Blockers

- [ ] Closed shop can still join the queue
- [ ] Disabled-chair visits are appended to the tail instead of merged by **arrival time**
- [ ] Chair disable has no **impact preview** (affected count + wait delta)
- [ ] Barber rating or reviews copy across `tenant_id`
- [ ] Wait time is not derived from service **duration minutes**
- [ ] Customer pays the platform (card, wallet, in-app checkout)
- [ ] Discount or platform fee without a **customer-device QR scan**
- [ ] Reception/staff scan counts as visit proof
- [ ] Walk-in is charged commission or given the app price
- [ ] Walk-in is omitted from the queue
- [ ] Turn updates go to WhatsApp, SMS, or email
- [ ] Salon dashboard can rewrite scan records used for settlement
- [ ] QR scan count is ignored in salon ranking

## Money check (canonical)

Walk-in 250, offer 20% ⇒ pay 225, fee 25, walk-in stays 250 / fee 0.

If the diff produces other numbers without an explicit offer-rate change, it is wrong.

## Pass language

Use vocabulary from `.cursor/rules/marketplace-vocabulary.mdc`. If the diff says appointment, coupon, or commission-at-till for these concepts, flag the name.

For implementation guidance, use `applying-marketplace-logic`.
