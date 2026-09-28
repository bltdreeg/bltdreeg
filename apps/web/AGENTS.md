# bltdreeg web: agent guide

The customer web app for **bltdreeg (بلتدريج)**, a live queue app for barbershops in Egypt.
Customers find a salon, join a barber's queue now or book a slot, watch their turn
come closer, check in by scanning the salon's QR code, and rate the visit.

Sibling surfaces (not this app):
- `apps/bltdreeg_cutsomer_mobile`: Flutter customer app, the same product on mobile.
- `apps/bltdreeg-server`: Laravel. `tenant-app` is the salon/cashier panel and `central-app` is the platform admin panel. Both share `packages/core`.

Salon staff never use this app. Links to the salon panel are external (`NEXT_PUBLIC_SALON_PANEL_URL`).

## Commands

```bash
pnpm dev        # http://localhost:3213
pnpm lint
pnpm test       # node --test "src/**/*.test.ts" (no framework)
pnpm i18n:scan  # run after adding translation keys
```

Stack: Next 16 (App Router), React 19, next-intl (`ar` default, `en` optional),
TanStack Query, Tailwind 4, shadcn + base-ui. **All data is demo data**: no backend is wired yet.

## Where the truth lives

1. `../../bltdreeg-plan/docs/`: the finished business decisions (features 01–11, domain model, ADRs).
   **This folder is local only (not in git).** If it's missing, use the docs below.
2. [docs/domain.md](docs/domain.md): the rules and vocabulary this app depends on, distilled from (1).
3. `../../.cursor/rules/`: **older** marketplace rules. Where they disagree with (1), (1) wins.
4. The current web code. It was built on an older model (the deleted `BUSINESS.md`: slot
   appointments + fixed queue number). See **Known drift** in [docs/domain.md](docs/domain.md)
   before copying any existing pattern into new work.

## Hard rules: never break these

1. **The queue must always stay complete and correct.** Queue order = join time, changed only by skip and postpone.
2. **Queue position, "people ahead", expected wait, slot-full, app-sourced and rating averages are computed, never stored.**
3. **Expected wait = sum of service durations ahead + the barber's remaining time.** Never a hard-coded or guessed number.
4. **A closed or suspended branch can't be joined now.** Slot booking doesn't depend on open/closed.
5. **One live queue per customer**, plus at most 2 future slots (never two with the same start time).
6. **The customer pays cash at the salon.** No in-app, card or wallet payment by the customer, ever.
7. **The discount exists only for an app booking plus a QR scan on the customer's own phone.** Walk-ins: no discount, no commission.
8. **Only a completed, QR-verified visit can rate.** One form covers the barber and the salon. Barber ratings belong to that salon only.
9. **Notifications are push plus the in-app inbox only.** Never WhatsApp, SMS or email. Turn-critical notifications can't be muted.
10. **Registration is required** to book or join (phone + OTP, or email + password).

## Code rules (details in [docs/architecture.md](docs/architecture.md))

- Page-private code goes in `__components/`, `__sections/`, `__lib/` next to the page. Shared UI goes in `components/atoms|molecules|organs`.
- Every page path goes in `src/lib/data/constants/routes.constants.ts` and every API path in `api-routes.constants.ts`. No hardcoded URLs.
- All user-facing text goes through next-intl (`src/i18n/messages/{ar,en}.json`). Arabic is the default and the layout is RTL, so use logical CSS (`ms-*`, `pe-*`).
- Enums are `const` objects plus a type (see `src/lib/types/booking/booking-status.enum.ts`).
- Code comments are written in Arabic. Match the surrounding file.
- `ponytail:` comments mark a deliberate shortcut and when to upgrade it. Keep them accurate.
- Use the domain vocabulary in [docs/domain.md](docs/domain.md) for new names and UI copy.

## Read next

- [docs/business.md](docs/business.md): what the product is, who uses it, how money flows.
- [docs/domain.md](docs/domain.md): queue, slot, QR, discount, rating and notification rules; vocabulary; known drift.
- [docs/architecture.md](docs/architecture.md): folders, naming, data flow, auth, i18n, tests.
- [docs/system-design.md](docs/system-design.md): how the apps fit together, plus the design system (colors, type, spacing, voice). Read before any UI work.
