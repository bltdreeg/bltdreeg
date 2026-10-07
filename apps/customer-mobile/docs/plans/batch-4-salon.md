# Batch 4: Salon page (frames 21, 22, 23) and gallery (39)

## Context

The salon page is where a customer decides to join a queue. Frame 21's note is the requirement: the live queue state sits right under the name, and "ادخل الطابور" with the expected price is pinned at the bottom, so deciding needs no scrolling. It's one scrolling page with five sections (services, barbers, offers, reviews, hours) and pinned tabs that jump to each section (22, 23 show the collapsed header). The gallery (39) groups photos by purpose, not upload date.

Selected services go into a booking draft that batch 5 reads. Opening a salon records it for Home's "آخر صالونات شوفتها" (closes the batch 3 stub).

User approval: standing ("work without waiting for approvals", 2026-10-06).

## Board vs Flutter (goes to GAPS §2e)

| Frame | Difference | Board | Flutter | Outcome |
|---|---|---|---|---|
| 21 | Sticky bar with nothing selected | "خدمة واحدة · ٧٠ ج.م" though no row is selected | "اختار خدمة", button disabled | Flutter (the board's state is inconsistent) |
| 21 | Tabs | separate panes implied | one scroll, tabs jump + track the section | Flutter (22/23 show content of several tabs in one scroll) |
| 22 | Years label | "٦ سنين خبرة" / "٤ سنين" | always "… خبرة" | Flutter (consistent) |
| 23 | Day names | الأربع، التلات، الاتنين (colloquial) | Intl names (الأربعاء…) | Board |
| 39 | Counts | 12 photos, place 4, all 13 | 7 work + 5 place + 1 video = 13 | Flutter (board numbers don't add up) |
| 21 | CTA target | → barber (24) | → time slot (Flutter-only step) | **NEEDS DECISION** before batch 5; built as → barber (board journey), both screens are still placeholders |

## Tasks

- [x] **1. Types:** `lib/types/salon/salon-page.interface.ts` ported from Flutter `salon_details.dart`: `SalonPage { summary, address, phone, latitude, longitude, chairsActive, serviceGroups, barbers, offers, ratingBreakdown, reviews, hours, gallery, reviewPhotos }`, `SalonService`, `SalonBarber` (working queue | off with `returnsOn`), `SalonReview`, `DayHours`, `GalleryItem`. Offers reuse the web `SalonOffer`. The web `Barber`/`Review`/`Service` don't fit (no day-off date, no photos/reply/barber id, web menu categories) — noted in GAPS.
- [x] **2. Mock:** `salon-details.mock.ts` (`GET /salons/:id`, 404 for unknown) built on the catalog so the page and the lists agree (s1 = board content, others generated), ported from `salon_details_remote.dart`; `favorites.mock.ts` (`GET /favorites`, `PUT`/`DELETE /favorites/:id`, needs a token, starts with s1, s3, s5). `salons.mock.ts` exposes `salon(id)` and `perPerson(id)`. Test: details for s1 match the board; unknown id → 404; barbers' queues follow the salon's.
- [x] **3. Data path:** actions `getSalonPage`, `getFavoriteIds`, `setFavorite`; hooks `useSalonPage(id)` (`refetchInterval` 15 s, like Home), `useFavoriteIds()` (only with a session), `useToggleFavorite()` (optimistic). Stores: `booking-draft.ts` (selected services per salon, `useSyncExternalStore`), `recently-viewed.ts` (newest first, max 10; Home's `lastSeen` puts them first).
- [x] **4. Pure logic + tests:** `screens/salon/__lib/salon-labels.ts`: status line (free / people + minutes / hour / closed + opens / stale), barber line, offer expiry days, hours rows (7 days starting today, "النهارده — …", closed = "إجازة"), review filter, draft total. One test file.
- [x] **5. Copy:** `ar.json` `mobile.salon.*` (board text; Flutter arb for states the board doesn't draw), day names.
- [x] **6. Screen** `screens/salon/salon.screen.tsx` + `__sections/`: hero (gallery placeholder 216, back/share/heart, "١٢ صورة"/"فيديو" chips → gallery), compact bar (fades in, name + "المعادي · فاضي دلوقتي"), info (name, meta, status card, directions/call), tabs (in-flow + pinned copy, jump + active tracking), services (+ / ✓ toggle), barbers (+ note), offers (discount dashed, bundle with strike-through, loyalty dots), reviews (summary + 3 bars + filter chips + cards with reply), hours, booking bar, skeleton. States: skeleton, not found, load error, offline without data (`NoConnection`), offline with data (stale status, join disabled).
- [x] **7. Gallery:** `screens/salon-gallery/` (frame 39: close, title + counts, filter chips, video tile, 2-column grid with "+N", review photos) and `screens/salon-photo/` (pager with counter, close).
- [x] **8. Favorite button:** heart with pop (`motion.ts`) + haptic; guest → login with `from`.
- [x] **9. GAPS:** §2e rows, §2c the slot decision, §7-style batch 4 verification table.
- [x] **10. Device checks** (emulator-5554 only) and **11. review + checks**, review summary below.

## Files

| Task | Files |
|---|---|
| 1 | `src/lib/types/salon/salon-page.interface.ts`, `index.ts` |
| 2 | `src/lib/api/mock/{salon-details,favorites}.mock.ts` + test, `salons.mock.ts`, `adapter.ts`, `src/lib/utils/salons/salon-mappers.ts` |
| 3 | `src/lib/actions/salons/salons.action.ts`, `src/lib/actions/favorites/favorites.action.ts`, `src/lib/hooks/salons/*`, `src/lib/hooks/favorites/*`, `src/lib/utils/{booking-draft,recently-viewed}.ts`, `query-keys.constants.ts`, `src/screens/home/__lib/home-sections.ts` |
| 4 | `src/screens/salon/__lib/salon-labels.ts` + test |
| 5 | `src/i18n/messages/ar.json` |
| 6, 8 | `src/screens/salon/salon.screen.tsx`, `src/screens/salon/__sections/*` |
| 7 | `src/screens/salon-gallery/*`, `src/screens/salon-photo/*` |
| 9 | `GAPS.md` |

## Verification

- `tsc`, lint (0 errors), `pnpm test` (new: details mock, salon labels).
- Emulator (force-stop + relaunch): Home card → salon page; status card live (changes with drift); tabs jump to each section and the active tab follows scrolling; compact bar fades in; services toggle and the bar shows count + total; join → booking (guest → login first); heart: guest → login, signed in → toggles and survives a refresh; directions and call open the system apps; share sheet; gallery filters and "+N"; photo pager; not found (`/salon/xyz`); offline with data and without.
- Screenshots: 320, 360, 393, 430, 820×1180, 1180×820, 140% font (top, mid, reviews/hours, gallery).
- One recording: Home → salon → tabs → select 2 services → gallery → back.

## Review summary

Done 2026-10-07.

**Built:** salon page (`screens/salon/` + 9 sections) as one scroll with in-flow and pinned tabs that jump to and track each section; compact top bar fading in on scroll; services toggle into `booking-draft`; barbers, offers, reviews (filters + salon reply), hours from today; booking bar → barber placeholder. Gallery (39) with filters, video tile, collapsed grid "+N"; photo viewer with counter. Favourite button (guest → login with `from`, optimistic toggle, pop + haptic). Mocks: `GET /salons/:id` (404 unknown), favorites GET/PUT/DELETE. Recently viewed now feeds Home's "آخر صالونات شوفتها".

**Found and fixed while reviewing:**
- The last section (hours) never became active, because it can't reach the tab line → scrolled-to-bottom counts as the last section.
- Photo viewer opened on the wrong photo in RTL (Android flips FlatList offsets) → pager is LTR and mounts once items exist (GAPS D8).
- "+N" overlay and video duration reordered in RTL → wrapped in `f.ltr()`.
**Checks:** `tsc` 0 · `expo lint` 0 errors (8 old warnings in `shop-*` types) · `pnpm test` 56/56 (new: details mock, salon labels).

**Device (emulator-5554):** GAPS §8 — all ✅. Open: at 140% font the active tab can sit off-screen in the tab strip (polish batch).

**Evidence (scratchpad):** `b4/m/sheet-salon-ar.png`, `b4/m/sheet-gallery-ar.png` (6 sizes each), `b4/x/f140.png`, `rec/6-salon.mp4` (Home → salon → 2 services → 5 tab jumps → gallery → "+N" → back).

**Decisions for you:** D7 (join → barber vs Flutter's slot step; built → barber), D8 (photo swipe direction). Both in GAPS §2c.
