# Review plan: Beltadreeg customer mobile app (React Native)

**For:** Gemini 3.8 Flash, as the reviewer.
**Your job:** review the whole app and write every bug or note into one file, `docs/review/REVIEW-FINDINGS.md`.
**Do not:** change code, fix anything, commit, push, install packages, or run `expo prebuild`. This is a read-and-report task. The only file you create or edit is `REVIEW-FINDINGS.md`.

Work through the phases in order. Each phase lists what to read, what to check, and the commands to run. When a check fails, write a finding (format in §4) and keep going. Don't stop at the first problem.

---

## 1. Context you need first

### 1.1 What the app is

Beltadreeg (بالتدريج) is a barber-queue app for Egypt. A customer finds a salon nearby, joins its live queue (or books a time), follows their place in the queue, and rates the visit afterwards.

- **The app:** `E:\bltdreeg\apps\customer-mobile`, built with:
  - Expo SDK 57 and React Native 0.86 (new architecture);
  - React 19.2 with the React Compiler;
  - expo-router, TanStack Query, use-intl;
  - Reanimated 4 with worklets, react-native-gesture-handler, @gorhom/bottom-sheet, @rn-primitives.
- **Arabic only, RTL.** English is frozen (GAPS.md §0). All Arabic copy lives in `src/i18n/messages/ar.json` under `mobile.*`.
- **No backend yet** beyond auth and `/me`. Everything else runs on a mock API, `src/lib/api/mock/*`, which is on by default (`EXPO_PUBLIC_API_MOCK !== "0"`).
  - Demo login: phone `01023456789`, any OTP code `1234`, or email `karim.abdelrahman@gmail.com` / `barber2026`.

### 1.2 Sources of truth, in priority order

| Topic | Wins | Where |
|---|---|---|
| Layout, spacing, colours, Arabic copy | **The design board** | `E:\bltdreeg\apps\web\Beltadreeg customer app design\mobile.html` (43 numbered frames, labels like `<i>١٩</i>`) |
| User journey, navigation, logic, states the board doesn't draw | **The Flutter app** | `E:\bltdreeg\apps\bltdreeg_cutsomer_mobile\lib\` (routes: `core/router/app_router.dart`; copy: `core/localization/arb/app_ar.arb`) |
| API contract | **The Laravel server** | `E:\bltdreeg\apps\bltdreeg-server\central-app\app\Modules\V1\Customer\Auth\` (routes in `routes/api.php`) |
| Decisions already taken, deliberate differences, known gaps | **GAPS.md** | `apps/customer-mobile/GAPS.md` |

### 1.3 Read before reviewing

1. `apps/customer-mobile/AGENTS.md`: structure and data-access rules.
2. `apps/customer-mobile/GAPS.md`, all of it. **Anything already listed there is known.** Don't report it again unless the code contradicts what GAPS says. Pay attention to:
   - §2e (board vs Flutter per frame, deliberate deviations);
   - §3 (blocked on backend);
   - §5 (quality);
   - §6–§12 (what was already device-verified).
3. `apps/customer-mobile/docs/HANDOFF.md` and `docs/build-roadmap.md`.
4. The batch plans in `docs/plans/` (step 0, batches 3–13), mainly the "Review summary" and "Left open" sections at the bottom of each.

### 1.4 Code conventions you must not flag as bugs

- **`ponytail:` comments** mark deliberate shortcuts. Each names the limit and when to upgrade. Flag one only if the shortcut is **wrong today** (it causes a bug now), not because it's simple.
- **Arabic comments in code** are intentional (team language).
- **Structure:**
  - `src/app/*` files are one-line re-exports of `src/screens/<name>/<name>.screen.tsx`.
  - Route-local parts live in `__components/`, `__sections/` and `__lib/`.
- **Data flow is strict:** component → hook (`lib/hooks/<domain>`) → action (`lib/actions/<domain>`) → `apiClient` → server or mock. ESLint enforces it (`eslint.config.js`, `no-restricted-imports`). **Do flag** any component or screen that bypasses it.
- **Styling:** `StyleSheet.create` plus tokens from `src/styles/tokens.ts`; timings from `src/theme/motion.ts`. Hard-coded colours or durations outside those files are worth a **note**, not a bug.
- **Salon photos** come from `src/lib/data/salon-photos.ts`. These are demo images (copied from the web app) until the API sends real ones, and a real `imageUrl` always wins. This is intentional.
- **Work in progress:** the loading-skeleton files may be mid-edit by someone else (`components/atoms/skeleton`, `home-skeleton`, `salon-skeleton`, favorites, search). Review them, but if something looks half-done, say "may be in progress" in the finding.

---

## 2. Setup and automatic checks (phase 0)

Run from `E:\bltdreeg\apps\customer-mobile` (Git Bash or PowerShell):

```bash
npx tsc --noEmit          # expect: no output
npx expo lint             # expect: 0 errors (8 known warnings: unused imports in lib/types + axios-instance)
pnpm test                 # expect: 87 tests, 0 fail
python scripts/emulator/copy_audit.py   # copy audit: Arabic strings vs board + Flutter ARB
npx expo-doctor           # dependency/config sanity (report anything it flags)
```

For each command, record the exact result in the findings file's "Automatic checks" table.
- Any TypeScript error, lint **error** or failing test is a 🔴 finding.
- `copy_audit.py` should report "neither" only for strings GAPS already lists:
  - `offline.bar`;
  - `notifications.loadFailed`;
  - the 6 new forgot/new-password strings under `auth.*`.

  Anything else in "neither" is a 🟡 copy finding.

If you can run the app (optional; only if an Android emulator named `emulator-5554` is available, **never a physical tablet**):

```bash
pnpm start                 # Metro on port 8090
adb -s emulator-5554 reverse tcp:8090 tcp:8090
```

Deep links use the `beltadreeg:///` scheme, for example `adb -s emulator-5554 shell am start -a android.intent.action.VIEW -d "beltadreeg:///salon/s1" com.beltadreeg.customer`. If you can't run it, do a static review only and say so at the top of the findings.

---

## 3. Review phases

For every screen:
1. Open the route file in `src/app/`, then the screen in `src/screens/`, then its `__sections`/`__components`, the hooks it uses, the actions, and the mock handlers they reach.
2. Compare it with the matching board frame, using the frame number in the screen's top comment.
3. Compare it with the Flutter page, using the page name in the top comment.

### Phase 1: app shell, routing and session

Files:
- `src/app/_layout.tsx`, `src/app/index.tsx`, `src/app/(tabs)/_layout.tsx`, `src/app/(auth)/_layout.tsx`;
- `src/lib/utils/route-guards.ts` (+ test), `src/lib/hooks/use-session.hook.ts`, `src/lib/utils/auth/token-storage.ts`;
- `src/i18n/config.ts`, `src/lib/contexts/providers.tsx`.

Check:
- [ ] **Cold start.** The splash hides only after locale, token, prefs and recent searches have loaded. A failure in any of them still shows the app (`.catch`), with no endless splash.
- [ ] **RTL on first launch.** Look for the `forceRTL` + `reloadAppAsync` flow; RTL must apply without a manual restart.
- [ ] **Onboarding guard.** `Stack.Protected guard={!onboardingSeen}`; after "تخطّي" or finishing, you can't go back to onboarding.
- [ ] **Login redirect.** `LoginRedirect` + `requiresLogin`:
  - every route that needs a session is covered (compare with Flutter `AppRoutes.protectedRoutes`);
  - `from` round-trips;
  - `safeReturnPath` blocks external or `//host` URLs.
- [ ] **Deep links.** Every `beltadreeg:///…` path in Flutter's `app_routes.dart` has a matching file in `src/app/`. List any missing.
- [ ] **Phone vs tablet orientation lock** in `_layout.tsx` (shortest side < 600).
- [ ] **401 handling** (`src/lib/api/axios-instance.ts`): token cleared, the "session expired" toast shown once, and no loop of 401s.
- [ ] Anything that could render `null` forever, or throw during the first render.

### Phase 2: auth (frames 04–06, 19–20, plus forgot password)

Screens: `login`, `register`, `otp`, `forgot-password`, `new-password`.
Shared: `components/organs/auth-parts`, `components/organs/form-screen`, `components/molecules/otp-input`, `components/molecules/text-field`.
Logic: `lib/hooks/auth/*`, `lib/actions/auth/auth.action.ts`, `lib/utils/auth/*`, `lib/api/mock/auth.mock.ts` (+ test).

Check:
- [ ] **Login, email tab:**
  - validation messages;
  - wrong credentials shows the board text;
  - "نسيت كلمة السر؟" opens `/forgot-password`.
- [ ] **Login, phone tab:** Egyptian mobile validation (010/011/012/015, 11 digits); unregistered phone gives the "اعمل حساب" message; the code goes to OTP.
- [ ] **Register:**
  - names (min length), phone, optional email, password rules (8+ characters, one digit, shown by `PasswordRules`), terms required;
  - `phone_taken` shown on the phone field.
- [ ] **OTP:**
  - code length comes from the challenge;
  - auto-submit when complete;
  - wrong code: error + attempts left + the countdown still visible (D5);
  - lockout message;
  - resend disabled until the countdown ends;
  - success: green cells, a haptic, and navigation after `successHold`;
  - the button stays loading during the success hold, so no double submit.
- [ ] **OTP with `purpose=reset_password`:** it verifies through `useVerifyResetCode` and moves to `/new-password` with the token.
  - Is passing the token as a route param acceptable (memory only, 10-minute single use)? Write a **security note** with your view.
- [ ] **New password:**
  - rules turn red on an early save;
  - success signs in, shows the toast `auth.passwordChanged`, and replaces to `/home`;
  - no token → redirect to `/forgot-password`.
- [ ] **Back navigation** in the forgot flow: can the user land on the OTP screen again after reset, or on `new-password` with a used token? Report what happens.
- [ ] **Mock vs server.** Compare `auth.mock.ts` against the PHP controllers (`OtpController`, `PasswordResetController`, `PasswordLoginController`, `RegisterController`): field names, error codes, status codes. Any mismatch means the app breaks when the real server is connected, so it's a 🔴 or 🟠 finding.
- [ ] **`useAuthErrorText`.** Every error code the server can return for these endpoints (look in `lang/ar/customer_auth.php` and the controllers) either has a mapped message or falls back sensibly.
- [ ] **Keyboard:** at 360×640 and 140% font, the focused field and the button stay visible (`keyboardOffset` per screen).

### Phase 3: Home (frames 07–09), notifications, area sheet

Screens: `home` (+ `__sections`, `home-skeleton`), `notifications`.
Organs: `area-sheet`, `salon-card` (`SalonRailCard`, `SalonListItem`, `SalonImage`, `SalonThumb`, `Meta`, `MetaBar`).
Logic: `lib/hooks/salons`, `lib/api/mock/salons.mock.ts`, `lib/utils/salons/*`, `lib/utils/recently-viewed.ts`.

Check:
- [ ] The "شوف الكل" targets match GAPS §2e row 07.
- [ ] The rails, "مرشّح ليك" and "آخر صالونات شوفتها" logic match Flutter.
- [ ] The empty area state, the load-error state, and pull to refresh.
- [ ] **Area sheet:**
  - search and plurals;
  - the location permission flow (denied, granted, nearest area picked, `area.located` toast);
  - the keyboard lifts the sheet.
- [ ] The bell's unread dot.
- [ ] **Notifications:**
  - grouping by day;
  - mark all read;
  - tapping each type goes to the right place;
  - empty state (frame 33);
  - error state.
- [ ] **Salon images:** a real `imageUrl` wins over the demo fallback. The same salon shows the same image on home, search, favorites, the salon page and the booking cards.

### Phase 4: Salon page, gallery, photo viewer (frames 21–23, 39)

Screens: `salon` (+ `__sections`: header, info, services, barbers, offers, reviews (also holds the hours), booking-bar, skeleton), `salon-gallery`, `salon-photo`.
Logic: `lib/hooks/salons`, `lib/api/mock/salon-details.mock.ts` (+ test), `lib/data/salon-photos.ts`, `lib/hooks/use-swipe-pager.hook.ts`.

Check:
- [ ] **Header:**
  - the hero image, the photo/video chips and the dots;
  - the sticky top bar fades in on scroll;
  - the status bar is light over the photo and dark once the white bar shows;
  - after opening another screen on top and coming back, the status bar is correct (`useIsFocused`).
- [ ] **Tabs** (الخدمات / الحلاقين / العروض / التقييمات / المواعيد): scroll-spy and the active tab centred (`UnderlineTabs`), including at 140% font.
- [ ] **Services:** selecting a service enables "ادخل الطابور"; the price/duration summary is right.
- [ ] **Reviews:** filters (all, 5 stars, with photos, per barber) and counts add up.
- [ ] **Hours:** the "open now" badge and closed state, and `opensAt` handling.
- [ ] **Share / call / directions:** URLs, and the `cantOpenApp` toast on failure.
- [ ] **Gallery:**
  - kind chips and counts (7 work + 5 place + 1 video = 13);
  - collapsed to 4 tiles with "+N";
  - opening a tile passes the right `index` and `kind`.
- [ ] **Photo viewer (`useSwipePager`):**
  - opens on the tapped photo;
  - in RTL a rightward swipe goes to the next photo;
  - the counter is right;
  - resistance at the ends;
  - with a `kind` filter the index refers to the filtered list;
  - reduced motion still works;
  - **performance:** every page renders at once (the `ponytail` note says ≤ 20). Is that fine for the mock's counts?
- [ ] `useSwipePager` is shared with onboarding. Check `onUpdate`/`onEnd` use `page` correctly (closure over render state, `.runOnJS(true)`).

### Phase 5: Booking → queue → rating (frames 24–32, 40–41)

Screens: `booking-slot`, `booking-barber`, `booking-review`, `booking-confirmed` (+ `queue-joined-art`), `queue` (+ `tracking`, `after-turn`), `rate-visit` (+ `rating-photos`), `rating-sent`.
Logic: `lib/hooks/booking`, `lib/actions/booking`, `lib/api/mock/bookings.mock.ts` (+ test), `lib/utils/booking/*`, `lib/utils/booking-draft.ts`, `lib/utils/rating/*`, `components/organs/booking-step`.

Check:
- [ ] **Draft:** services carry from the salon page to slot → barber → review; going back keeps choices; leaving clears the draft.
- [ ] **Slot:** day chips, the available times, closed days, and queue vs appointment.
- [ ] **Barber:** "any barber" vs a specific barber (GAPS B6).
- [ ] **Review:**
  - totals;
  - confirm sends a `request_id` (idempotency), with no double booking on a double tap;
  - errors from the mock (`booking.*` codes) are shown.
- [ ] **Confirmed:** the joined animation; the haptic fires once; reduced motion shows the static art.
- [ ] **Queue:**
  - polling every 5 s, stopping when you leave the screen or the app goes to background;
  - "your turn" and the after-turn states;
  - cancel with confirm dialog;
  - the "late" state.
- [ ] **Rating:**
  - overall plus three criteria;
  - tags, a comment of at most 500 characters, up to N photos from camera or gallery (permission denied?);
  - anonymous;
  - submit → sent;
  - back from "sent" doesn't reopen the form;
  - a booking that is already rated goes straight to "sent".
- [ ] Every mock rule in `bookings.mock.ts` has a matching UI message.

### Phase 6: Bookings, Search, Favorites, Account (frames 10–18, 34–38, 42–43)

Screens: `bookings` (+ `booking-cards`), `search`, `favorites`, `account` (+ `guest-account`), `profile`, `notification-settings`, `help`, `language` (frozen, coming soon), `design-system` (dev only).
Logic: `lib/hooks/favorites`, `lib/hooks/notifications`, `lib/utils/recent-searches.ts`, `lib/utils/app-preferences.ts`, `lib/utils/device-prefs.ts`, `lib/utils/migrate-pref.ts`.

Check:
- [ ] **Bookings:** upcoming, active and past cards; badges; actions (rebook carries services and barber, rate, cancel); the guest view.
- [ ] **Search:**
  - recent searches (dedupe, max 6, persisted);
  - "قريب منك دلوقتي";
  - filter sheet (sort, services, days, price range with `RangeSlider`, open now, live count);
  - no-results actions;
  - offline lock.
- [ ] **Favorites:** add/remove from the salon page and the cards; the closed-salon state; empty state; skeleton.
- [ ] **Account:** guest vs signed in; logout dialog; delete account (what happens to local prefs?).
- [ ] **Profile:**
  - the "متأكّد" badge is centred in the phone field;
  - edit names, email and birth date (date picker);
  - area;
  - save gives a haptic and a toast;
  - "غيّر الرقم" and "غيّر كلمة السر" go to Help (known, GAPS #8).
- [ ] **Notification settings:** toggles persist after an app restart (kv-store).
- [ ] **Help:** FAQ accordion (one open), search filter, call, terms/privacy links, app version.
- [ ] **Prefs migration** (`migrate-pref.ts`): old SecureStore values move to kv once and are removed; tokens stay in SecureStore.

### Phase 7: onboarding and shared components

Screens: `onboarding` (+ `onboarding-art`, `page-dots`).
Components: everything in `src/components/atoms`, `molecules` and `organs`.

Check:
- [ ] **Onboarding:**
  - three slides;
  - in RTL a rightward swipe goes forward;
  - "تخطّي" jumps to the last slide and fades;
  - the CTAs (guest → home, "عندي حساب" → login);
  - the art plays only on the active slide, and reduced motion shows the final frame.
- [ ] **Accessibility basics on every interactive component:**
  - `accessibilityLabel`/`accessibilityRole` on icon-only buttons;
  - touch targets ≥ 44 dp (`Pressable visualSize`);
  - hidden pages and decorations marked `accessibilityElementsHidden`;
  - live regions on errors.
- [ ] **Font scaling:** `maxFontSizeMultiplier` where text could overflow, and nothing clipped at 140% (GAPS lists the screens that were checked).
- [ ] **Skeleton** (`components/atoms/skeleton`): the sheen sweeps left → right in RTL; nothing animates under reduced motion. The fill logic (`SkeletonFill`) may be work in progress (§1.4).
- [ ] **Toast:** `ToastHost` + `toast-bus`; a toast shows above the tab bar; known limit: it can't sit above a `Sheet`.
- [ ] **Sheet** (`organs/sheet`): the known workaround is `BottomSheet` inside an RN `Modal`. Check that back-button close, keyboard inputs (`TextField inSheet`) and a backdrop tap all work.
- [ ] **Badge:** no `alignSelf` override; it's centred in every row it's used in.

### Phase 8: cross-cutting quality

- [ ] **Layering:** search `src/components`, `src/screens` and `src/app` for imports of `@/lib/actions` or `@/lib/api` (type-only imports are allowed), and `src/lib` for imports of `@/components`, `@/screens` or `@/app`.
- [ ] **React Query:**
  - query keys come from `lib/data/constants/query-keys.constants.ts`;
  - every mutation that changes server data invalidates or updates the right queries (favorites, bookings, notifications, the user);
  - no `staleTime: Infinity` on data that changes.
- [ ] **Effects and timers:** every `setInterval`/`setTimeout`/listener is cleaned up (look for `setTimeout` without clear in screens that can unmount, e.g. OTP `successHold`).
- [ ] **Reanimated/worklets:**
  - no JS-only variables captured in worklets (the default-parameter trap is noted in batch 11);
  - `scheduleOnRN` used for JS calls from worklets;
  - no shared-value reads during render.
- [ ] **Lists:** long lists use `FlatList`/`FlashList` with stable keys; there are no `.map` inside `ScrollView` for unbounded data.
- [ ] **Images:** expo-image with `contentFit`; the 9 demo JPEGs are ~750 KB in all (fine).
- [ ] **Offline:** `use-online.hook.ts` + `no-connection`; which writes fail offline and how the user is told (an outbox is a known gap).
- [ ] **Security:**
  - tokens only in SecureStore;
  - nothing secret in `app.json`/`.env`;
  - deep-link params validated (`safeReturnPath`);
  - no tokens or PII in `console.log`.
- [ ] **Dead code:** unused exports and files, leftover `console.log`, and commented-out blocks.
- [ ] **Copy:** no English shown to users outside dev screens; numbers, prices and times go through `useFormat` (Arabic-Indic digits, except phone numbers, which are Western on purpose).
- [ ] **app.json:** id, name, icons, splash and plugins (`expo-sqlite`, `expo-font` with Cairo). Compare with GAPS #13.
- [ ] **Release build:** `android/app/build.gradle` signs release with the debug keystore. Write it down as a **note** (needs a real keystore before the Play Store).

### Phase 9: Flutter parity sweep

- [ ] List every route in `bltdreeg_cutsomer_mobile/lib/core/router/app_router.dart`; next to each, put the RN route and ✅/❌.
- [ ] For each Flutter page, scan for states (loading, empty, error, offline) and actions; note any the RN screen lacks **that GAPS doesn't already list**.
- [ ] Compare `app_ar.arb` keys used by Flutter screens against `ar.json` for texts the RN app shows differently. The copy audit covers most of this; add only what it misses.

---

## 4. How to write findings

Create `docs/review/REVIEW-FINDINGS.md` with this structure:

```markdown
# Review findings: customer-mobile

Reviewer: Gemini 3.8 Flash · Date: <YYYY-MM-DD> · Mode: static only | static + emulator

## Summary
- 🔴 Critical: N · 🟠 High: N · 🟡 Medium: N · 🔵 Note: N
- Top 3 things to fix first: …

## Automatic checks
| Check | Result |
|---|---|
| tsc | … |
| lint | … |
| tests | … |
| copy audit | … |
| expo-doctor | … |

## Findings

### F-001 🔴 <short title>
- **Where:** `src/path/file.tsx:123` (+ other places)
- **Area:** Phase N: <name>
- **What happens:** concrete steps or inputs → wrong result (or crash)
- **Expected:** what the board / Flutter / server says (cite the frame number, Flutter file, or PHP file)
- **Why it matters:** user impact
- **Suggested fix:** one or two sentences; don't write the code
- **Confidence:** confirmed (ran it / traced it fully) | likely | unsure

### F-002 …

## Flutter parity table (phase 9)
| Flutter route | RN route | Status | Note |

## Checked and fine
Short bullet list of the areas you reviewed with no findings, so the team knows they were covered.
```

**Severity:**
- 🔴 **Critical:** crash, data loss, a security hole, a broken core flow (can't log in, can't join the queue, can't book), or a mismatch with the real server that will break on connection.
- 🟠 **High:** a wrong result in a main flow, a state that's missing so the user gets stuck, or a timer, subscription or memory leak.
- 🟡 **Medium:** wrong copy, a layout or RTL bug, an accessibility gap, or an edge case.
- 🔵 **Note:** code quality, a suggestion, or something to watch, with no current user impact.

**Rules for findings:**
- One finding per root cause. If the same bug shows in several files, list all locations in one finding.
- Every finding needs a file path and line. "Somewhere in booking" isn't a finding.
- Say how you know (traced the code, ran the app, compared with board frame X). Mark guesses as `Confidence: unsure`.
- Don't repeat what GAPS.md already lists (§1.3), unless the code now contradicts it.
- Don't report style preferences (naming, formatting, Arabic comments, `ponytail:` shortcuts that work).
- Write in plain English. Quote Arabic UI text exactly when it's part of the finding.

---

## 5. Order and time budget

| Order | Phase | Share of effort |
|---|---|---|
| 1 | Phase 0: setup and automatic checks | 5% |
| 2 | Phase 1: shell, routing, session | 10% |
| 3 | Phase 2: auth (including the server comparison) | 15% |
| 4 | Phase 5: booking → queue → rating | 15% |
| 5 | Phase 4: salon, gallery, viewer | 12% |
| 6 | Phase 3: home, notifications, area | 10% |
| 7 | Phase 6: bookings, search, favorites, account | 13% |
| 8 | Phase 7: onboarding and shared components | 8% |
| 9 | Phase 8: cross-cutting | 8% |
| 10 | Phase 9: Flutter parity | 4% |

Save `REVIEW-FINDINGS.md` after each phase, so nothing is lost if you're interrupted. When you finish, the summary counts must match the findings list.

## 6. Done means

- [ ] `docs/review/REVIEW-FINDINGS.md` exists, with every section from §4 filled in.
- [ ] Every phase's checklist was gone through; areas with no findings are listed under "Checked and fine".
- [ ] No other file in the repo was changed (check with `git status`: only `docs/review/REVIEW-FINDINGS.md` is new).
