# Customer app: build roadmap for the remaining design frames

This is how we turn the rest of the design board (`apps/web/Beltadreeg customer app design/mobile.html`, 43 frames) into the Expo app, in order. Anyone building screens, person or AI, follows it from top to bottom and stops at every ⏸.

## How we work: one step at a time

- **Never work on several steps at once.** Finish one step, get the user's review, then move to the next.
- **Every step gets its own plan first,** before any code:
  1. Write the plan as a Markdown file: `docs/plans/<step>.md` (for example `step-0-groundwork.md`, `batch-3-home.md`).
     - **Context:** what the step is for.
     - **Tasks:** a numbered list in the order they'll be done.
     - **Files:** the files each task touches.
     - **Verification:** how it will be checked.
  2. The user reviews and approves the plan. Nothing gets built before that.
  3. Work through the plan's tasks **in order, one at a time.** Mark each one done (`- [x]`) in the plan file as it's finished.
  4. **Review the work and the code changes** before telling the user the step is finished:
     - **Read the whole diff** of the step: `git diff` plus new untracked files.
     - **Correctness:** bugs, missing states, broken navigation or back, edge cases (empty data, offline, long names, 320 wide, 140% font).
     - **Rules:**
       - tokens only, no hard-coded colors, no Tailwind;
       - logical RTL props;
       - digits through `fmt()`;
       - board copy exactly;
       - motion only from `motion.ts`;
       - data path hook → action → mock;
       - dev-only content inside `__DEV__`.
     - **Simplicity:** no duplicated components, no unused code or exports, no speculative props. Reuse what exists.
     - **Checks green:** `npx tsc --noEmit`, `npx expo lint` (0 errors), `pnpm test`.
     - Fix what the review finds, then re-run the checks. You can also run the `/code-review` skill on the diff.
     - Write a short **review summary** in the plan file: files changed, what was found and fixed, anything left open.
  5. Stop for the user's review (⏸) and send the review summary along with the step's evidence. The next step's plan only starts after the user replies.
- If something new comes up mid-step (a bug, a gap, a decision), add it to the current plan file or `GAPS.md`. Don't start it outside the plan.

## Where we are

- **Built and checked** (Arabic; 320, 360, 393, 430, iPad portrait and landscape, 140% font, keyboard open where there are inputs): onboarding 01–03, login 04/05, register 06, OTP 19/20; Home 07, 08, 18, area sheet 40 (batch 3); salon 21–23, gallery 39 (batch 4); booking 24–30 + Flutter's "امتى تحب تيجي؟" step (batch 5); bookings 09–11, search 12–15, account 16, 17, 43 (batch 6); rate 31/41, notifications 32/33, favorites 34/35, profile 36, notification settings 37, help 42 (batch 7). After the 6 steps: Flutter UI gaps (batch 8), storage + quality (batch 10), polish incl. animated onboarding (batch 11), review leftovers (batch 12).
- **Still "coming soon" placeholders:** none in the 6 build steps. Next: the "Later" list below.

## Rules that apply to every step

**Sources of truth**

| Source | Wins on |
|---|---|
| Board (`mobile.html`) | Layout, visuals, copy (character for character) and the states it draws. Each frame's `.fnote` text is a requirement. |
| Flutter app (`apps/bltdreeg_cutsomer_mobile/lib`) | The journey (routes, guards, back behavior), logic, data, and extra states the board doesn't draw. It's also the code we port. |
| Web app | Brand assets. |
| Anything else | Becomes a **NEEDS DECISION** row in `GAPS.md`. Never pick silently. |

**Language**
- Arabic only for now; English is frozen.
- New copy goes into `src/i18n/messages/ar.json` under `mobile.*`. Don't edit `en.json`.
- The Language row (frame 38) stays hidden.

**Styling**
- `StyleSheet.create` plus `src/styles/tokens.ts`. **No Tailwind / NativeWind.**

**Components**
- **Visual parts** (Text, Button, fields, cards, chips, badges, lists, empty states) are our own, in `src/components`.
- **Interactive parts** (switch, checkbox, radio, tabs, dialogs, accordion, slider, select/popover) are built on `@rn-primitives/*` and styled with our tokens.
- **Bottom sheets:** `@gorhom/bottom-sheet`.
- **Other installed packages to use:**
  - `@shopify/flash-list` for long lists;
  - `react-native-keyboard-controller` for forms;
  - `react-native-reanimated` for motion, with timings only from `src/theme/motion.ts` and Reduce Motion respected.
- **No full UI kit** (Paper, Tamagui, gluestack) and **no `@expo/ui`**: they don't match the board.
- Add a package only when the batch that needs it starts, with `npx expo install`.

**Data**
- Path: component → hook (`src/lib/hooks/<domain>`) → action (`src/lib/actions/<domain>`) → `apiClient` → mock (`src/lib/api/mock/<domain>.mock.ts`, registered in `adapter.ts`).
- Mock data is ported from Flutter's fake data sources.

**Digits**
- Every displayed number goes through `useFormat()` / `fmt()`, which gives Arabic-Indic digits.
- Data, payloads, the phone field and OTP cells stay Western.

**Other rules**
- Dev-only content goes inside `__DEV__`.
- No link-list placeholder screens.
- No commits or pushes unless asked.
- More detail is in `apps/customer-mobile/AGENTS.md`.

---

## Step 0: Groundwork (once, before any new screen)

1. **Remove unused template packages:** `@expo/ui`, `expo-glass-effect`, `expo-symbols`. Nothing in `src/` imports them.
   - Keep `expo-system-ui` (Android light mode and background) and `expo-web-browser` (Google/Apple sign-in later).
   - Keep `react-dom` / `react-native-web` unless we decide the app is mobile-only.
   - Rebuild Android: `npx expo prebuild --clean -p android --no-install`, then `npx expo run:android --port 8090 --device Pixel_9`.
2. **Write the component rule** above into `AGENTS.md`, and add the libraries table to `GAPS.md` §2d.
3. **Move four existing components onto `@rn-primitives`.** The look stays exactly the same; only the internals change.

   | Ours | Becomes |
   |---|---|
   | `Toggle` | `@rn-primitives/switch` |
   | `Checkbox` | `@rn-primitives/checkbox` |
   | `Radio` | `@rn-primitives/radio-group` |
   | `SegmentedTabs` / `UnderlineTabs` | `@rn-primitives/tabs` |

   - First confirm each package works with Expo SDK 57, RN 0.86 and the new architecture. If one doesn't, keep ours for that piece and note it.
   - Add a `PortalHost` in `src/app/_layout.tsx` when the first dialog arrives.
   - Re-check login, register and the dev gallery.
4. **Freeze English:**
   - add a note to `GAPS.md` (§0) and `AGENTS.md`;
   - leave the `__DEV__` "Switch to English" row as is.
5. **Close batch 2** (auth):
   - launcher icon and cold-start splash screenshots (light and dark launcher);
   - screen recordings: fresh install → onboarding → login → OTP `1234` → Home; guest mode; wrong OTP + resend; onboarding animations;
   - `GAPS.md` fixes: §6 screenshot row (Arabic only), #13 identity applied, #15 template images deleted;
   - `expo-dev-client` is installed; the user runs `eas init` and the iOS development build.
6. **Optional leftover checks:** onboarding at 320 and in iPad landscape, and 140% font on the auth screens.

⏸ **Review stop**

---

## Step 1: The loop for every frame

1. **Read the board frame:** its HTML, its `.fnote` notes, and the CSS classes it uses (the `<style>` block at the top of `mobile.html`).
2. **Read the Flutter version:** the page in `lib/features/<feature>/presentation/pages/`, its widgets, cubit/bloc and data source.
3. **Compare the board with Flutter's UI** before writing code:
   - **Layout:** sections, order, what's missing or extra in either one.
   - **Copy:** every string.
   - **States:** loading, empty, error, offline.
   - **Behavior:** taps, navigation, back, guards, live updates.
   - **Data:** fields one side shows and the other lacks.

   Each difference gets one outcome:
   - **Board wins:** layout, visuals, copy, and the states the board draws.
   - **Flutter wins:** journey, logic, and extra states the board doesn't draw.
   - **Real conflict:** a **NEEDS DECISION** row. Stop if it blocks building.

   Log every difference in **`GAPS.md` §2e "Board vs Flutter, per frame"**:

   | Frame | Difference | Board | Flutter | Outcome |
   |---|---|---|---|---|
4. **Copy:** add the Arabic strings to `ar.json` under `mobile.<screen>.*`, exactly as the board writes them.
5. **Data:** type (`src/lib/types`) → mock route → action → hook + query key, ported from Flutter's fake data.
6. **Build:**
   - screen in `src/screens/<name>/<name>.screen.tsx`, with `__sections/`, `__components/` and `__lib/`;
   - the route file in `src/app` stays a one-line re-export;
   - a part used by 2 or more screens goes in `src/components`;
   - pure logic (sorting, filters, pricing, wait ranges) gets one `*.test.ts`.
7. **Cover every state:** loading skeleton, empty, error, offline (bar or full no-connection screen), and filled.
8. **Check on the Android emulator only** (`emulator-5554`, never the physical phone; Metro on 8090; force-stop and relaunch first, don't trust Fast Refresh):
   - sizes 320×568, 360×640, 393×852, 430×932, iPad 820×1180 and 1180×820, plus 140% font;
   - with the keyboard open on any screen with inputs;
   - look for: no clipped or overlapping text, correct RTL order, Arabic-Indic digits, content centered on iPad, the CTA never hidden.
9. **Run the checks:**
   - copy audit (board strings vs `ar.json`);
   - `npx tsc --noEmit`;
   - `npx expo lint` (0 errors);
   - `pnpm test`.

---

## Step 2: Batches in journey order

| Batch | Frames | Flutter source | Main new parts |
|---|---|---|---|
| **3. Home** | 07 Home, 08 offline bar, 18 no connection, 40 area sheet | `home/presentation/pages/home_page.dart`, `home_cubit.dart`, `salons/data/datasources/fake_salon_catalog_remote_data_source.dart`, `salons/presentation/widgets/{salon_items,salon_labels,area_picker_sheet}.dart` | fake salon catalog with live queue drift, `SalonRailCard` / `SalonListItem`, `Sheet` wrapper, `NoConnection` screen, area picker, salon sort logic |
| **4. Salon** | 21, 22, 23 salon page, 39 gallery | `salon_details/presentation/pages/{salon_details_page,salon_gallery_page}.dart`, `salon_details/data/*`, `booking/data/in_memory_booking_draft_repository.dart` | salon details mock, tabs, service selection with a sticky "ادخل الطابور" bar, booking draft store, photo gallery |
| **5. Booking → queue** | 24 barber, 25 review, 26 confirmed, 27–29 queue states, 30 leave dialog | `booking/presentation/pages/*`, `booking/data/{booking_remote,booking_models}.dart`, `queue/presentation/{pages/queue_page.dart,queue_bloc.dart}` | bookings + queue mocks, pricing and wait-range logic, live queue (keep-awake, haptic, countdown), `alert-dialog` |
| **6. Bookings, Search, Account** | 09–11 bookings, 12–15 search + filters, 16 account, 17 logout dialog, 43 guest | `booking/presentation/pages/bookings_page.dart`, `search/presentation/pages/search_page.dart`, `salons/domain/services/salon_matcher.dart`, `account/presentation/pages/account_page.dart` | active queue card, "احجز تاني", search + recent searches, filter sheet (`slider`, `checkbox`, `radio-group`), account groups, guest state |
| **7. The rest** | 31 rate, 41 rating sent, 32–33 notifications, 34–35 favorites, 36 edit profile, 37 notification settings, 42 help | `rating/*`, `notifications/*`, `favorites/*`, `account/presentation/pages/{edit_profile_page,notification_settings_page,help_page}.dart` | rating + photo picker, notifications list, favorites sorted by wait, locked phone field, locked queue toggle, help FAQ (`accordion`) |

There's a ⏸ **review stop after each batch.**

**Decided during batch 5 (user, 2026-10-07):** Flutter's "pick a time slot" step (`booking_slot_page.dart`, `/salon/:salonId/book/slot`) comes before the barber (GAPS D7 = B). Built in batch 5.

---

## Later (not in these batches)

- **38 Language:** comes with the English batch, when English is unfrozen and `en.json` is filled in.
- **Polish batch:** ✅ batch 11 (animated onboarding D4, joined check, initials, avatar ring, tab strip). Still open:
  - final icon/splash review (needs a ≥1024 logo from design);
  - iOS checks on the EAS development build (needs `eas init`).
- **Auth batch:** forgot password (D3), complete-profile gate (GAPS #7), OTP D5/D6.

## What goes to the user at every review stop

1. Screenshot contact sheets at all sizes and at 140% font.
2. One screen recording of that batch's journey.
3. The batch's `GAPS.md` §2e rows (board vs Flutter) and any deviations.
4. New NEEDS DECISION items, with options and a recommendation.
5. Check results: `tsc`, `lint`, tests.
6. The code review summary: the list of changed files, what the review found and fixed, and what's still open.

## Handoff for a new session (state on 2026-10-07)

**Start here:** read `docs/HANDOFF.md` first (latest state, 2026-10-07), then this whole file, then `AGENTS.md` and `GAPS.md`. **Step 0 and batches 3–7 are done** (`docs/plans/{step-0-groundwork,batch-3-home,batch-4-salon,batch-5-booking,batch-6-bookings-search-account,batch-7-the-rest,batch-8-flutter-gaps,batch-10-storage-quality,batch-11-polish,batch-12-review-leftovers}.md`, review summaries inside). Copy audit for any new copy: `python scripts/emulator/copy_audit.py` (board or Flutter ARB, never invented). The 6 build steps are complete; the next work is the "Later" list — ask the user which first.

> 2026-10-06: the user asked to keep working without waiting for plan approvals. Each step still gets its plan file and review summary; the review stops become a written summary instead of a pause.

### Repo state
- Branch `mobile-app`, about 107 changed files, **all uncommitted**: batch 1–2 work, identity/brand, docs.
- Don't commit unless the user asks.
- Checks were green at the end of batch 4: `tsc` passes, lint has 0 errors (8 warnings in files copied from web), 56 tests pass.

### Decisions already made by the user (don't re-ask)
- **Arabic only for now;** English frozen (see the rules above).
- **No Tailwind / NativeWind**, ever.
- **Components:** our own for visual parts, `@rn-primitives/*` for interactive parts. No full UI kit, no `@expo/ui`.
- **Mock everything,** auth included, using Flutter's fake data.
- **Identity:** `com.beltadreeg.customer` on both platforms; name بالتدريج / Beltadreeg; slug `beltadreeg-customer`; scheme `beltadreeg`. Icon and splash come from the web logo (`assets/brand/source/logo-mark.png`) on white. Never redraw the logo.
- **Digits:** Arabic-Indic in Arabic, through `fmt()`. This reverses GAPS #3 and the user's earlier "Western" answer; tell the user once, in the batch 2 review.
- **Review stops:** after **every** batch.
- **Work style:** one step at a time, with a plan file per step (see the top of this file).

### Batch 2 (auth) closing status
| Item | Status |
|---|---|
| Auth E2E on Android (email, phone + OTP `1234`, wrong OTP, resend timer, guest, relaunch → Home) | ✅ done |
| Arabic screenshots, 4 standard sizes | ✅ done |
| 320×568, iPad landscape 1180×820, keyboard open (login, phone, register, OTP) | ✅ done |
| Fresh OTP shot at 360×640 | ✅ done |
| Launcher icon + cold-start splash shots, light and dark launcher | ✅ done (scratchpad `brand/`) |
| Screen recordings (journey, guest, wrong OTP + resend, onboarding animations) | ✅ done in Step 0 |
| Onboarding at 320 + landscape; 140% font on auth screens | ✅ done in Step 0 (D6 found) |
| `GAPS.md` fixes: §6 screenshot row, #13 "Not applied yet" (outdated), #15 template images deleted | ✅ done in Step 0 |
| Batch 2 review message to the user (sheets, brand shots, deviations, decisions B1–B8 / D1–D4, digits note) | ✅ written in `docs/plans/step-0-groundwork.md` |
| `expo-dev-client` | ✅ in `package.json`; the user runs `eas init` and the iOS dev build |

### Batch 3 (Home) research already done
A detailed Home plan (data port, copy strings, components, states, verification) is in `C:\Users\moham\.claude\plans\we-need-to-focus-compressed-thacker.md`, Part 2. Use it as the starting point when writing `docs/plans/batch-3-home.md`. Re-check it against the board and Flutter; don't copy it blindly.

### Environment (Windows, Android)
- **App:** `apps/customer-mobile`, Expo SDK 57, RN 0.86 (new architecture), React 19.2 + React Compiler.
- **Metro:** port **8090** (8081 belongs to the user's other servers).
  - Start: `pnpm start`; `pnpm start -c` clears the cache.
  - Check: `curl localhost:8090/status` → `packager-status:running`.
  - A Metro left over from an older session can hang. Find the PID listening on 8090 and stop it.
- **Device: the emulator only** (user decision, 2026-10-06): AVD `Pixel_9` = `emulator-5554`.
  - Always pass `-s emulator-5554` / `--device Pixel_9`.
  - A physical tablet (`R52R30FZQHP`, 1200×1920, density 208) is often attached too. **Never target it.**
  - **Only one session at a time may drive a device.** Two sessions changing `wm size`/`density` on the same device spoil each other's screenshots.
- **Build:**
  ```
  cd apps/customer-mobile
  export JAVA_HOME="C:/Program Files/Android/Android Studio/jre"; export ANDROID_HOME="$LOCALAPPDATA/Android/Sdk"
  npx expo prebuild --clean -p android --no-install     # deletes android/local.properties → ANDROID_HOME must be set
  npx expo run:android --port 8090 --device Pixel_9      # never combine --port with --no-bundler
  ```
- **`.npmrc` has `node-linker=hoisted`.** It's required on Windows: without it native paths exceed 260 characters. Never run two `expo run:android` at once.
- **ADB** (Git Bash, always `export MSYS_NO_PATHCONV=1`):
  ```
  ADB="$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe"; S="-s emulator-5554"
  $ADB $S reverse tcp:8090 tcp:8090
  $ADB $S shell am start -a android.intent.action.VIEW -d "'beltadreeg:///login?method=phone'" com.beltadreeg.customer
  $ADB $S shell am force-stop com.beltadreeg.customer
  $ADB $S shell wm density 320; $ADB $S shell wm size 720x1280   # px = dp × 2; then: wm size reset; wm density reset
  $ADB $S shell settings put system font_scale 1.4               # always restore to 1.0
  $ADB $S exec-out screencap -p > shot.png
  $ADB $S shell screenrecord --time-limit 60 /sdcard/rec.mp4     # then adb pull
  ```

### Helper scripts (temporary folder; may be cleaned by Windows)
`C:\Users\moham\AppData\Local\Temp\claude\e--bltdreeg\32e02903-fe15-4f49-ac2b-0b604775f16e\scratchpad`

| Script | What it does |
|---|---|
| `dev.sh` | Sourced by the others: adb path, device (`DEV`, default `emulator-5554`), package; restores display settings on exit. |
| `tap.sh "<text>"` | Taps a node by text or content-desc (`CLS=EditText` filter). |
| `matrix.sh <out> ar` | `SCREENS="name:url …"` and `SIZES="dp:px …"`: deep-links each screen at each size, then builds contact sheets via `sheet.py`. |
| `part1.sh <out>` | Login, phone, register, keyboard-open and OTP at each `SIZES`. |
| `kb.sh <out.png>` | Taps the last field to open the keyboard, then screenshots. |
| `otp-prep.sh` | Creates a pending login OTP for `01023456789`. |
| `ob.sh <out> ar <cta1> <cta2>` | Onboarding slides at each size. |
| `coldstart.sh` | Cold start plus wait for the RTL reload. |
| `brandshots.sh` | Launcher drawer + splash frames, light/dark. |
| `copy_audit.py [namespaces]` | Board copy vs `ar.json` `mobile.*`. |
| `gaps_update.py` | **Already applied; never run again.** |

**Copy the scripts into your own session's scratchpad before using them,** and never edit the originals: another session may be using them. If the folder is gone, recreate them from the descriptions above. They're small bash/python wrappers around the ADB commands.

### Pitfalls that already cost time
- **Don't trust Fast Refresh/HMR** for checks. Force-stop and relaunch first.
- **`wm density` changes restart JS,** which loses in-memory state such as a pending OTP challenge or the current route. Set the density first, then build up state. `wm size` alone doesn't restart.
- **After an intent or deep-link launch the window is in non-touch mode:** the first tap is swallowed and a grey focus ring shows. Tap an empty spot once before screenshots.
- **`uiautomator dump` fails on screens with endless animations** (the dev gallery). Tap by coordinates there.
- **Gboard stylus toolbar instead of a keyboard:** fix with `settings put secure stylus_handwriting_enabled 0`.
- **The OTP screen needs `keyboardOffset={205}`,** because keyboard-controller measures from the hidden input's caret. Open OTP through `toOtp()`, which dismisses the keyboard first.
- **A React Compiler lint rule forbids `setState` inside effects.** Use the "adjust state during render" pattern (`seenMethod` in `login.screen.tsx`).

## Useful references

- Design board: `apps/web/Beltadreeg customer app design/mobile.html`
- Flutter app: `apps/bltdreeg_cutsomer_mobile/lib` (routes: `core/router/app_routes.dart`)
- App rules: `apps/customer-mobile/AGENTS.md`
- Gaps and decisions: `apps/customer-mobile/GAPS.md`
- Flutter reuse notes: `apps/customer-mobile/docs/flutter-reuse.md`
