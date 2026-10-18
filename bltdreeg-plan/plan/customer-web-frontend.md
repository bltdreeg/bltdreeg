# Customer Web (apps/web) — Current State & Roadmap

Snapshot taken 2026-10-18 from `main` (`d595d7d`). Scope: the Next.js customer
web app in `apps/web` only (not the Flutter/Expo mobile apps, not Filament panels).

---

## 1. Current state

### Stack
Next.js 16.3 (App Router, `proxy.ts` instead of middleware), React 19.2,
TanStack Query 5, axios, next-intl 4 (ar default + en, RTL), Tailwind 4 +
shadcn / Base UI, react-hook-form + zod, Atomic folders
(`components/atoms|molecules|organs`), route-local `__components` / `__sections`.

### Health
| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm test` (node test runner) | ✅ 72/72 pass |
| `npx eslint src` | ❌ 5 errors, 19 warnings (see §5) |

### Backend available today (central-app `/api/v1`)
- **Auth**: options, register, password login, OTP send/resend/verify, social,
  forgot / verify / reset password, logout.
- **Me**: `GET/PUT/DELETE /me`, `PUT /me/password`, phone change + verify,
  email resend + verify, location estimate + update.
- **Geo**: governorates, cities, resolve(lat,lng).
- **Branches**: `GET /branches/nearby`.
- **Nothing yet** for salon/branch detail, services, barbers, slots, bookings,
  queue, favorites, reviews, offers.

### Page-by-page status (10 pages from BUSINESS.md)
| # | Page | UI | Data source |
|---|---|---|---|
| 10 | Auth (login / register / OTP / forgot / onboarding) | ✅ done | ✅ **real API** |
| 1 | Home | ✅ done | 🟡 mixed — "Nearby branches" real, every other rail uses `shops.constants` mock |
| 2 | Search & filters | ✅ done | 🔴 mock (`/api/shops` stub + `filter-shops.utils`) |
| 3 | Salon page | ✅ done | 🔴 mock (`salon-details`, `services`, `barbers`, `reviews`, `offers` constants) |
| 4 | Favorites | ✅ done | 🔴 mock (`/api/favorites` stub) |
| 5 | Booking flow (service → barber → slot → review) | ✅ done | 🔴 mock + `"use server"` actions |
| 6 | Booking confirmation | ✅ done | 🔴 mock |
| 7 | My bookings (upcoming / past / empty) | ✅ done | 🔴 mock |
| 8 | Booking details / live tracking | ✅ done | 🔴 mock + **demo `SimulationControlBar` shipped in the page** |
| 9 | My account (profile / language / help) | ✅ done | 🟡 `useUser` hook exists, but `account/page.tsx` and `account/profile/page.tsx` render the mock `currentUser` |

Summary: **the whole UI is built; only auth, onboarding/location and nearby
branches are wired to Laravel.** Everything else is a mock that waits for a
backend endpoint.

---

## 2. Issues found

### High — correctness / user-visible
1. **Account pages show a fake user.** `src/app/[locale]/(app)/account/page.tsx:17`
   and `account/profile/page.tsx:13` use `currentUser` from
   `lib/data/user.constants` instead of `useUser()` (the `/me` endpoint already
   exists). A logged-in customer sees someone else's name/phone.
2. **Nearby branches are a dead end.** `components/molecules/branch-card/branch-card.tsx`
   is not a link, and the salon page only knows mock shop IDs — a real branch
   can't be opened.
3. **Demo simulation shipped in production UI.** `bookings/[id]/__components/live-tracking-view/simulation-control-bar.tsx`
   is rendered unconditionally in `live-tracking-view.tsx:361`. Gate it behind
   `NODE_ENV !== "production"` / a `?demo=1` flag, or remove it once the queue
   API exists.
4. **Hardcoded demo content inside components**, e.g.
   `booking-detail-view.tsx:347` (services/prices string),
   `auth-brand-panel.tsx:44` (salon name), `global-error.tsx` (not translated —
   acceptable there since it renders outside the intl provider, but it should
   at least be bilingual).
5. **Mock-booking fallback** in `lib/actions/bookings/bookings.action.ts`
   invents a booking for any `bk-*` ID — any URL "works", which hides bugs.

### Medium — architecture drift from `apps/web/AGENTS.md`
6. **Legacy data path still present**: `src/app/api/*` route handlers (shops,
   bookings, favorites, cities, queue-status, user/area), `lib/utils/api/fetcher.ts`,
   `lib/data/constants/api-routes.constants.ts`, and hooks using `fetcher`
   (`use-shops`, `use-reviews`, `use-queue-status`, `use-create-booking`,
   `use-city`). The rule says these get converted when the backend exists.
7. **`"use server"` actions** in `bookings.action.ts`, `reviews.action.ts` and
   `book/[salonId]/review/page.tsx` — forbidden by AGENTS.md for first-party data.
8. **Duplicate concepts**: `use-city.hook.ts` + `/api/cities` + `cities.constants`
   overlap with the real `geo` hooks (`use-governorates`, `use-cities`).
   "Shop" (mock) vs "Branch" (real API) naming coexists — pick **branch** to
   match the backend domain.
9. **~25 empty `// TODO` placeholder files** (`lib/redis/*`, `lib/store/*`,
   `lib/schema/*`, `lib/routes/route.config.ts`, `lib/contexts/booking-context.tsx`,
   `lib/actions/{shops,favorites}.action.ts`, `hooks/use-debounce`, `use-mobile`,
   `use-bookings`, `use-shop-availability`, `utils/errors/extract-error-message.ts`,
   `utils/index.ts`). `lib/redis` in particular makes no sense in a browser-only
   client. Delete or implement; don't leave them.
10. **Tests only cover `lib/`** (pure utils). No component/integration tests,
    no E2E for the auth → onboarding → booking path.

### Low — polish
11. `next.config.ts` rewrites `/booking/:id/rate → /bookings/:id/rate` — legacy
    alias; confirm nothing links to it, then drop.
12. `BranchCard` uses `unoptimized` images because Laravel storage isn't in
    `images.remotePatterns` — add the API host to `remotePatterns` and remove
    `unoptimized`.
13. Stray files in `apps/web`: `hero.png`, `shot.py`, an untracked
    `package-lock.json` next to `pnpm-lock.yaml` (pick one package manager).
14. Product scope tension: BUSINESS.md says "no live queue as discovery" and
    "no map", while `plan/customer-app.md` CA-C1 has "Join queue now" and the
    search page has a "nearby now" block. Confirm before building CA-C1 on web.

---

## 3. Recommended roadmap

Order follows backend readiness: wire what exists now, then pair each new
backend endpoint with its frontend slice.

### Phase 0 — Clean-up (no backend needed, ~1–2 days)
- [x] Account + profile pages → `useUser()`; add loading/error states. (#1)
- [x] Profile: wire existing endpoints not yet used on web —
      change password (`PUT /me/password`), change phone (`/me/phone` + verify),
      email verify/resend, delete account (`DELETE /me`).
- [x] Gate or remove `SimulationControlBar`. (#3) — dev or `?demo=1` only
- [~] Remove hardcoded demo strings; move to i18n. (#4) — header, auth panel, no-results,
      global error done; booking/search/home mocks go away with Phases 1–2
- [x] Delete empty TODO files and `lib/redis`. (#9)
- [x] Replace `use-city` / `/api/cities` with the geo hooks. (#8) — `cities.constants`
      stays until the area grid gets real data (Phase 1)
- [x] `remotePatterns` for Laravel storage. (#12)
- [ ] Pick pnpm or npm; remove stray files. (#13) — needs a decision
- [x] Fix the 5 ESLint errors (§5) so lint can gate CI. Added `.github/workflows/web.yml`.

### Phase 1 — Discovery on real data (needs CA-B1 backend: branch feed + branch detail)
- [ ] Rename domain types `Shop` → `Branch` across hooks/types/components.
- [ ] `branches.action.ts`: `getBranches(filters)`, `getBranch(id)`;
      hooks `useBranches`, `useBranch` — follow the `web-data-access` skill.
- [ ] Home rails, search & filters, salon page → real data; make `BranchCard`
      a link to `/salon/[id]`.
- [ ] Salon page tabs (services / barbers / reviews / info) from branch detail.
- [ ] Delete `/api/shops*`, `shops.constants`, `salon-details`, `services`,
      `barbers`, `offers` mocks as each one is replaced.
- [ ] SSR/SEO for salon pages (server-fetched metadata, OpenGraph image) —
      salon pages are the shareable, indexable surface.

### Phase 2 — Booking (needs CA-C2 backend: slots + reservations)
- [ ] Slot list with the queue-number preview ("لو حجزت 6:30 م هيكون رقمك في الدور 3")
      — the product's differentiating moment; get this exactly right.
- [ ] `createBooking` mutation replacing the `"use server"` action; handle
      slot-taken / capacity conflicts with clear UI.
- [ ] Confirmation, my bookings (upcoming/past), cancel, rebook → real API.
- [ ] Delete `/api/bookings*`, `bookings.constants`, `slots.constants`,
      `fetcher.ts`, `api-routes.constants.ts`.

### Phase 3 — Live tracking (needs CA-C1/C3 backend: queue position, events)
- [ ] `useQueueStatus` → real endpoint; start with the existing 30 s polling,
      upgrade to Reverb / Pusher websockets when the backend broadcasts.
- [ ] Running late / on time, "your turn", leave queue, postpone once,
      service change — map each to its backend action.
- [ ] Remove the simulation entirely.

### Phase 4 — Engagement
- [ ] Favorites (needs endpoint) — optimistic toggle with React Query.
- [ ] Ratings after a completed visit (CA-E2) — replace `reviews.action.ts`.
- [ ] Notifications inbox + preferences (CA-E1), Web Push via service worker.
- [ ] Final bill view (CA-D2).

### Cross-cutting (run alongside the phases)
- **Testing**: add Playwright E2E for login → onboarding → book → confirmation;
  component tests (Vitest + Testing Library) for booking stepper and OTP form.
- **CI**: run `tsc`, `eslint`, `test`, `next build` on every PR touching `apps/web`.
- **Error & empty states**: every real-data page needs loading / empty /
  error / offline states (skeletons already exist — reuse them).
- **Accessibility & RTL**: audit focus order in sheets/dialogs, `aria-*` on
  stepper and slot grid, logical CSS only, test English (LTR) layout too.
- **Performance**: Lighthouse on home/search/salon on a mid-range Android
  profile (Egypt market = mobile-first, slower networks); lazy-load galleries.
- **Observability**: Sentry (or similar) for client errors + `ApiError` codes.
- **PWA**: there is already an offline page/banner — add a manifest and
  service worker so "app download" isn't the only install path.

---

## 4. Suggested next step

Start with **Phase 0** — it is all frontend, unblocks nothing on the backend,
and fixes the only user-visible bug among the real-data pages (fake account
data). In parallel, agree the **branch feed + branch detail** API contract
with the backend so Phase 1 can start as soon as it lands.

---

## 5. Lint (`npx eslint src` → 5 errors, 19 warnings)

Errors (fix in Phase 0, then make lint a CI gate):
- `react-hooks/set-state-in-effect` — `search/__components/filter-sheet/filter-sheet.tsx:69`,
  `[locale]/error.tsx:25`, `lib/hooks/favorites/use-favorites.hook.ts:17`,
  `lib/hooks/use-online.hook.ts:28`. Use `useSyncExternalStore` for
  `navigator.onLine` / `localStorage`, and derive state instead of syncing it.
- `@typescript-eslint/no-explicit-any` — `favorites/__components/favorite-mobile-card/favorite-mobile-card.tsx:74`.

Warnings: 14 × `no-unused-vars`, 4 × React Compiler `library` notices,
1 × `@next/next/no-img-element`.
