# System design and design system

One-page map for agents: how the whole product fits together, and the visual tokens every screen uses.
Details live in [architecture.md](architecture.md) (web code), [domain.md](domain.md) (rules and vocabulary) and
`../../bltdreeg-plan/docs/` (business decisions, local only). Where they disagree, the plan wins.

## 1. System

### Apps

```
customers ─┬─ apps/bltdreeg_cutsomer_mobile  (Flutter)   ─┐
           └─ apps/web                        (Next 16)   ─┼─→ apps/bltdreeg-server (Laravel)
salon staff ── tenant-app   (salon admin / cashier panel) ─┤      ├─ tenant-app
platform    ── central-app  (platform admin)              ─┘      ├─ central-app
                                                                  └─ packages/core (shared domain)
```

- The web app is **customer only**. Salon staff never use it; links to the salon panel go to `NEXT_PUBLIC_SALON_PANEL_URL`.
- The web app has **no backend wired yet**. All data is demo data behind server actions. When the API arrives, only
  the action bodies change (see [architecture.md](architecture.md#data-flow-today)).

### Core entities

| Entity | Belongs to | Notes |
|---|---|---|
| Salon | platform | **The tenant.** Billed the monthly commission invoice. |
| Branch | Salon | Physical venue. Owns chairs, barbers, catalog, the rotating QR. Cashier dashboard = one branch. |
| Chair | Branch | One barber per chair. **One queue per chair.** Has its own slots. |
| Barber | Salon | Profile is per salon; moving salons = new profile, rating from zero. |
| Customer | platform | Separate table from staff `users` (ADR 0001). Registration required. |
| Reservation | Customer + Chair | A place in a live queue, ordered by join time. Max **one live** per customer. |
| Slot | Chair | Bookable time with capacity. At start the holder joins the queue as a fresh joiner. Max **two future**. |
| Visit | Reservation | Served visit. App-sourced = app booking + QR scan on the customer's own phone. |

### Rules that shape every design

- **Derived values are never stored** (ADR 0004): queue position, people ahead, expected wait, slot full,
  app-sourced, branch suspended, rating averages. Compute them; never hard-code or cache them as truth.
- **Expected wait** = sum of service durations ahead + the barber's remaining time.
- **Queue order** = join time, changed only by skip (absent: back 1, then removed) and postpone (customer, once, 1–3 places).
- **Check-in** = QR scan only. It marks presence, it never reorders.
- **Money:** customer pays cash at the salon, always. Discount only for app booking + QR scan. No in-app payment.
- **Notifications:** push + in-app inbox only. Turn-critical ones can't be muted. Never WhatsApp, SMS or email.
- **Catalog:** per-branch override of salon/platform services via `branch_services` / `branch_packages` (ADR 0003).
- **RBAC:** one engine; every role is tenant-scoped; platform powers come from `role_templates` (ADR 0002).

### Customer journey (what the web app screens map to)

```
search / home → salon/[id] → book: barber → slot or join now → review → confirmation
      → bookings/[id] (live: position, people ahead, expected wait; polls queue-status every 30 s)
      → scan QR at the salon (check-in) → served → bookings/[id]/rate (one form: barber + salon)
```

## 2. Design system — "التذكرة" (the ticket)

Source: `apps/web/design/web.html`, **FRAME 01 · Design System Sheet**. Tokens live in `src/styles/globals.css`.
Idea: every booking carries two facts together, **the time and your place in the queue**. The ticket is the card shape
everywhere; the horizontal list row is a second form used only for search results.

### Color (locked: no new brand colors)

Use the Tailwind token, never the hex. Tints of locked colors are allowed; new hues are not.

| Role | Hex | Tailwind | Use |
|---|---|---|---|
| Primary | `#0F766E` | `bg-primary` `text-primary` | Buttons, the ticket, the top rail, links |
| Pressed | `#0B5A54` | `bg-primary-pressed` `hover:text-primary-pressed` | Pressed and hover state of primary |
| Background | `#FFFFFF` | `bg-background` `bg-card` | Page and cards |
| Surface | `#F7F8FA` | `bg-muted` `bg-secondary` | Fields, divided sections |
| Tint | `#F0FAF8` / border `#CFE6E3` | `bg-tint` `border-tint-border` | Hero band, soft primary highlights |
| Text | `#0E0F11` | `text-foreground` | Headings and numbers |
| Muted text | `#6B7280` | `text-muted-foreground` | Area, distance, explanations |
| Border | `#E5E7EB` | `border-border` | 1px hairline **instead of shadow** |
| Perforation | `#D9DDE2` | `border-perforation` | The ticket's dashed tear line |
| Disabled | bg `#E7EAEC` / text `#A5ABB3` | `bg-disabled-bg` `text-disabled-fg` | Disabled controls |
| Success | `#16A34A` / strong `#15803D` / bg `#DCFCE7` | `text-success` `text-success-strong` `bg-success-bg` | "Booked", "salon on time" |
| Warning | `#F59E0B` / fg `#92400E` / bg `#FEF3C7` | `text-warning` `text-warning-fg` `bg-warning-bg` | **Only** a real delay in minutes ("متأخر 10 د") |
| Danger | `#EF4444` | `text-destructive` `bg-destructive` | Cancel booking, "no slots left today" |

Meaning rules: green = booked or on time. Yellow = a real delay, never crowding or promotion. Red = cancellation or no slots.
No crowding signals anywhere. Availability is a written time, and the queue number only appears **after** booking.

Dark mode: `.dark` still holds the shadcn grey defaults. It is not designed, so don't rely on it.

### Type — Cairo (`font-sans`)

Numbers are always `tabular-nums` (the `tabular` class) and Western digits. Currency is `80 ج.م`, distance is `1.2 كم`.

| Role | Size / weight | Example |
|---|---|---|
| Display | 38 / 900 | احلق في وقتك |
| H1 | 28 / 700 | صالونات في المعادي |
| H2 (section title) | 21 / 700 (`text-lg md:text-[21px] font-bold`) | اختار الخدمة |
| Card title | 17 / 700 | صالون الكابتن حسام |
| Body | 15 / 400 | Descriptions |
| Body strong | 15 / 600 | Names |
| Meta | 13 / 400 | المعادي · 1.2 كم · 214 تقييم |
| Caption | 11.5 / 600 | أقرب ميعاد |
| Ticket time | 30 / 700 tabular | 6:30 م: the biggest thing on the card |
| Queue numeral | 46 / 800 tabular | 3 |

### Spacing, layout, radii, controls

- **Spacing scale (4-based):** `4 · 8 · 12 · 16 · 24 · 32 · 40 · 64` → Tailwind `1 · 2 · 3 · 4 · 6 · 8 · 10 · 16`.
  Don't use values off the scale (no 20, 44, 52, 56, 96). The frames in `web.html` break this in places; the sheet wins.
- **Layout @1440:** margins 64, 12 columns, **gap 16**, max content width 1312 (`PageContainer`: `max-w-[1312px] px-4 md:px-16`).
  Ticket card 308 wide (4 per row, `grid-cols-2 md:grid-cols-4 gap-4`). List rows are full width.
- **Section rhythm (home page):** the page owns spacing between sections; sections have no outer margin.
  | Gap | Mobile / desktop | Tailwind |
  |---|---|---|
  | Section title → content | 16 | `gap-4` |
  | Related sections (shop rails), hero → first rail | 32 / 40 | `gap-8 md:gap-10` |
  | Chapter break (rails → wave → download → reviews → partner) | 40 / 64 | `gap-10 md:gap-16` |
  | Hero band vertical padding | 32 / 64 | `py-8 md:py-16` |
- **Radii:** 8 · 10 · 12 · 14. Buttons 10, fields 12, cards 14 (`ShopCard`, review cards).
- **Controls:** button height 44 · radius 10. Field height 48 · radius 12. Icon button 40×40.
  Variants: primary, pressed, disabled, secondary, ghost, destructive.
- **Shadow:** only for hover and modals. Everything else uses the 1px border.

### Ticket card anatomy (FRAME 01 §05)

1. Clean 4:3 photo; nothing on it except the save button.
2. Name → area · distance → rating. Always 3 lines.
3. Dashed tear line + two punch holes: the ticket's visual signature.
4. Earliest slot in 30px: the largest element on the card, the thing that sells.
5. "من" price in light text: supporting info, not the hero.

Skeletons use the same ticket shape (`home-skeleton.tsx`).

### Voice: spoken Egyptian Arabic

| Say | Don't say |
|---|---|
| أقرب ميعاد: النهارده 6:30 م | المواعيد المتاحة القادمة |
| رقمك في الدور 3 | ترتيبك في قائمة الانتظار |
| قدامك 2 في الدور | عدد العملاء المنتظرين |
| الصالون متأخر 10 د | يوجد تأخير في الخدمة |
| مفيش مواعيد خلاص النهارده | لا تتوفر مواعيد اليوم |

Days name themselves: النهارده · بكرة · بعد بكرة · الأحد. Area names without «حي» or «منطقة».

### Known drift (don't copy these)

- `app-download/journey-demo.tsx` and parts of `partner-banner.tsx` hard-code hex colors (`#0F766E`, `#E5E7EB`, …) instead of tokens.
- `app-download.tsx` uses `bg-white` instead of `bg-background`.
- Some components still use off-scale arbitrary values (`gap-[18px]`, `text-[13.5px]`, `px-[17px]`).
