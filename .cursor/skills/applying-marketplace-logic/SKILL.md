---
name: applying-marketplace-logic
description: Use when implementing, designing, or changing barbershop marketplace behavior in bltdreeg — queue, chairs, open shop, roster, barber profiles, ratings, wait time, in-app notifications, service duration, packages, offers, QR scans, walk-ins, cash collection, monthly settlement, or salon ranking. Use before writing models, APIs, Filament resources, or tests in those domains.
---

# Applying marketplace logic

## Overview

The salon (`Tenant`) is the account. Keep the live queue complete and honest. The customer pays cash at the chair. The platform is owed later, only for QR-proved app-acquired visits.

## Before writing code

1. Name the **actor**: customer, barber, owner, cashier, platform.
2. Name the **visit type**: app-acquired or walk-in.
3. Check every invariant in `.cursor/rules/marketplace-invariants.mdc`.
4. Use words from `.cursor/rules/marketplace-vocabulary.mdc` in models, APIs, and tests.
5. Read the matching reference below.
6. Write tests for the invariant first.

## Domain routing

| If the change is about | Read |
|---|---|
| Open/close, chairs, roster, join queue, wait estimate, disable chair | [queue-and-floor.md](queue-and-floor.md) |
| Barber profile, chair assignment, ratings | [barber-identity.md](barber-identity.md) |
| Prices, offer split, QR, walk-in vs app, settlement, ranking | [offer-qr-settlement.md](offer-qr-settlement.md) |

## After changes

The eight invariants still hold. If a walk-in gets cheaper, a closed shop becomes joinable, a rating travels with a person, or money leaves the customer toward the platform at the till — the change is wrong.

## Red flags — stop

- "We'll notify on WhatsApp for now"
- "The barber should keep their stars when they move"
- "Customers can pay in the app"
- "Reception can scan the QR to speed checkout"
- "Skip recording walk-ins; they're not our customers"
- "Shop is closed but let them join so they're ready at open"

## Additional resources

- Invariants rule: `.cursor/rules/marketplace-invariants.mdc`
- Review checklist skill: `reviewing-marketplace-invariants`
