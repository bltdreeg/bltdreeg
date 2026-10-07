# Batch 7: The rest (frames 31–37, 41, 42)

## Context

The last screens of the main journey, all reached from places that already exist: **rate a visit** (31) and **rating sent** (41) from a completed queue / past booking / notification; **notifications** (32 list, 33 empty) from the Home bell; **favorites** (34, 35 empty), **edit profile** (36), **notification settings** (37) and **help** (42) from the account tab. Every route already exists as a `ComingSoon` placeholder.

Sources: board `mobile.html` ~2538–3054 (31–37), ~3239–3370 (41, 42); Flutter `rating/*`, `notifications/*`, `favorites/*`, `account/presentation/{pages/{edit_profile_page,notification_settings_page,help_page},edit_profile_cubit,notification_settings_cubit}.dart`; Arabic copy from `core/localization/arb/app_ar.arb` where the board has none.

User approval: standing ("work without waiting for approvals", 2026-10-06).

## Board vs Flutter (copied to GAPS §2e)

| Frame | Difference | Board | Flutter | Outcome |
|---|---|---|---|---|
| 31 | Visit date | "النهارده ٧:٢٠ م" | day + time | "{day} الساعة {time}" (`useBookingLabels().timing`, same as the booking steps) |
| 31 | Time accuracy note | "قال ٢٠ د واستنيت ٢٥ د" | quoted wait at join vs served − joined | Flutter; mock adds `quoted_wait_minutes` + `served_at` (seeded 20 / 25 like Flutter) |
| 31 | Add photo | one button | camera / gallery sheet, max 3, thumbnails with × | Flutter (`expo-image-picker`, already in the build) |
| 31 | Not completed / already rated | not drawn | "التقييم لسه مش متاح" / straight to 41 | Flutter |
| 31 | Offline submit | not drawn | saved on the device, sent later (outbox) | Deviation: no outbox — the submit fails with a toast; outbox with the backend |
| 41 | Already a favorite | not drawn | "اتضاف للمفضلة" + filled heart, no button | Flutter |
| 32 | Highlight | queue items with a side stripe | only unread "حان دورك" / "فاضلك واحد" | Flutter |
| 32 | Tap | — | queue kinds → queue, rate reminder → rate, offer → salon; marks read | Flutter |
| 33 | Empty | drawn | same | Not device-checked: the mock always has Flutter's six |
| 07 | Bell dot | red dot | unread count > 0 | ✅ now live (was hidden until batch 7) |
| 34 | Closed salon button | "فكّرني لما يفتح" | "شوف الصالون" (no reminder feature) | Flutter |
| 34 | "ادخل الطابور" | joins | opens the salon page | Flutter |
| 34 | Closed thumb tag | "مقفول" on the thumb | — | Same as batch 3 (no tag; the wait line says "بيفتح الساعة…") |
| 34 | Data | — | favorites by id whatever the area | Flutter; mock `GET /salons?ids=` |
| 36 | Phone digits | Arabic-Indic, grouped | — | Our rule: the phone field stays Western (locked field too) |
| 36 | "غيّر الصورة" | changes the photo | toast "الصورة بتتغيّر من التقييمات دلوقتي" | Flutter (no avatar upload) |
| 36 | "غيّر الرقم" | — | opens help | Flutter |
| 36 | المنطقة | user field | user field | Deviation: our customer has no area → the row edits the device-selected area (same as Home) |
| 36 | Birth date picker | — | system date picker | Flutter; `@react-native-community/datetimepicker` (native, added) — iOS shows it inline (check in the iOS polish pass) |
| 37 | "إشعارات النظام مقفولة على موبايلك" | drawn | not shown | Flutter (no permission check; `expo-notifications` not installed) |
| 37 | Storage | — | device prefs | Flutter (`appPreferences`) |
| 42 | "شات مع الدعم" | row with "متاح دلوقتي" | not there (no chat) | Flutter |
| 42 | FAQ rows | chevron rows | inline accordion, one open, search filters | Flutter (`@rn-primitives/accordion`) |

## Tasks

- [x] **1. Copy:** `mobile.rate.*`, `mobile.ratingSent.*`, `mobile.notifications.*`, `mobile.favorites.*`, `mobile.profile.*`, `mobile.notificationSettings.*`, `mobile.help.*` in `ar.json` (board text; Flutter arb for what the board doesn't draw).
- [x] **2. Rating data + logic:** `POST /bookings/:id/rating` in `bookings.mock.ts` (completed only, once; sets the booking's `rating`), `GET /bookings/:id/rating`; `submitRating` action, `useSubmitRating` (invalidates my bookings + the booking). Pure `rating-form.ts` (overall pre-fills untouched details, comment cap 500, max 3 photos, `canSubmit`) + test.
- [x] **3. Rate visit (31):** top bar with "بعدين"; visit card; overall stars + label; detail rows (quality, cleanliness, time accuracy with "قال N د واستنيت N د"); tag chips; comment field; photos (`expo-image-picker`, already installed, max 3, remove); anonymous checkbox; sticky "ابعت التقييم". Not completed → message; already rated → rating sent.
- [x] **4. Rating sent (41):** illustration, title/body, salon card with your stars, "تضيفه للمفضلة؟" + "ضيفه للمفضلة" (hidden when already a favorite), "تمام، ارجعني للرئيسية".
- [x] **5. Notifications (32, 33):** mock `GET /me/notifications` (Flutter's six) + `POST /me/notifications/read`; type, action, hooks (`useNotifications`, `useMarkRead`); pure grouping (النهارده / الأسبوع ده / أقدم) + relative time + test; queue kinds with the side stripe; tap → queue / salon / rate; "علّم الكل كمقروء"; empty; unread dot on the Home bell (GAPS §2e row 07).
- [x] **6. Favorites (34, 35):** list of favorite salons sorted by wait (reuse `sortSalons`), wait line + "ادخل الطابور" (ghost when free, secondary otherwise), closed → "فكّرني لما يفتح" (Flutter behavior), note, empty → "اكتشف صالونات قريبة".
- [x] **7. Edit profile (36):** avatar, first/last name, locked phone + "متأكّد" + caption, email, birth date (native picker: `npx expo install @react-native-community/datetimepicker` — native module, so prebuild + `run:android` once), area (area sheet), "احفظ التعديلات" (`PUT /me`, updates `QK_USER`), "امسح حسابي" (`ConfirmDialog` → `DELETE /me` → signed out). Keyboard-safe form.
- [x] **8. Notification settings (37):** locked queue toggle ("دايماً شغّالة" + why), offers/reminders toggles, channels, system-permission notice. Store on the device like Flutter (or mock), `Toggle` from rn-primitives.
- [x] **9. Help (42):** search field filtering the FAQ, live-issue card, FAQ as `@rn-primitives/accordion` (install when the task starts), contact rows (chat, call 19245 via `callPhone`), about (terms, privacy, version).
- [x] **10. GAPS + device checks (emulator-5554) + review + checks**, review summary below.

## Files

| Task | Files |
|---|---|
| 1 | `src/i18n/messages/ar.json` |
| 2 | `lib/api/mock/bookings.mock.ts` + test, `lib/actions/booking/*`, `lib/hooks/booking/*`, `lib/utils/rating/rating-form.ts` + test |
| 3–4 | `screens/{rate-visit,rating-sent}/*` |
| 5 | `lib/api/mock/notifications.mock.ts`, `adapter.ts`, `lib/types/notification/*`, `lib/actions/notifications/*`, `lib/hooks/notifications/*`, `lib/utils/notifications/*` + test, `screens/notifications/*`, home top bar |
| 6 | `screens/favorites/*` |
| 7 | `screens/profile/*`, `lib/actions/auth/auth.action.ts`, `lib/hooks/auth/*`, `package.json` (datetimepicker) |
| 8 | `screens/notification-settings/*` |
| 9 | `screens/help/*`, `package.json` (accordion) |
| 10 | `GAPS.md`, `docs/build-roadmap.md`, `docs/HANDOFF.md` |

## Verification

- `tsc`, lint (0 errors), `pnpm test` (new: rating form, notification grouping).
- Emulator: past booking "قيّم دلوقتي" → rate (stars pre-fill, tags, comment, photo, anonymous) → sent → add to favorites → home; bookings shows your stars. Notifications: list, tap each kind, mark all read, bell dot, empty. Favorites: sorted, join queue, closed salon, empty. Profile: edit + save (account header updates), delete account dialog. Settings: locked toggle. Help: search, accordion, call.
- Screenshots at 6 sizes + 140%, keyboard open on profile, rate and help; one recording.

## Review summary

**Files:** `lib/utils/rating/rating-form.ts` (+ test), `lib/utils/notifications/notification-groups.ts` (+ test), `lib/types/notification`, `lib/api/mock/{notifications.mock.ts,bookings.mock.ts (+ test),salons.mock.ts,adapter.ts}`, `lib/utils/booking/booking-mappers.ts`, `lib/types/booking/queue-booking.interface.ts` (`quotedWaitMinutes`, `actualWaitMinutes`), `lib/actions/{booking,notifications,salons,auth}/*`, `lib/hooks/{booking/use-booking,notifications/*,favorites/use-favorites,auth/use-profile}`, `lib/utils/app-preferences.ts` (notification settings), `query-keys.constants.ts`, `screens/{rate-visit (+ __sections/rating-photos),rating-sent,notifications,favorites,profile,notification-settings,help}/*`, `screens/home/__sections/home-header.tsx` (bell dot), `components/organs/area-sheet` (moved from home), `components/organs/salon-card` (`Meta` exported, `action` slot), `ar.json`, `package.json` (+ datetimepicker, accordion), `GAPS.md`, `scripts/emulator/matrix-b7.sh`.

**Found and fixed in review:**
- Rate screen navigated during render when already rated → `<Redirect>`; submit no longer navigates itself (the rated booking in the cache redirects once).
- Rating-sent called `useFavoriteIds` conditionally (hook order) → unconditional.
- Profile toast rendered inside the keyboard scroll view (absolute = bottom of the content, invisible) → lifted to the screen.
- Favorites from the area catalog would hide favorites in other areas → `GET /salons?ids=` like Flutter's `watchSalons(ids)`.
- Favorites guest branch was dead code (`/account/favorites` is login-protected in `route-guards.ts`) → removed.
- `MetaLine` (batch 6) duplicated `salon-card`'s private `Meta` → `Meta` exported and reused; `MetaLine` deleted.
- `expo-image` (used nowhere else) → RN `Image` for photo thumbnails.
- A failed `expo install` while Metro held files left node_modules half-updated → Metro stopped, `pnpm install` against the lockfile, Metro restarted. Install with Metro stopped from now on.

**Checks:** `tsc` ✅ · lint 0 errors (8 baseline warnings) · tests 79/79 (new: rating form, notification groups, rating mock).

**Left open:** notifications empty state not device-checked (the mock always has six). The native date picker follows the device language (English on the emulator). The guest empty state is in two screens (bookings, notifications) — extract if a third appears. iOS shows the date picker inline — check on the EAS build. The `AreaSheet` move was done with `git mv`, so that rename is staged in the index (nothing committed).
