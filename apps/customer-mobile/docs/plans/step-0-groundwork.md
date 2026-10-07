# Step 0: Groundwork

## Context

One-time cleanup before any new screen (roadmap, Step 0). It removes template packages, writes the component rule down, moves the interactive controls onto `@rn-primitives`, and closes batch 2 with its missing evidence.

Already done before this plan (checked 2026-10-06), so these are not tasks:
- English freeze is in `GAPS.md` §0 and `AGENTS.md` ("new keys go into `ar.json` only").
- Template images are deleted (`assets/images/` is gone; `app.json` points only at `assets/brand/`).
- GAPS #13 (identity applied) and #15 (images deleted) already have their updated rows. The old rows are still there next to them, as duplicates.

**Device: the Android emulator only**, `emulator-5554` (AVD `Pixel_9`). Every adb command passes `-s emulator-5554` and every build passes `--device Pixel_9`. The USB tablet (`R52R30FZQHP`) is never targeted.

## Tasks

- [x] **1. Remove unused template packages:** `@expo/ui`, `expo-glass-effect` and `expo-symbols`. Nothing in `src/` or `app.json` uses them (grep confirmed). Keep `expo-system-ui`, `expo-web-browser`, `react-dom` and `react-native-web`; `react-native-web` is also a peer of `@rn-primitives`.
  Then rebuild Android: `npx expo prebuild --clean -p android --no-install`, then `npx expo run:android --port 8090 --device Pixel_9`.
- [x] **2. Docs: write down the component rule.**
  - `AGENTS.md`: add the rule (our own visual parts; `@rn-primitives/*` for interactive parts; `@gorhom/bottom-sheet`; no UI kit or `@expo/ui`; add a package only when the batch needs it). Delete the duplicated "Components first" line (the older one, without the English-freeze note).
  - `GAPS.md` §2d: add rows for `@rn-primitives/*`, "no UI kit / no `@expo/ui`" and `expo-dev-client`.
- [x] **3. Move four controls onto `@rn-primitives`** (`switch`, `checkbox`, `radio-group`, `tabs` v1.5.2; peers are `react`, `react-native` and `react-native-web`, any version). Install them with `npx expo install`.
  - `Toggle` → `Switch.Root` + `Switch.Thumb`; `Checkbox` → `Checkbox.Root` + `Indicator`; `Radio` → `RadioGroup.Item` (the gallery wraps it in a `RadioGroup.Root`); `SegmentedTabs` / `UnderlineTabs` → `Tabs.Root` / `List` / `Trigger`.
  - The look and the props stay exactly the same, so callers (login, register, dev gallery) don't change. Keep our `Pressable` (hit size, press scale) through `asChild` where the primitive allows it.
  - If a primitive breaks on SDK 57 / RN 0.86 / the new architecture, keep ours for that piece and note it in GAPS §2d.
  - No `PortalHost` yet: it arrives with the first dialog (batch 5).
- [x] **4. GAPS cleanup:** delete the outdated duplicates: the old #13 row ("Not applied yet"), the old #15 row, and the §6 "ar + en" screenshot row.
- [x] **5. Close batch 2: evidence** (emulator, Metro on 8090, force-stop and relaunch before each run):
  - Screen recordings, saved to `scratchpad/rec/`:
    1. fresh install → onboarding → login → OTP `1234` → Home;
    2. guest mode;
    3. wrong OTP + resend;
    4. onboarding animations.
  - Leftover shots: onboarding at 320×568 and 1180×820; auth screens (login, phone, register, OTP) at 140% font.
  - Restore `wm size`, `wm density` and `font_scale 1.0` afterwards.
- [x] **6. Review and checks:** read the whole diff; run `npx tsc --noEmit`, `npx expo lint` (0 errors) and `pnpm test`; write the review summary below.
- [x] **7. Batch 2 review message** to the user: contact sheets, brand shots, recordings, deviations, decisions B1–B8 / D1–D4, and the one-time note that digits are now Arabic-Indic.

⏸ Stop for review.

## Files

| Task | Files |
|---|---|
| 1 | `package.json`, `pnpm-lock.yaml`, `android/` (regenerated) |
| 2 | `AGENTS.md`, `GAPS.md` |
| 3 | `package.json`, `pnpm-lock.yaml`, `src/components/atoms/selection-controls/selection-controls.tsx`, `src/components/molecules/tabs/tabs.tsx`, `src/screens/design-system/__sections/components-gallery.tsx` (radio group wrapper only) |
| 4 | `GAPS.md` |
| 5 | none in the repo (scratchpad only) |
| 6 | this file |

## Verification

- Task 1: grep shows no imports of the removed packages; the app builds and launches on `emulator-5554`.
- Task 3: before and after screenshots of login (tabs), register (checkbox) and the dev gallery (toggle, locked toggle, radio, checkbox, both tab styles) at 360×640 match. The tap targets still work. With TalkBack on, each control still announces its role and state.
- All: `tsc`, `lint` (0 errors) and `pnpm test` are green.

## Found during this step

- `package.json` had no `start` script and `mobile` used port 8082. **Fixed** (user said to work without stopping): `start`/`dev`/`mobile`/`ios` all use `--port 8090`.
- OTP wrong-code state hides the resend countdown → GAPS **D5**.
- OTP at 140% font, 360×640, keyboard open: the code cells scroll off → GAPS **D6**.

## Review summary

Approved by the user up front ("work automatically"), 2026-10-06.

**Files changed (this step only)**
- `package.json`, `pnpm-lock.yaml`: removed `@expo/ui`, `expo-glass-effect`, `expo-symbols`; added `@rn-primitives/{switch,checkbox,radio-group,tabs}` 1.5.2; `start`/`dev`/`mobile` scripts on 8090.
- `src/components/atoms/selection-controls/selection-controls.tsx`: `Toggle` → `Switch.Root asChild` + our `Pressable`; `Checkbox` → `Checkbox.Root` + `Indicator`; `Radio` → `RadioGroup.Item asChild`, new `RadioGroup` export. Props of `Toggle`/`Checkbox` unchanged; `Radio` now takes `value` inside a `RadioGroup` (only the gallery used it).
- `src/components/molecules/tabs/tabs.tsx`: both tab styles on `Tabs.Root`/`List`/`Trigger` (all `asChild`, so no extra views). Props unchanged.
- `src/screens/design-system/__sections/components-gallery.tsx`: radios wrapped in a `RadioGroup` with state.
- `AGENTS.md`: component rule; duplicate "Components first" line removed.
- `GAPS.md`: §2d three rows; old #13/#15 and the §6 "ar + en" row removed; §5 Metro line; §2c D5/D6; §6 two evidence rows.
- `android/` regenerated (prebuild --clean).

**What the review found and fixed**
- `Checkbox.Root` (1.5.2) drops `asChild`, so it can't wrap our `Pressable`: the checkbox styles the primitive's own Pressable, `hitSlop={11}` keeps the 44 target (checked on device: a tap 7 px outside the box still toggles). It loses the 0.97 press scale, invisible on a 22 px box.
- `Switch.Root` sets `aria-valuetext` to English "on"/"off": `Toggle` passes `""` so TalkBack/VoiceOver say the state in the device language.
- Slot merges props child-wins: the child `Pressable` sets no role/state/onPress, so the primitive's win.

**Device checks (emulator-5554 only)**
- App builds and launches after the package removal.
- Login segmented tabs switch and report `selected`; register checkbox toggles, `android.widget.CheckBox` with `checked`; gallery: toggle on/off (simulate offline works), locked toggle faded and inert, radio selection moves between items, underline tabs switch. Look identical to before.
- Evidence (scratchpad `evidence/batch-2/`): 4 recordings (journey 37 s, guest 60 s, wrong OTP + resend 105 s, onboarding 29 s); onboarding at 320×568 and 1180×820; auth screens at 140% font; brand shots and the 4-size sheets from batch 2.
- Display restored after every run (`wm size`/`density` reset, `font_scale 1.0`).

**Checks:** `npx tsc --noEmit` ✅ · `npx expo lint` 0 errors (same 8 warnings in files copied from web) ✅ · `pnpm test` 39/39 ✅

**Left open:** D5, D6 (GAPS §2c). iOS checks still need `eas init` + the development build (user).

## Batch 2 review message

**Auth (onboarding 01–03, login 04/05, register 06, OTP 19/20) is done on Android.**
- Evidence: contact sheets at 360/393/430/820 (+ 320, iPad landscape, 140% font), launcher icon + splash in light and dark, 4 screen recordings.
- **Digits changed:** Arabic screens now show Arabic-Indic digits (٠١٢٣) through `fmt()`. This reverses your earlier "Western digits" answer (GAPS #3), per the product owner on 2026-10-05. Phone field, OTP cells and data stay Western.
- **Deviations from the board:** none in layout or copy. Extra states from Flutter: OTP attempts-left line, resend countdown, phone validation inline.
- **Decisions waiting for you** (recommendation in bold, details in GAPS §2b/§2c):
  - B1 grace period **timer then barber confirms** · B2 postpone **1 place** · B3 check-in **button now, geofence later** · B4 wait **range** · B5 rating **board's 3 criteria** · B6 barber **"any" preselected** · B7 OTP **6 digits on the server** · B8 notifications **push + SMS only for "your turn"**
  - D1 Google mark **multicolor** · D2 after onboarding **as built (browse as guest)** · D3 forgot password **later** · D4 onboarding illustrations **animate in polish batch** · D5 OTP countdown in wrong-code state **show it** · D6 OTP at 140% font **fix in polish batch**
- **Needs you:** `eas init` and the iOS development build for the iOS checklist (GAPS §6).
