# Batch 11: polish

## Context

These are polish items from the roadmap's "Later" list and HANDOFF §5. None of them needs a decision or the backend.

User approval: plan approved 2026-10-07 (batches 10 + 11). Not in this batch:
- **App icon and splash:** needs a logo of at least 1024 px from design (GAPS #13).
- **iOS checks:** need `eas.json` and an EAS development build.

## Tasks

- [x] **1. Animated onboarding (D4).** `screens/onboarding/__components/onboarding-art.tsx` ports `onboarding_illustrations.dart`:
  - a 280×240 canvas scaled as one piece (like `FittedBox`), built from the layer SVGs in `assets/illustrations/onboarding_*/`, with Reanimated;
  - each slide has an entrance that plays once, the first time it's shown, and a loop that runs only while it's shown;
  - slide 1: the pin drops with a bounce, then floats;
  - slide 2: the clock hands turn, and the number ticks 6→4 every 1100 ms (odometer swap), with the people-ahead and wait labels following;
  - slide 3: background, chair, stars (elastic, then twinkle), scissors (snip), then the price and time pills;
  - labels come from Flutter's ARB (`mobile.onboarding.art.*`, plus `f.price` and `f.minutes`);
  - timings and curves are in `motion.ts` (`onboardingArt`, `curve`);
  - reduced motion shows the final frame.
- [x] **2. Frame 26 joined check.** `screens/booking-confirmed/__sections/queue-joined-art.tsx` ports `QueueJoinedIllustration`:
  - halo, then the disc (elastic), then the check drawing itself (`strokeDashoffset`), then a ripple and 8 confetti dots;
  - a medium haptic at 62% of the timeline, when the check is drawn;
  - reduced motion shows the static SVG.
- [x] **3. Initials like the board.** `lib/utils/initials.ts` (+ test) skips the "ال" prefix: "محمود السيد" → "م س". `Avatar` imports it.
- [x] **4. Avatar ring.** `Avatar ring` adds a 1 px `tealTint2` border, as the board draws it, on the account header (64) and profile (84) only.
- [x] **5. One `.meta .bar`.** `MetaBar` is exported from `organs/salon-card` and used by `Meta`, salon info and barbers; the two copies of the inline bar style are deleted. Salon info and barbers keep their wrapping rows; `Meta` is one line that shrinks.
- [x] **6. Tab strip at 140%.** `UnderlineTabs` centres the active tab in its horizontal scroll whenever the value changes. It measures each tab with `onLayout`.
- [x] **7. GAPS + device + recording.**

## Review summary

**Files:** `screens/onboarding/{onboarding.screen.tsx,__components/onboarding-art.tsx}`, `screens/booking-confirmed/{booking-confirmed.screen.tsx,__sections/queue-joined-art.tsx}`, `theme/motion.ts` (`curve`, `onboardingArt`, `queueJoinedArt`), `lib/utils/initials.ts` (+ test), `components/atoms/avatar/avatar.tsx` (`ring`, `initials` moved out), `screens/{account,profile}/*.screen.tsx` (`ring`), `components/organs/salon-card/salon-card.tsx` (`MetaBar`), `screens/salon/__sections/{salon-info,salon-barbers}.tsx`, `components/molecules/tabs/tabs.tsx`, `ar.json` (`mobile.onboarding.art`), `scripts/emulator/matrix-b11.sh`, `GAPS.md`. Deleted: the static `onboarding_{find_salons,live_queue,choose_barber}.svg` + their registry entries (the animated art replaces them, reduced motion included; the files were staged-new, so `git rm --cached` unstaged them).

**Found and fixed in review:**
- The worklet `phase(…, c = curve.outCubic)` crashed with "Property 'curve' doesn't exist": worklets don't capture variables used in default parameters, so the default moved into the body.
- Before the port, the static onboarding slides 2 and 3 showed no number, people-ahead, wait or price labels (the SVGs have no `<text>`). The animated art draws them, in static mode too.
- `uiautomator dump` hangs while a loop animation runs (UI never idle) → the matrix uses screenshots, swipes and deep links only.

**Checks:** `tsc` ✅ · lint 0 errors (8 baseline warnings) · tests 86/86 (+initials). Emulator-5554:
- **Onboarding at 6 sizes plus 140%:** contact sheets `sheet-onboarding-{1,2,3}-ar.png`. The swipe didn't land on every size; 820×1180 only got slide 1. The same scaling component renders at 1180×820 and on phones.
- **Entrance frames:** pin drop, 6→5→4 tick with the clock turning, chair, stars, scissors and pills appearing in sequence.
- **Reduced motion** (animator scale 0): final frames shown immediately.
- **Frame 26:** halo, disc, check, ripple and confetti captured.
- **Account and profile:** ring visible.
- **Salon at 140% font:** scrolled to "مواعيد العمل", the active tab "المواعيد" stays visible in RTL.
- **Recording:** `b11/b11-onboarding.mp4`.

**Left open:**
- Elastic and bounce use Reanimated's `Easing.elastic(1)` and `Easing.bounce`, which are close to Flutter's `elasticOut` and `bounceOut` but not identical.
- Each layer is drawn at 280×240 and the canvas scaled (at most 290 px wide, ≈1.04×), so there's no visible blur.
- The emulator's system process hung once after many density changes, so I restarted the emulator.
- The app was found signed out after the batch 10 native update; I couldn't reproduce it. A fresh sign-in survives force-stops and a full emulator restart. The likely cause is the old APK running the new JS once ("Cannot find native module 'ExpoSQLite'").
