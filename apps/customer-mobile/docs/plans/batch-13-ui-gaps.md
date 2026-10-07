# Batch 13: last UI gaps

## Context

The user asked to fix the open UI/design gaps, plus a badge in the profile phone field that isn't centred ("the green badge not centered … solve fix these gaps", 2026-10-07). They have now said go on D1, D3, D5, D6, D8, #7, #13, 38 and iOS.

What the code check found:
- **Badge:** `Badge` has `alignSelf: "flex-start"`. Every place it's used is a row, so it sits at the top of the row instead of the middle. Seen in the profile phone field; the same happens slightly in the hours header, card rows and booking cards.
- **D1:** the Google mark is already the multicolor one (`assets/icons/google.svg`), so only the decision row needs closing.
- **D3:** the server has `password/forgot` → `password/verify` (returns a reset token) → `password/reset` (opens a session). The action and hooks are already ported. Neither the board nor Flutter draws the flow; Flutter's link just goes home. The flow is built from board pieces already in the app:
  - the login phone field;
  - the OTP frames 19/20;
  - the register password field and its rules.
  - Only the titles are new copy; they're listed in GAPS for design review.
- **D5:** board frame 20 is a wrong code after the countdown has ended. A wrong code while it's still running shows a disabled "ابعتلي كود جديد" with no time on screen, so frame 19's countdown line goes under the error.
- **D6:** measure on 360×640 at 140% font, then shrink the keyboard offset so the code cells stay on screen. The code sends itself when complete, so the button can sit under the keyboard there.
- **D8:** Android's RTL list bug stays, but the pager can stay LTR with the photos reversed in RTL: swiping right shows the next photo, and the counter and start index are mapped back.

Not in this batch:
- **#7 complete-profile.** Only social sign-in can create an account with no phone, name or terms; register and phone login always have them. The server doesn't apply its `customer.onboarded` middleware to any route yet, and social sign-in itself is backend-blocked. Build it with real Google/Apple sign-in.
- **#13 icon.** There's no vector logo on the board or in Flutter; the only source is 496 px, so the icon still needs a ≥1024 logo from design.
- **38 English.** The standing rule is "Arabic only, never edit en.json", so the user has to lift it first.
- **iOS checks.** They need `eas init` on the user's Expo account. (`eas.json` turned out to exist already; the GAPS line was stale.)

## Tasks

- [x] **1. Badge centred.** Drop `alignSelf: "flex-start"` from `Badge`, then check the profile, salon hours, salon card and booking cards.
- [x] **2. D5.** OTP wrong code with the countdown still running: show the countdown line under the error.
- [x] **3. D6.** OTP at 140% font on 360×640 with the keyboard open: the code cells stay visible.
- [x] **4. D8.** Photo viewer: swipe right = next in RTL, the counter is right, and it opens on the tapped photo.
- [x] **5. D3 forgot password.**
  - `forgot-password` screen: the phone field → send the code (`useForgotPassword`, which remembers the challenge).
  - The OTP screen takes `purpose=reset_password`: verify with `useVerifyResetCode`, then go to `new-password` with the token.
  - `new-password` screen: the password field and rules (`Rule` moves to auth-parts, shared with register) → `useResetPassword` → signed in → home, with a toast.
  - Mock: `password/forgot`, `password/verify` and `password/reset`, reusing the OTP code check.
- [x] **6. D1 + iOS prep.** Close D1 in GAPS; `eas.json` already exists (development / simulator / preview / production), so fix the stale GAPS line.
- [x] **7. Device check + GAPS + review summary.** tsc, lint and tests after each task.
- [x] **8. Salon photos from the web app** (asked mid-batch): the web's `public/dummy_salon` images everywhere a salon placeholder was.
- [x] **9. Release APK** (asked mid-batch): `android/app/build/outputs/apk/release/`.

## Review summary

**Files:**
- `molecules/status-badges` (`Badge` alignment)
- `organs/auth-parts` (`PasswordRules` moved out of register; `account_not_found` → the "not registered" text), `organs/form-screen` (`toOtp` reset purpose)
- `screens/{forgot-password,new-password}` (new), `app/(auth)/new-password.tsx`, `screens/otp` (reset purpose, D5, D6), `screens/register`
- `lib/hooks/auth/use-forgot-password` (remembers the challenge), `lib/api/mock/auth.mock.ts` (+ `password/forgot|verify|reset`, shared `checkCode`) + `auth.mock.test.ts`
- `lib/hooks/use-swipe-pager.hook.ts` (new, from onboarding), `screens/onboarding`, `screens/salon-photo` (D8)
- Salon photos: `assets/salons/salon-1…9.jpg`, `lib/data/salon-photos.ts`, `src/images.d.ts`, `organs/salon-card` (`SalonImage`, `SalonThumb salonId`), `screens/salon/__sections/salon-header` (hero + status bar), `screens/salon-gallery`, 5 `SalonThumb` callers
- `ar.json` (6 `auth.*` strings), `GAPS.md`

**Found and fixed in review:**
- The mock reset deleted the token by phone key, not by token (so it was reusable) → fixed, and the test checks single use.
- D8: reversing the data and then `inverted` both changed nothing on the device. Android's RTL scroller flips them back, so the viewer moved to the gesture pager that onboarding already proved.
- Viewer and salon hero had dark status icons on dark photos → light status bar while over the photo (focus-aware on the salon page).
- The gallery's 2×2 grid repeated beard/fade/beard/fade with only 2 "work" images → the gallery picks from all 9.

**Checks:** tsc ✅ · lint 0 errors (8 baseline warnings) · tests 87/87 (+ password reset mock) · copy audit: the 6 new reset strings are the only ones neither board nor Flutter (in GAPS D3 for design review). Emulator-5554: see GAPS §12.

**Not done (needs something else):**
- #7 waits on social sign-in.
- #13 needs a ≥1024 logo.
- 38 needs the English freeze lifted.
- iOS needs `eas init` on the Expo account.
