# HANDOFF — customer-mobile (state 2026-10-07, end of session 2)

## Files to read first (in order)

1. `docs/HANDOFF.md` (this file)
2. `docs/build-roadmap.md` — the whole plan: how every step works (plan file → tasks → review → summary), the rules, the batch table and what goes to the user at every review stop
3. `docs/plans/batch-6-bookings-search-account.md` — the current step
4. `AGENTS.md` — app structure and conventions
5. `GAPS.md` — decisions, board vs Flutter rows, open questions
6. As needed: `docs/plans/batch-5-booking.md` (last finished step, patterns to copy)

## 1. Project

- **What:** بالتدريج / Beltadreeg customer app (walk-in barber queue + appointments). Arabic-only Expo app, built batch by batch from `docs/build-roadmap.md`.
- **Where:** `E:\bltdreeg\apps\customer-mobile` (monorepo `E:\bltdreeg`, branch `mobile-app`).
- **Stack:** Expo SDK 57, RN 0.86 (new arch), React 19.2 + React Compiler, expo-router, Reanimated 4.5 + react-native-worklets, use-intl, TanStack Query, axios + mock adapter, SecureStore, `useSyncExternalStore` stores, `@rn-primitives/{switch,checkbox,radio-group,tabs,alert-dialog,portal}` 1.5.2, `@gorhom/bottom-sheet`, react-native-gesture-handler, expo-haptics, expo-keep-awake.
- **Truth order:** board `apps/web/Beltadreeg customer app design/mobile.html` wins on layout/visuals/copy → Flutter app `apps/bltdreeg_cutsomer_mobile/lib` wins on journey/logic/data/states the board doesn't draw (Arabic copy: `lib/core/localization/arb/app_ar.arb`). Anything neither covers → NEEDS DECISION row in `GAPS.md`.
- **Architecture:** `src/app` route files are one-line re-exports → `src/screens/<name>/<name>.screen.tsx` + `__sections/`, `__lib/` (pure logic + `*.test.ts`). Shared UI `src/components/{atoms,molecules,organs}`. Data: hook (`src/lib/hooks`) → action (`src/lib/actions`) → `apiClient` → mock (`src/lib/api/mock/*.mock.ts`, registered in `adapter.ts`). Mocks return raw snake_case; mappers in `src/lib/utils/**/…-mappers.ts`.
- **Commands (from `apps/customer-mobile`):** `npx tsc --noEmit` · `npx expo lint` (0 errors; 8 old warnings are baseline) · `pnpm test` (node test runner) · Metro `pnpm start` (port 8090; `curl localhost:8090/status`).
- **Android:** emulator `Pixel_9` = `emulator-5554` ONLY (start: `"$LOCALAPPDATA/Android/Sdk/emulator/emulator.exe" -avd Pixel_9 -no-snapshot-save`). `adb reverse tcp:8090 tcp:8090`. Package `com.beltadreeg.customer`. Git Bash: `export MSYS_NO_PATHCONV=1`. Dev client is installed; no native deps were added this session (alert-dialog/portal are JS-only).

## 2. Rules (never change)

- Emulator only; never the USB tablet `R52R30FZQHP`.
- Arabic only: new copy in `src/i18n/messages/ar.json` under `mobile.*`; **never edit `en.json`**. Board copy exactly; otherwise Flutter arb; never invent.
- `StyleSheet` + tokens only; no Tailwind/NativeWind; no UI kit / `@expo/ui`. Interactive parts on `@rn-primitives/*`, visuals our own, sheets via `components/organs/sheet`.
- Logical RTL props; digits through `fmt()`/`useFormat()`; motion only from `src/theme/motion.ts`; dev-only inside `__DEV__`; mock everything with Flutter's fake data.
- No commits/pushes unless asked.
- Per step: plan `docs/plans/<step>.md` → tasks in order, ticked → review diff → checks → review summary in the plan → GAPS rows. **Work autonomously** (no waiting for approvals). Ponytail mode (laziest correct code, reuse first).
- Run `npx tsc --noEmit`, `npx expo lint`, `pnpm test` after each task.

### Conventions learned
- Plurals `{count, plural, =1 {…} other {… {n} …}}`, pass `n` pre-formatted. `~N`, `+N`, `−N` wrapped in `f.ltr()`. Salon names via `salonName()` (RLM).
- Don't put "·" next to Arabic-Indic digits (٠ looks like it) → day+time is "النهارده الساعة ١٢:٣٠ م".
- `Text` forces Cairo line height 1.875×; for big numbers-only text pass `digits`.
- Android: centered custom-font text in an `alignItems:center` parent can clip → `alignSelf: "stretch"`; a Text whose weight changes in place can clip → key it.
- `absolute` children ignore SafeAreaView padding (add `insets.top`).
- Mutations whose `onSuccess` unmounts the caller: use `mutateAsync().then`, not `mutate` callbacks.
- React Compiler lint: no `Date.now()` in render, no ref access in render (use Reanimated shared values in gesture callbacks).
- Tested files import with relative `.ts` paths.

## 3. Roadmap status (6 build steps)

| Step | Status |
|---|---|
| Step 0 groundwork | ✅ |
| Batch 3 Home (07, 08, 18, 40) | ✅ |
| Batch 4 Salon (21–23, 39) | ✅ |
| Batch 5 Booking → queue (24–30 + Flutter slot step) | ✅ closed (plan ticked, review summary, GAPS §2e rows, GAPS §9, roadmap updated) |
| Batch 6 Bookings, Search, Account (09–17, 43) | ✅ closed (plan ticked, review summary, GAPS §2e rows + §10) |
| Batch 7 rate 31/41, notifications 32–33, favorites 34–35, edit profile 36, notification settings 37, help 42 | ✅ closed (plan ticked, review summary, GAPS §2e rows + §11) |
| Batch 8 Flutter UI gaps (skeleton shimmer, app-wide toast, link/session/area toasts, OTP success + haptics, salon pull-to-refresh) | ✅ `docs/plans/batch-8-flutter-gaps.md` |
| Batch 10 storage + quality (kv-store prefs with SecureStore migration, Cairo embedded, layering lint rule, toast bus) | ✅ `docs/plans/batch-10-storage-quality.md` |
| Batch 11 polish (animated onboarding D4, joined check 26, initials, avatar ring, `MetaBar`, 140% tab strip) | ✅ `docs/plans/batch-11-polish.md` |
| Batch 12 review leftovers (copy drift → Flutter wording, recursive copy audit, frame 33 checked, skeleton RTL fix) | ✅ `docs/plans/batch-12-review-leftovers.md` |
| Later: language 38 (English batch), auth batch (forgot password D3, complete-profile #7, OTP D5/D6), icon/splash (needs a ≥1024 logo), iOS (needs `eas init` + build) | waiting on the user |

## 4. Done this session

### Batch 5 (closed)
- **User decision D7 = B (2026-10-07):** Flutter's "امتى تحب تيجي؟" step comes before the barber. Recorded in GAPS D7, §2e row 21, plan, roadmap.
- Journey: salon bar → `/salon/[id]/book/slot` (now / schedule: 7 day chips, closed days off, الصبح/بعد الضهر/بالليل, taken struck) → `/book/barber?start&free&barber` (any / named; at a slot: فاضي · time / مش فاضي) → `/book/review?start&barber` (time row, wait range or appointment card, policy, totals, confirm) → `/booking/[id]/confirmed` (queue number or appointment card; "تابع دورك" / "حجوزاتي") → `/queue/[id]` (waiting, amber approaching + banner, your turn countdown, postpone toast, check in, in service, completed, missed, cancelled, upcoming + "الغي الحجز").
- Mock `bookings.mock.ts`: queue (20 s steps, lazy), slots (`GET /salons/:id/slots?day&minutes`: 30 min steps, 20 min lead, holds, stable busy hash, off barbers), `POST /bookings` (`start_at` → upcoming / `slot_taken`), check-in/postpone/leave (leave on upcoming frees the hold), `GET /me/bookings` with seeded history.
- Shared parts added: `organs/booking-step`, `organs/confirm-dialog` (alert-dialog + `PortalHost` in `app/_layout.tsx`), `molecules/toast` (`useToast`), `RadioCard`/`RadioDot`, `SalonThumb`/`salonName`, `utils/external-links.ts` (`openDirections`, `callPhone`), `fmt.dayMonth/date`, `utils/day-keys.ts` (`dayKey`, `nextDays`, `dayMs`), icons sun/sunset/moon, `hooks/booking/use-booking-labels.hook.ts`.
- Removed duplicate `waitRange` (kept `lib/utils/format/wait-status.utils.ts`).
- Device: full matrix 320/360/393/430/820/1180 + 140% passed after fixes; recording `b5-booking.mp4` (session scratchpad, not in repo). Scripts: `scripts/emulator/steps-booking.sh` (`NOWAIT=1` skips the final wait), `scripts/emulator/matrix-booking.sh <outdir>`.

### Batch 6 (closed) — `docs/plans/batch-6-bookings-search-account.md` (review summary inside)
- Bookings 09–11, search 12–15 + filter sheet, account 16/17/43. Account header reads `GET /me` (`getMe` + `useCurrentUser`, `QK_USER`). `useLogout` clears the cache `onSettled`. `MetaLine` (board `.meta .bar`) in booking cards. GAPS §2e rows + §10. Matrix script `scripts/emulator/matrix-tabs6.sh <out>` (must start signed in; signs out at the end).

### Batch 7 (closed) — `docs/plans/batch-7-the-rest.md` (review summary inside)
- Rate 31 + sent 41 (`POST /bookings/:id/rating`, quoted/actual wait on the booking), notifications 32/33 (mock + bell dot), favorites 34/35 (`GET /salons?ids=`), profile 36 (`PUT`/`DELETE /me`, datetimepicker, shared `AreaSheet`), notification settings 37 (`appPreferences`), help 42 (`@rn-primitives/accordion`).
- New native module `@react-native-community/datetimepicker` → dev client rebuilt with `cd android && ANDROID_SERIAL=emulator-5554 ./gradlew :app:installDebug -PreactNativeArchitectures=x86_64` (JAVA_HOME/ANDROID_HOME as in §1; Metro keeps running on 8090).
- Matrix script `scripts/emulator/matrix-b7.sh <out>` (signed in, fresh mock; signs out at the end).

### Checks at end of session
`tsc` ✅ · lint 0 errors (8 baseline warnings) · tests 79/79.

## 5. Next action
Batches 8, 10, 11 and 12 are closed (plans + review summaries in `docs/plans/`). Waiting on the user: decisions in GAPS §2b (B1–B8), §2c (D1–D8), §2 #11; `eas init` + the iOS build; a ≥1024 logo. Next build work they can pick: the auth batch (D3, #7, D5, D6) or English (38). Ask the user what's next from the roadmap's "Later" list: 38 language (English batch), forgot password (D3), polish (D4 onboarding animation, D6, icon/splash, iOS checks on the EAS build, avatar ring, one shared `.meta .bar` atom, 140% salon tab strip).
Pitfalls learned: **install packages with Metro stopped** (pnpm hits ENOENT on files Metro holds and leaves node_modules half-updated; then `pnpm install` reconciles). After `wm density reset` or a force-stop, a launch can open the dev-client launcher — tap "localhost:8090". `adjustsFontSizeToFit` cuts Cairo labels on Android — don't use it. Toasts must render outside scroll views.

## 7. Known gaps / risks
- In-memory mocks (bookings, holds, favorites, drafts) reset on relaunch; `coldstart.sh` clears them.
- `uiautomator dump` fails while the "لايف" pulse or the your-turn countdown runs → set `settings put global animator_duration_scale 0` (+ transition/window) for scripted runs (Reduce Motion stops the pulse) and restore to 1, or tap by coordinates.
- `wm density` change restarts JS only sometimes; build state after setting density. Salon page at 360×640: start swipes above the bottom booking bar (y≈1000) and don't scroll services under the pinned tabs.
- Barber selection isn't reset if a named barber goes off while the step is open (server → `barber_unavailable`).
- Avatar initials "م ا" vs board "م س" (polish). 140% salon tab strip active tab off-screen (polish). OTP D5/D6. Photo viewer swipe direction D8.
- Open decisions (don't re-ask, recommendations in GAPS): B1–B8, D1–D6, D8.

## 8. User decisions (don't re-ask)
Roadmap top to bottom · emulator only · work autonomously (plans + summaries still written) · Arabic only, English frozen · no Tailwind · rn-primitives for interactive, own visuals · mock everything with Flutter data · identity fixed · Arabic-Indic digits · **D7 = Flutter slot step (2026-10-07)** · ponytail mode full.
