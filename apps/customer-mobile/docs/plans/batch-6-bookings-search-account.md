# Batch 6: Bookings, Search, Account (frames 09–17, 43)

## Context

The three remaining tabs. **Bookings** (09 current, 10 past, 11 empty) lists the customer's bookings: the live queue card stands apart (teal, big number, one button), appointments get an outlined card, past visits can be rated or rebooked with the same choices. **Search** (12 default, 13 results + applied filters, 14 filter sheet, 15 no results) searches the selected area's catalog on the device, like Flutter's `SalonMatcher`, with recent searches. **Account** (16 signed in, 17 sign-out dialog, 43 guest) groups the settings and says what a guest can't do instead of walling the app off.

Sources: board frames 09–17, 43 (`mobile.html` ~897–1560, 3371–3460); Flutter `booking/presentation/{pages/bookings_page,bookings_cubit}.dart`, `booking/data/booking_remote.dart` (`_seedHistory`, `fetchMine`), `search/presentation/{pages/search_page,search_bloc,widgets/filter_sheet}.dart`, `salons/domain/{entities/search_criteria,services/salon_matcher}.dart`, `account/presentation/{pages/account_page,account_cubit}.dart`.

User approval: standing ("work without waiting for approvals", 2026-10-06).

## Board vs Flutter (goes to GAPS §2e)

| Frame | Difference | Board | Flutter | Outcome |
|---|---|---|---|---|
| 09 | Second card | "مستني تأكيد الصالون" + "إلغاء" | appointment card "معاد محجوز" (no salon confirmation step); cancel opens the booking | Flutter (no pending state exists) |
| 09 | Active card colors | note says dark; drawn teal tint | teal tint | Board drawing = Flutter |
| 10 | Past caption | weekday + date + time | day + month + time (the weekday pushes the badge off) | Flutter |
| 10 | Rebook | same salon, service, barber | same services + barber in the draft, starts at the time step | Flutter (time step = D7) |
| 12 | Nearby list | 4 rows | every salon in the area, by wait | Flutter |
| 14 | Price slider | two thumbs | `RangeSlider`, 5 EGP steps | Own component (`@rn-primitives/slider` is single-value) — deviation from the component rule |
| 14 | Days | 4 chips | 4 chips (today + 3) | same |
| 15 | Actions | clear filters + widen to 10 km | same, each only when it can help | Flutter |
| 16 | Language row | shown | shown | Hidden (English freeze) |
| 16 | Rows' values | — | bookings "N شغّالة", favorites count | Flutter |

## Tasks

- [x] **1. Bookings data:** `GET /me/bookings` (auth) in `bookings.mock.ts` with Flutter's three past visits (`bk-past-1` completed not rated, `bk-past-2` completed rated 5, `bk-past-3` missed); `rating` (overall stars, null) on the raw booking + `QueueBooking`. `getMyBookings` action, `useMyBookings()` (refetch 5 s while one is running), `QK_MY_BOOKINGS`; confirm / queue actions invalidate it. Pure `bookings-list.ts` (`splitBookings`: active queue first then appointments by time; past newest first) + test.
- [x] **2. Rebook:** `bookingDraft.set(salonId, services)`; "احجز تاني بنفس الاختيارات" fills the draft and opens the slot step with `barber=`; the slot step passes it on, the barber step starts on it (Flutter `rebook`).
- [x] **3. Copy:** `mobile.bookings.*`, `mobile.search.*`, `mobile.account.*` in `ar.json` (board text, Flutter arb for the rest).
- [x] **4. Bookings screen (09–11):** title, `SegmentedTabs` الحالية / السابقة, active queue card, appointment card, past card (badge + date, salon row, rate prompt / your rating, rebook), notify note, empty (current → "دوّر على صالون قريب منك" → search; past), loading, error / offline.
- [x] **5. Search logic:** `salon-matcher.ts` (`matchesQuery` with stop words / "ال" / aliases, `applyCriteria`, `suggestions` by bigram similarity) reusing `normalizeArabic` + `sortSalons`; `SearchCriteria` type with floor/ceiling/radius; recent searches store (SecureStore, max 8, newest first). Test.
- [x] **6. Search screen (12, 13, 15):** search field (disabled offline) + filter button with count; applied filter chips + "امسح الكل"; idle (recent chips + "قريب منك دلوقتي" by wait); results ("N صالونات فيها …", "داخل ٥ كم"); no results (clear filters / widen to 10 km / "يمكن تكون بتقصد"); offline bar; home "شوف الكل" params (`sort`, `open`).
- [x] **7. Filter sheet (14):** `Sheet` with sort chips (single), service chips (multi, ✓), 4 day chips, price `RangeSlider` (new molecule on gesture-handler + reanimated, a11y adjustable), "مفتوح دلوقتي بس" `Toggle`, footer "امسح الكل" + "اعرض N نتايج" (live count).
- [x] **8. Account (16, 17, 43):** signed in (avatar, name, phone, عدّل, 2 stat cards, groups حسابي / التطبيق / مساعدة, sign out + version), sign-out `ConfirmDialog` (body names the salon when a queue is running), guest (card + login, locked rows with "مقفول", allowed rows, app group). Dev rows stay inside `__DEV__`.
- [x] **9. GAPS + device checks (emulator-5554) + review + checks**, review summary below.

## Files

| Task | Files |
|---|---|
| 1 | `lib/api/mock/bookings.mock.ts` + test, `lib/utils/booking/{booking-mappers,bookings-list}.ts` + test, `lib/types/booking/queue-booking.interface.ts`, `lib/actions/booking/booking.action.ts`, `lib/hooks/booking/use-booking.hook.ts`, `query-keys.constants.ts` |
| 2 | `lib/utils/booking-draft.ts`, `screens/{booking-slot,booking-barber}/*` |
| 3 | `src/i18n/messages/ar.json` |
| 4 | `screens/bookings/*` |
| 5 | `lib/utils/salons/salon-matcher.ts` + test, `lib/utils/recent-searches.ts` |
| 6–7 | `screens/search/*`, `components/molecules/range-slider/*` |
| 8 | `screens/account/*` |
| 9 | `GAPS.md` |

## Verification

- `tsc`, lint (0 errors), `pnpm test` (new: bookings list, matcher).
- Emulator: bookings empty (guest → login first; fresh account has the 3 past visits) → join a queue → current tab card with live number → track; appointment card; past: rate prompt vs rated stars vs missed; rebook → slot step with the services. Search: idle → type "بربر" → results; filters (count on the button, chips, remove one, clear all); sheet count preview; no results → clear / widen / suggestion; home "شوف الكل" opens sorted; offline. Account: signed in groups + stats, sign out dialog with and without a running queue, guest state.
- Screenshots at 6 sizes + 140%; one recording.

## Review summary

**Files (batch 6):** `lib/api/mock/bookings.mock.ts` (+ test), `lib/utils/booking/{booking-mappers,bookings-list}.ts` (+ test), `lib/types/booking/queue-booking.interface.ts`, `lib/actions/{booking/booking.action,auth/auth.action}.ts`, `lib/hooks/{booking/use-booking,auth/use-current-user,auth/use-logout}.hook.ts`, `query-keys.constants.ts`, `lib/utils/{booking-draft,day-keys,recent-searches}.ts`, `lib/utils/salons/salon-matcher.ts` (+ test), `screens/{bookings,search,account}/**`, `screens/{booking-slot,booking-barber}/*` (rebook), `components/molecules/{range-slider,chip,settings-group}`, `components/atoms/text` (`digits`), `components/organs/salon-card` (`price`), `app/_layout.tsx` (recent searches load), `ar.json`, `GAPS.md`, `scripts/emulator/matrix-tabs6.sh`.

**Found and fixed in review:**
- `useLogout` cleared the cache only on success, but the action clears the token in `finally` → an offline sign-out left the last user's bookings/user in cache. Now `onSettled`.
- Booking meta used "·" next to Arabic-Indic digits (our own rule) and the board draws thin bars → `MetaLine` with `.meta .bar`, one line, only the services part shrinks.
- No-results buttons were 52/16 and clipped at 320; the board draws them at 48 → `size="md"`. (Tried `adjustsFontSizeToFit` on `Button` first: on Android it cuts custom-font labels — reverted.)
- Version line digits went through `f.ltr()` (Arabic-Indic like the board).
- `salon-matcher` re-parsed day keys → reuses `dayMs`.
- Dev-only "Log out (dev)" removed (real sign-out exists); "Design system" stays in `__DEV__`.

**Checks:** `tsc` ✅ · lint 0 errors (8 baseline warnings) · tests 78/78 (2 of them are batch 7's new pure tests).

**Left open:** avatar border (board has a 1px teal ring; `Avatar` has none — polish). The `bar` style is now inlined in 4 places (salon card, salon info, barbers, booking cards) — fold into one atom in the polish batch. Mock data resets on relaunch (known).
