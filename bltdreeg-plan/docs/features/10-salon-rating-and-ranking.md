# Feature 10 — Salon Rating and Ranking

**Status: DONE**

## Feature brief (from project overview)

Salon rating and ranking (QR scan count as a ranking factor).

## Confirmed decisions (with reasons)

### Who rates whom
- **Served customers only** — a salon can only be rated after a completed QR-verified visit (Q1).
- **Reason**: rating requires evidence of real service. Blocks competitor/farm drive-by ratings and no-experience ratings.

### One visit, one post-visit form, two ratings (Q2)
- The end-of-visit screen asks for **both ratings in a single form**: barber stars (feature 2's rating) AND salon stars, as independent fields, each with optional comment.
- **Reason**: the salon bought the app, the barber gave the service; collapsing them forces a false either/or.

### Salon rating content
- **Same shape as barber rating** (Q3): 1–5 stars + optional comment, average + count displayed, comments anonymized.
- **Reason**: one mental model across rating surfaces. A category breakdown (cleanliness, wait, price) is possible but logged as a nice-to-have.

### Ranking
- **Rating average first** (highest average stars first).
- **Minimum-ratings floor** (e.g. ≥5 rated visits) required to appear in the customer-facing ranking at all — kills the "single 5-star review tops the list" problem.
- **Tie-break by QR scan (verified visit) count** — the "scan count as a ranking factor" from the brief: busiest = most trusted (Q4).
- **Reason**: bare average is gameable; a single composite hides what customers care about and needs calibration.

### Walk-ins do not count (Q5)
- Only **QR-verified app visits** count toward the ranking floor and scan count. Walk-ins served by the salon are real visits, but they do not promote the salon in the app-discovery surface.
- **Reason**: the ranking promotes salons for the visits the app actually produced, preserving feature 9's verified-visit signal.

## Open questions (pending)

- The exact minimum-ratings floor value (e.g. 5) — a tuning decision.

## Cross-feature dependencies (flagged, not decided)

- Feature 2: barber ratings rule the barber field of the post-visit form.
- Feature 1: the visit / reservation lifecycle triggers the post-visit rating prompt.
- Feature 9: QR-verified visits are both the eligibility gate for rating and the ranking's scan-count signal.

## Decision log (resolved during grilling)

| # | Question | Decision |
|---|----------|----------|
| Q1 | Who can rate a salon | Served customers (QR-verified visit) only |
| Q2 | Two ratings per visit | Both in one post-visit form, independent fields |
| Q3 | Rating shape | Same as barbers: stars + optional comment, anonymized |
| Q4 | Ranking | Average first; minimum-ratings floor; tie-break by scan count |
| Q5 | Walk-in contribution | None — floor and scan count are QR-verified app visits only |

## Nice-to-haves logged so far

- Category breakdown ratings (cleanliness, waiting time, price).