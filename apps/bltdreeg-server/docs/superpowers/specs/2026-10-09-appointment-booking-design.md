# Appointment Booking — Design

Booking subsystem for Beltadreeg: the tenant dashboard controls bookable time
per barber inside the selected branch; customers browse a branch page and book
service/package → barber → slot; the tenant sees every booking and can create
one manually.

Owner-confirmed through a brainstorming session on 2026-10-09. Supersedes the
live-queue booking model in `bltdreeg-plan/docs/features/01-*` (see ADR 0006).

---

## 1. Goal

One bookable-time system shared by three surfaces:

- **`tenant-app`** — per-barber schedules (hours, slot step, gap, blocks,
  pause), a bookings list, a manual booking form, a day board, and
  branch-owned services and packages.
- **`central-app`** — the public customer API for branch profile, catalog,
  barbers, availability, and booking writes.
- **`apps/web`** — the branch page and the existing booking flow, wired to
  that API in place of mock data.

Success: a customer completes a real booking from the branch page, the slot
disappears for everyone else, and the tenant sees it on the same schedule grid
that produced it.

## 2. Decisions

Locked with the owner. Each replaces or sharpens a prior assumption.

| # | Decision |
|---|---|
| 1 | **Appointment + derived queue number.** A booking is a reserved time range on a barber. The queue number is `#N today` for that barber, by `starts_at`. The chair / live-queue model (join-now, skip, postpone, redistribution) is **deferred**. |
| 2 | **Availability is computed from rules**, never materialized. Stored inputs are weekly schedules, time blocks and bookings. |
| 3 | **Service duration drives the booking.** `slot_step_minutes` is only the grid; the booking occupies the basket's real total duration plus the barber's gap. |
| 4 | **Services and packages are branch-owned.** `branch_id` is added to `services`; existing tenant rows are fanned out to every branch of the tenant. `packages` is born branch-owned. `service_categories` stay tenant-level. |
| 5 | **Barbers are employees**, not a new entity: a `users` row whose `tenant_user.job_type_id` points at a job type flagged `is_bookable`. |
| 6 | **Booking schedules are separate from HR `shifts`.** HR shifts serve payroll and attendance; changing one must never silently change public availability. |
| 7 | **One `barber_time_blocks` table covers all blocking**: a single slot, a window on a date, a full day, a date range. An `is_paused` flag on the barber's settings stops new bookings indefinitely. |
| 8 | **Basket is free**: services and packages mixed; durations and prices sum. |
| 9 | **Guest + OTP at confirmation.** Name + phone + OTP creates a passwordless customer behind the scenes. **Onboarding never gates authenticated routes.** |
| 10 | **Auto-confirmed.** No tenant approval step. Customers may cancel and reschedule within the branch cutoff. |
| 11 | **Manual bookings carry free-text name + phone, no customer record**, and may override availability rules. |
| 12 | **Per-branch windows**: days bookable ahead (14), minimum notice (60m), cancel/reschedule cutoff (120m), default slot step (15m), default gap (0). |
| 13 | **Engine in `packages/core`**, public API in `central-app`, UI in `tenant-app`. One copy of the availability maths. |
| 14 | **Occupancy-level Redis cache**, ~60s TTL, busted on write. |
| 15 | Times stored UTC, rendered `Africa/Cairo`. Capacity is 1 customer per barber per overlapping range. No online payment — cash at the salon. |
| 16 | **The mobile apps are not touched** (`apps/customer-mobile`, `apps/bltdreeg_cutsomer_mobile`). |

### Why not the live queue

`bltdreeg-plan/docs/features/01-customer-booking-and-live-queue.md` models a
slot as a *join moment* on a chair: at slot start the customer enters a chair's
live queue as a fresh joiner, and order is maintained by join time with skip
and postpone rules. That design needs chairs, daily chair assignment, barber
check-in/out, and emergency redistribution before a single booking works.

The owner's requirement is a plain appointment: the slot **is** the booking.
The queue number survives as a derived display (`#N` among that barber's
bookings for the day), which preserves the product promise in `BUSINESS.md`
without the chair machinery. The queue layer can be added later as its own
feature; nothing in this schema blocks it. Recorded as ADR 0006.

## 3. Architecture

```
packages/core/src/Modules/Booking/      shared domain
  Models/        Package, BarberSchedule, BarberBookingSettings,
                 BarberTimeBlock, Booking, BookingItem
  Enums/         BookingStatusEnum, BookingSourceEnum
  Support/       AvailabilityEngine, OccupancyCache, BasketResolver,
                 BookingService, QueueNumberProjector
  Events/        BookingCreated, BookingCancelled, BookingRescheduled
  Policies/

central-app/app/Modules/V1/Booking/     public customer API
  Http/Controllers, Http/Requests, Http/Resources, routes/api.php
  BookingServiceProvider  (registered in bootstrap/providers.php)

tenant-app/app/Modules/V1/Booking/      salon panel UI
  Filament/Resources/{Bookings,Packages}
  Filament/Pages/{BarberSchedules,DayBoard,BranchBookingSettings}
  Livewire/ (schedule grid component)
  Policies/
  BookingServiceProvider  (registered in bootstrap/providers.php)
```

The module layout follows the existing convention documented in
`apps/bltdreeg-server/README.md`: shared models and domain logic in
`packages/core/src/Modules/*`, Filament UI per app under `app/Modules/V1/*`,
each module owning its service provider.

Branch scoping reuses `Bltdreeg\Core\Concerns\BelongsToBranch` and
`BranchContext`, so the panel's existing branch switcher governs every new
screen with no special-casing.

`central-app` reads the same core models directly — both apps share one
database — so there is no service-to-service HTTP hop.

## 4. Data model

Nine new migrations in `packages/core/database/migrations/`. Applied
migrations are never edited.

### 4.1 `services` becomes branch-owned

`2026_10_09_000001_add_branch_id_to_services_table.php`

1. Add `branch_id` nullable, FK `branches`, cascade on delete, after
   `tenant_id`.
2. Backfill per tenant: existing rows attach to the tenant's lowest-id
   branch; for every other branch of that tenant each service row is
   **duplicated** (same name JSON, description, category, price, duration,
   currency, `catalog_service_id`, `is_active`). No branch starts empty, no
   row is lost.
3. Make `branch_id` required; index `(branch_id, is_active)`.
4. `down()` deletes the rows whose `branch_id` is not the tenant's lowest-id
   branch — the duplicates this migration created — then drops the column.
   Row identity is never compared by the translatable `name` JSON.

`service_categories` stay tenant-level — a category is grouping only, and
branch services reference the tenant's categories. `Service` gains
`BelongsToBranch`, which makes the existing tenant Services screen
branch-scoped without a UI rewrite.

`user_services` is untouched by this work. It implies a per-barber service
list that feature 02 removed; the open question in
`bltdreeg-plan/docs/pending-questions.md` stands.

### 4.2 `packages`

`2026_10_09_000002_create_packages_table.php`

| column | type | notes |
|---|---|---|
| `id` | bigint PK | |
| `tenant_id` | FK tenants, cascade | |
| `branch_id` | FK branches, cascade | branch-owned |
| `name` | json | translatable, matching `services` |
| `description` | json nullable | translatable |
| `price` | decimal(10,2) | the tenant's list price |
| `currency` | tinyint | `CurrencyEnum`, default EGP |
| `duration` | int nullable | **override**; null → sum of member services |
| `is_active` | bool default true | |
| `sort_order` | int default 0 | |
| timestamps | | |

Index `(branch_id, is_active)`.

### 4.3 `package_service`

`2026_10_09_000003_create_package_service_table.php`

`package_id`, `service_id`, unique `(package_id, service_id)`. Both sides must
belong to the same branch — enforced in the model and validation layer, since
the constraint spans two tables.

The package's `price` is set freely; the UI shows the **sum of member service
prices** beside it so the saving is explicit.

### 4.4 `is_bookable` on job types, booking settings on branches

`2026_10_09_000004_add_booking_settings_to_job_types_and_branches.php`

Adds `is_bookable` boolean default false to **both** `job_types` (tenant) and
`catalog_job_types` (platform). The catalog flag is copied when a catalog job
type is imported into a tenant.

A bookable barber is a `users` row where the matching `tenant_user` row's
`job_type_id` points at a `job_types` row with `is_bookable = true`, whose
`users.branch_id` is the branch in question, and which is `is_active`.

Same migration adds the branch-level windows and defaults to `branches`:
`booking_days_ahead` (default 14), `booking_min_notice_minutes` (60),
`booking_cancel_cutoff_minutes` (120), `booking_slot_step_minutes` (15),
`booking_gap_minutes` (0). These prefill a new barber's settings and act as
the fallback when a barber override is null.

### 4.5 `barber_booking_settings`

`2026_10_09_000005_create_barber_booking_settings_table.php`

One row per `(branch_id, user_id)`, created lazily from branch defaults on
first edit.

| column | type | notes |
|---|---|---|
| `tenant_id`, `branch_id`, `user_id` | FKs, cascade | unique `(branch_id, user_id)` |
| `slot_step_minutes` | smallint default 15 | the grid step |
| `gap_minutes` | smallint default 0 | buffer after each booking |
| `is_paused` | bool default false | stops all new bookings |
| `max_days_ahead` | smallint nullable | override of branch setting |
| `min_notice_minutes` | smallint nullable | override of branch setting |

### 4.6 `barber_schedules`

`2026_10_09_000006_create_barber_schedules_table.php`

| column | type | notes |
|---|---|---|
| `tenant_id`, `branch_id`, `user_id` | FKs, cascade | |
| `weekday` | tinyint 0–6 | 0 = Sunday |
| `start_time`, `end_time` | time | |
| `is_active` | bool default true | |

Unique `(branch_id, user_id, weekday, start_time)`. **Multiple rows per
weekday** are expected: two windows express a split shift (10:00–14:00,
17:00–22:00), and a lunch break is simply the space between them.

Validation rejects `end_time <= start_time` and overlapping windows for the
same barber and weekday.

Branches have **no opening-hours columns** anywhere in the schema, so the
barber's schedule is the sole source of bookable time. There is no
branch-hours intersection to compute.

### 4.7 `barber_time_blocks`

`2026_10_09_000007_create_barber_time_blocks_table.php`

| column | type | notes |
|---|---|---|
| `tenant_id`, `branch_id`, `user_id` | FKs, cascade | |
| `starts_at`, `ends_at` | datetime UTC | |
| `is_full_day` | bool default false | |
| `reason` | string nullable | shown in the grid |
| `created_by` | FK users nullable | audit |

Index `(branch_id, user_id, starts_at)`.

One table serves all four blocking kinds the owner asked for: a single slot is
a narrow range, a window is a wider one, a day off sets `is_full_day`, and a
leave period is one row spanning days.

### 4.8 `bookings`

`2026_10_09_000008_create_bookings_table.php`

| column | type | notes |
|---|---|---|
| `tenant_id`, `branch_id` | FKs, cascade | |
| `barber_user_id` | FK users, restrict | |
| `customer_id` | FK customers nullable, null on delete | null for dashboard bookings |
| `guest_name`, `guest_phone` | string nullable | dashboard bookings |
| `source` | string | `app` / `dashboard` |
| `status` | string | `confirmed` / `completed` / `cancelled` / `no_show` |
| `starts_at`, `ends_at` | datetime UTC | |
| `duration_minutes` | smallint | basket total |
| `gap_minutes` | smallint | **snapshot** of the barber's gap at booking time |
| `total_price` | decimal(10,2) | |
| `currency` | tinyint | |
| `booking_code` | string unique | shown to the customer |
| `notes` | text nullable | |
| `is_forced` | bool default false | created with rule override |
| `created_by_user_id` | FK users nullable | set for dashboard bookings |
| `cancelled_at` | timestamp nullable | |
| `cancelled_by_customer` | bool nullable | who cancelled |
| `rescheduled_from_id` | FK bookings nullable | reschedule chain |

Indexes `(branch_id, starts_at)`, `(barber_user_id, starts_at)`,
`(customer_id, status)`.

Application-level invariant: a booking has either a `customer_id` **or** a
`guest_phone`. App bookings always have `customer_id`; dashboard bookings
always have `guest_name` + `guest_phone` and no `customer_id`, per decision 11.

### 4.9 `booking_items`

`2026_10_09_000009_create_booking_items_table.php`

`booking_id` (cascade), `service_id` nullable, `package_id` nullable,
`name_snapshot` json, `price_snapshot` decimal(10,2), `duration_snapshot` int,
`sort` smallint. Exactly one of `service_id` / `package_id` is set.

Prices, names and durations are **snapshotted at booking time**, so a later
catalog change never alters an existing booking (feature 06, Q4).

### 4.10 Never stored

- **Queue number** — derived: rank among that barber's non-cancelled bookings
  on that date, ordered by `starts_at`. A cancellation renumbers everyone
  automatically. Consistent with ADR 0004.
- **Slots** — no slot rows exist at any point.

### 4.11 Double-booking safety

MySQL cannot express an overlap constraint. Every booking write runs inside a
transaction that selects the barber's bookings for that date `FOR UPDATE`,
re-runs the overlap check against the locked set, then inserts. A losing
concurrent write gets a domain conflict error, not a duplicate.

## 5. Availability engine

`AvailabilityEngine::day(Branch $branch, User $barber, CarbonImmutable $date, int $basketDuration): DayAvailability`

1. Resolve settings: the barber's `barber_booking_settings`, falling back to
   the branch defaults per field. If `is_paused` → empty day.
2. Load that weekday's active `barber_schedules` windows. None → empty day.
3. Step each window by `slot_step_minutes` to produce candidate starts.
4. Keep a candidate only if **all** hold:
   - `start + basketDuration <= window end`;
   - the footprint `[start, start + basketDuration + gap)` overlaps no
     non-cancelled booking's own footprint;
   - it overlaps no `barber_time_blocks` row;
   - `start >= now + min_notice_minutes`;
   - `date <= today + max_days_ahead`.
5. Attach the **queue-number preview** to each remaining slot, so the slot
   picker can say "لو حجزت ٦:٣٠ م هيكون رقمك في الدور ٣" before the customer
   commits — the moment `BUSINESS.md` calls the product's differentiator.

An existing booking's footprint uses **that booking's stored `gap_minutes`**,
not the barber's current setting. Raising a barber's gap tomorrow therefore
never retroactively invalidates bookings already taken under the old gap.

Returned slots carry `starts_at`, `ends_at`, and `queue_number_preview`.

### 5.1 Caching

Caching the computed grid would require one entry per basket duration. Instead
`OccupancyCache` caches the **inputs**:

```
booking:occupancy:{branch_id}:{barber_id}:{date}
  → { windows[], booking_footprints[], blocks[] }   TTL 60s
```

The grid for any basket duration is computed from the cached occupancy in
memory. The key is deleted whenever a booking, time block, schedule or
settings row for that barber and date changes, so a slot someone just took
disappears immediately rather than at TTL expiry.

Redis is already configured (host port 6385 locally).

### 5.2 `BasketResolver`

Takes `service_ids[]` and `package_ids[]`, returns snapshot lines, total
duration and total price. Rejects any item that is inactive or belongs to
another branch. A package's duration is its `duration` override, else the sum
of its member services' durations. Services and packages may be mixed freely
(decision 8).

### 5.3 `QueueNumberProjector`

`for(Booking $booking): int` and `preview(barber, date, startsAt): int` — both
counting non-cancelled bookings for that barber and date with an earlier
`starts_at`, plus one.

## 6. Booking lifecycle

`BookingService` methods, each taking the day lock, re-validating, persisting,
busting the cache and firing its event:

- **`book(branch, barber, basket, startsAt, customer)`** — customer-initiated.
  Full rule validation. Status `confirmed`.
- **`createManual(branch, barber, basket, startsAt, guestName, guestPhone, notes, bool $override)`**
  — dashboard. With `$override` it skips the notice, window, block and overlap
  checks and sets `is_forced = true`, so the day board can flag the conflict.
  Without it, the same rules as `book`.
- **`reschedule(booking, startsAt, ?barber)`** — refuses past the branch
  cutoff; validates the new time excluding the booking itself; writes a new
  row linked by `rescheduled_from_id` and cancels the old one.
- **`cancel(booking, byCustomer)`** — refuses past the cutoff for customers;
  the tenant may cancel at any time.
- **`markCompleted(booking)`**, **`markNoShow(booking)`** — tenant only.

Status transitions: `confirmed → completed | cancelled | no_show`. Terminal
statuses do not transition further.

`BookingCreated`, `BookingCancelled` and `BookingRescheduled` are dispatched
with **no listeners in this build**. They are the seam the deferred
notifications feature (feature 05) plugs into without touching this code.

## 7. API

`central-app`, module `Booking`, `routes/api.php` loaded by its service
provider — the pattern `Branches/routes/api.php` already uses. Prefix
`api/v1`, middleware `SetApiLocale` plus throttling.

### 7.1 Public endpoints

| Method | Path | Returns |
|---|---|---|
| GET | `/branches/{branch}` | branch profile: name, address, images, geo, phone, maps url |
| GET | `/branches/{branch}/services` | active branch services, grouped by category |
| GET | `/branches/{branch}/packages` | packages, member services, `price`, `services_total`, `saving` |
| GET | `/branches/{branch}/barbers` | bookable, unpaused barbers + `next_available_date` |
| GET | `/branches/{branch}/availability` | `?barber_id&date&service_ids[]&package_ids[]` → day grid with `queue_number_preview` |

Public on purpose: a guest sees real slots before being asked for anything.

### 7.2 Authenticated endpoints (`auth:customer` + `ExtendCustomerToken`)

| Method | Path | Notes |
|---|---|---|
| POST | `/bookings` | `branch_id, barber_id, starts_at, service_ids[], package_ids[]` |
| GET | `/bookings` | the customer's bookings, `?filter=upcoming\|past` |
| GET | `/bookings/{booking}` | with derived queue number |
| POST | `/bookings/{booking}/cancel` | within the branch cutoff |
| POST | `/bookings/{booking}/reschedule` | `starts_at`, optional `barber_id` |

**These routes are not behind `customer.onboarded`.** That middleware is
registered as an alias in `CustomerServiceProvider` and applied to no routes
today; this design keeps it that way. An incomplete profile must never block a
booking.

Error shapes follow the existing `ApiError` contract (`message`, `code`,
`data`, `errors`) so `apps/web`'s axios instance needs no change. New codes:
`booking.slot_taken`, `booking.outside_hours`, `booking.blocked`,
`booking.too_soon`, `booking.beyond_horizon`, `booking.cutoff_passed`,
`booking.barber_paused`, `booking.invalid_basket`.

## 8. Guest auth flow

The owner's requirement: a guest confirms a booking with name + phone + OTP,
and the customer record is created behind the scenes.

Neither existing endpoint can serve this. `auth/register` **requires** a
password (`Password::min(8)->letters()->numbers()`), and `auth/otp` **rejects**
unregistered phones (`auth.phone_not_registered`). So one additive endpoint
bridges the gap:

**`POST /api/v1/auth/guest`** — `name`, `phone`, optional `channel`:

- phone belongs to an existing customer → issue a **Login** OTP challenge,
  identical to `auth/otp`;
- new phone → issue a **Register** challenge whose payload carries
  `first_name` / `last_name` and `password: null`.

The existing **`POST /api/v1/auth/otp/verify`** then handles both purposes and
already returns `AuthSessionResource` (customer + token). Its Register branch
is adjusted to tolerate a null password.

No migration is needed: `customers.password`, `first_name` and `last_name` are
all already nullable.

`name` arrives as a single field and is split on the first whitespace into
`first_name` and `last_name` (last name nullable). The customer can set a
password and finish their profile later from the account page; the booking is
already real.

The full register, password-login, OTP-login, social and reset flows are
untouched.

## 9. Tenant dashboard

`tenant-app`, Filament panel `app`, navigation group **الحجوزات**. Every screen
reads through `BranchContext`.

### 9.1 Barber schedule grid (custom Livewire page)

The centrepiece. One grid component, two modes:

- **Week mode** (default — the configuration task): one barber, columns are
  the 7 days, rows are time steps.
- **Day mode**: one day, columns are the branch's barbers, rows are time — the
  whole floor at a glance.

Cells render real state from `AvailabilityEngine`: **free**, **booked**
(customer name, spanning its true duration), **blocked** (with reason), or
**outside hours**. What the tenant sees is exactly what customers get, because
it is the same engine.

Interactions, mapping to decision 7:

- click a free cell → block that slot; click a blocked cell → unblock;
- drag across cells → block that window;
- day-header menu → **day off**, or clear the day's blocks;
- a date-range action for leave.

A **side panel per barber** holds weekly hours as repeatable windows per
weekday, `slot_step_minutes`, `gap_minutes`, the **pause** toggle, and the
optional days-ahead / min-notice overrides. Editing re-renders the grid
immediately, so the effect of a 20-minute gap is visible before saving.
Shortcuts: **copy to all weekdays**, **copy from another barber**.

Empty state: with no job type flagged `is_bookable`, the page says so and
links to the job types screen instead of rendering an empty grid.

Grid size is bounded — a 15-minute step over a 12-hour day is 48 rows × 7 days
= 336 cells.

### 9.2 Bookings resource

Branch-scoped table: date/time, barber, customer (name + phone), items,
duration, total, status, source, derived queue number. Filters: date range,
barber, status, source. Row actions: cancel, mark completed, mark no-show,
reschedule (opens the slot picker). Header action: create booking.

### 9.3 Manual booking form

Barber → date → engine slots → services and packages picker with running total
price and duration → free-text name + phone → notes. Shows the resulting queue
number before saving.

An **override switch** unlocks any time — outside hours, blocked, or
overlapping — behind an explicit warning naming the conflict. Such bookings are
stored with `is_forced = true`.

### 9.4 Day board

Per-barber timeline columns for the chosen day: cards sized by real duration, a
"now" line, conflict badges on forced overlaps, quick actions (completed,
no-show, cancel), and header counts. Polls every ~30 seconds. This is an agenda
view, not a live queue.

### 9.5 Packages resource

Branch-scoped CRUD: translatable name and description, member-services picker,
list price shown beside the **computed sum of member prices and the saving**,
optional duration override, active toggle, sort order.

### 9.6 Services — existing screen, now branch-scoped

`Service` gains `BelongsToBranch`, so the current resource lists the selected
branch's services. `CatalogImporter` imports catalog services **into the
selected branch**. No UI rewrite.

### 9.7 Branch booking settings

A Filament page for the branch-level windows and defaults from §4.4.

Permissions follow the existing Shield pattern: a permission set per resource
and page, policies registered in the module's service provider.

## 10. Web client (`apps/web`)

Per `apps/web/AGENTS.md` and the `web-data-access` skill, every path is
**Component → React Query hook → plain action → `apiClient` → Laravel**. No
`"use server"`, no `src/app/api/*` for first-party data.

### 10.1 Data layer

New plain-async actions and React Query hooks:

- `src/lib/actions/branches/branch-profile.action.ts`,
  `branch-catalog.action.ts`, `branch-barbers.action.ts`,
  `availability.action.ts`
- `src/lib/actions/bookings/bookings.action.ts` — **rewritten** from
  `"use server"` over in-memory arrays to real calls
- `src/lib/actions/auth/guest.action.ts`
- hooks under `src/lib/hooks/branches/`, `src/lib/hooks/availability/`,
  `src/lib/hooks/bookings/`

Mutations update the React Query cache in `onSuccess`. Laravel `snake_case`
maps to camelCase in the actions, as the existing `branch-mapper` does.

**Deleted:** `src/app/api/bookings/*`, `src/app/api/shops/[id]/availability`,
and the booking mock constants `slots.constants.ts`, `barbers.constants.ts`,
`bookings.constants.ts`, plus the service and salon portions of
`services.constants.ts` and `salon-details.constants.ts`.

### 10.2 Screens

1. **`/salon/[id]` is a branch page.** Real branch profile (gallery, info,
   phone, map), **services** grouped by category, a **new packages tab**
   showing member services and the saving, **barbers** (bookable and unpaused
   only).
2. **Booking flow `/book/[branchId]`** — the directory is renamed from
   `[salonId]`, since the parameter is a branch:
   - basket step: services **and** packages mixed, running total and duration;
   - barber step;
   - slot step: date strip plus engine slots, each showing its queue preview;
   - review → confirm: with no token, a name + phone sheet → OTP → token →
     `POST /bookings`, returning to the same draft rather than losing it;
   - confirmation: الميعاد + رقمك في الدور + booking code.
3. **`/bookings`** — real upcoming/past list with **cancel** and
   **reschedule** (reopening the slot picker for the same basket and barber),
   honouring the branch cutoff.

Arabic terms come from the locked glossary in `BUSINESS.md` (الصالون، الحلاق،
الخدمة، الميعاد، رقمك في الدور، احجز ميعاد). RTL logical properties throughout,
as the app already does.

### 10.3 Known limits in this build

- The branch page's **reviews tab stays mock-backed** — ratings are a deferred
  feature (feature 10).
- The home and search **`shops` mocks are untouched** — they belong to other
  features.

Requires `NEXT_PUBLIC_API_URL` and the web origin in `CORS_ALLOWED_ORIGINS`.

## 11. Docs to update

In `bltdreeg-plan/`:

- **`docs/domain-model.md`** — rewrite *Slot*, *Reservation*, *Queue*, *Skip*,
  *Postpone*; add *Booking*, *Barber schedule*, *Time block*, *Queue number
  (derived)*; record the branch-owned catalog.
- **`docs/features/01-customer-booking-and-live-queue.md`** — rewritten as
  appointment booking with a derived queue number.
- **`docs/features/03-opening-the-shop.md`**,
  **`docs/features/04-emergency-chair-disabling.md`** — marked **deferred**
  with a header note. Not deleted.
- **`docs/features/02-barber-profiles.md`** — barbers are employees with a
  bookable job type; the profile and rating parts stay deferred.
- **`docs/features/06-service-and-package-pricing.md`** — branch-owned catalog
  confirmed; package duration derivation documented.
- **`docs/adr/0006-appointment-booking-not-live-queue.md`** — **new**,
  recording decision 1 and its reasoning.
- **`plan/00-index.md`**, **`plan/tenant-dashboard.md`**,
  **`plan/shared-backend.md`**, **`plan/customer-app.md`** — booking tasks
  revised; the `chairs`, `slots` and `reservations` draft migrations retired in
  favour of §4.

In the repo root:

- **`BUSINESS.md`** — minimal correction: the queue number is derived from
  appointments, not a live chair queue.

## 12. Testing

Tests are written before the implementation they cover.

**Engine (`packages/core`)**
- slot step versus real basket duration;
- a basket overflowing the end of a window is not offered;
- each of the four block kinds removes the right slots;
- a paused barber yields an empty day;
- `min_notice_minutes` and `max_days_ahead` boundaries;
- split shifts produce two bands with a genuine gap between them;
- an existing booking's footprint uses its own stored `gap_minutes`, not the
  barber's current one.

**Concurrency**
- two simultaneous bookings for the same slot: one succeeds, the other gets
  `booking.slot_taken`.

**`BasketResolver`**
- cross-branch or inactive items rejected;
- package duration falls back to the sum of member services.

**Derivation**
- queue numbers renumber after a cancellation.

**API (`central-app`)**
- a feature test per endpoint in §7;
- `POST /auth/guest` for both the new-phone and existing-phone paths;
- a booking route returns 200, not 403, for a customer with incomplete
  onboarding.

**Scoping**
- branch A cannot read or write branch B's schedules, blocks, packages or
  bookings, in both the API and the panel.

**Migration**
- a tenant with 3 branches and N services fans out to 3N rows with nothing
  lost, and `down()` collapses cleanly.

**`apps/web`**
- `pnpm test` for the new mappers;
- `npx tsc --noEmit`;
- `npx eslint` on changed files.

## 13. Sequencing

The `services.branch_id` migration touches screens that already work, so it
lands **first, on its own**, verified green before any booking code. If the
fan-out needs adjusting, that happens in isolation.

1. `services` branch ownership + `BelongsToBranch` + CatalogImporter.
2. Packages (schema, model, tenant resource).
3. Bookable job types, branch settings, barber settings, schedules, blocks.
4. Availability engine + occupancy cache + basket resolver (+ tests).
5. Bookings schema, `BookingService`, queue projector.
6. Tenant schedule grid, bookings resource, manual booking, day board.
7. `central-app` public API + `auth/guest`.
8. `apps/web` wiring: branch page, booking flow, bookings list, reschedule.
9. Docs rewrite + ADR 0006.

## 14. Out of scope

Each is its own later feature; nothing here blocks them.

- The **live queue** and everything it needs: chairs, daily chair assignment,
  barber check-in/out, join-now, skip, postpone, emergency redistribution
  (features 01-queue, 03, 04).
- **QR proof** of visit and the app-sourced discount (feature 09).
- **Visits, billing, commission, invoices, payment gateway** (features 07, 08).
- **Notifications** (feature 05) — the domain events are the seam.
- **Ratings and ranking** (feature 10); the branch page's reviews tab stays
  mock-backed.
- **Barber public profiles** with photos and independent ratings (feature 02).
- **Online payment.** Cash at the salon.
- **The mobile apps** — `apps/customer-mobile` and
  `apps/bltdreeg_cutsomer_mobile` are not touched.
