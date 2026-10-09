# Batch 8: Flutter UI gaps

## Context

After batches 3–7 closed, an audit compared the RN app with the Flutter app (`apps/bltdreeg_cutsomer_mobile/lib`). Routes and the 43 board frames are all covered. The audit compared every Arabic string the Flutter pages use with `ar.json`, plus refresh, toasts, haptics, share, skeletons and back handling. It found a few behaviors Flutter has that RN doesn't. The user also noticed the loading skeletons look different ("difference in colors").

None of these are drawn on the board, so Flutter wins on all of them (truth order).

User approval: "start plan for gaps after planning work with it to finish it" (2026-10-07).

## Gaps

| # | Where | Flutter | RN before | Fix |
|---|---|---|---|---|
| G1 | Skeleton (Home, Search, Favorites, salon, slots, gallery, account) | `Shimmer`: `surf` boxes, a darker band (`#EDEFF2`) sweeping left→right every 1300 ms; salon-row skeletons on Search (2) and Favorites (3); rail card = rounded image + 2 lines, no border | opacity pulse 1 → 0.45 every 800 ms (box fades to near-white = paler, blinking); Search = two flat 86 blocks; Favorites = spinner; rail card bordered | `Skeleton` sweeps like Flutter (`experimental_backgroundImage` linear-gradient, `colors.surfSheen`, `duration.shimmer` 1300); `SalonRowSkeleton` shared (Flutter `SalonListTileSkeleton` sizes); rail card like `SalonRailCardSkeleton` |
| G2 | Directions / call | toast "مش قادرين نفتح التطبيق ده على موبايلك" when nothing opens the link | `Linking.openURL` rejection unhandled, no feedback | catch → toast |
| G3 | Session expired (401 with a token) | "جلستك انتهت. سجّل دخولك تاني." | token cleared silently | toast from the axios interceptor |
| G4 | Area sheet "use my location" | picks the nearest area + toast "حددنا منطقتك: {area}" | picks it silently | toast inside the sheet (the sheet is a Modal, a root toast would sit under it) |
| G5 | Haptics | OTP verified (medium) / wrong code (heavy), profile saved (medium), booking-confirmed check drawn (medium) | none on these | `expo-haptics` (installed), same strengths |
| G6 | Salon page | pull-to-refresh | none (Home, bookings, favorites, notifications have it) | `RefreshControl` on the salon scroll view |
| G7 | OTP (found while building G5) | code accepted → cells green (okTint / success border / okDark digits, 1.06 scale), 650 ms hold, then leave | leaves at once | `OtpInput success`, `duration.successHold`, button stays busy during the hold |

G2 and G3 fire from plain functions, outside any screen, so they need one app-wide toast. `useToast` is per screen.

## Tasks

- [x] **1. Skeleton = Flutter Shimmer (G1).** `atoms/skeleton`: sweep band, `SalonRowSkeleton`; `tokens.surfSheen`; `motion.duration.shimmer` 1300; Home rail/rows, Search, Favorites use it.
- [x] **2. App-wide toast.** `showToast(key, values?)` + `<ToastHost />` in `toast.tsx` (the host translates `mobile.*` keys, so plain functions need no translator); mounted once in `app/_layout.tsx`. Same look as `useToast`.
- [x] **3. Links that can't open (G2).** `external-links.ts`: `openURL(...).catch(() => showToast("common.cantOpenApp"))`.
- [x] **4. Session expired (G3).** `axios-instance.ts` 401 branch: `showToast("common.sessionExpired")` once, when a session was actually cleared.
- [x] **5. Area located (G4).** `area-sheet`: after picking the nearby area → local toast "حددنا منطقتك: {area}".
- [x] **6. Haptics (G5) + OTP success state (G7).** OTP (medium on success, heavy on wrong/locked), profile save (medium). Booking-confirmed skipped: Flutter vibrates when its *animated* check finishes drawing; ours is static (animation = D4 polish), and the review step already vibrates on success.
- [x] **7. Salon pull-to-refresh (G6).**
- [x] **8. GAPS.** §2e rows for G1–G7, mark stale §2/§4 rows that are now done.
- [x] **9. Checks + device.** tsc, lint (0 errors), tests; emulator-5554: skeleton sweep (Home cold start / Search / Favorites), toasts G2–G4, pull on salon; review summary below.

## Review summary

**Files:** `components/atoms/skeleton/skeleton.tsx` (sweep + `SalonRowSkeleton`), `styles/tokens.ts` (`surfSheen`), `theme/motion.ts` (`shimmer` 1300, `successHold` 650), `screens/home/__sections/home-skeleton.tsx`, `screens/search/search.screen.tsx`, `screens/favorites/favorites.screen.tsx`, `components/molecules/toast/toast.tsx` (`showToast` + `ToastHost`), `app/_layout.tsx`, `lib/utils/external-links.ts`, `lib/api/axios-instance.ts`, `components/organs/area-sheet/area-sheet.tsx`, `components/molecules/otp-input/otp-input.tsx`, `screens/otp/otp.screen.tsx`, `screens/profile/profile.screen.tsx`, `screens/salon/salon.screen.tsx`, `ar.json` (`common.cantOpenApp`, `common.sessionExpired`, `area.located` — Flutter ARB text), `GAPS.md`.

**Why the colors looked different:** the color tokens are identical to Flutter's (checked all 30). The skeleton animated differently: RN faded each box to 45% opacity (`#F7F8FA` on white → almost white, blinking every 0.8 s), while Flutter keeps the box at `#F7F8FA` and sweeps a darker `#EDEFF2` band across. Now the same.

**Found and fixed in review:**
- The Home rail skeleton flashed a horizontal scroll bar on mount (was already there) → hidden.
- The OTP "تأكيد" button turned tappable again during the success hold → stays busy; `submit` ignores taps after success.
- The area-located toast can't use the app-wide host (the sheet is a Modal on top) → its own `useToast` in the sheet footer.

**Checks:** `tsc` ✅ · lint 0 errors (8 baseline warnings) · tests 79/79. Emulator-5554 (393×852): Home cold-start skeleton sweep (mock latency raised to 4 s for the check, then restored to 300–700 ms), Favorites 3-row skeleton, area sheet → location permission → "حددنا منطقتك: المعادي", salon pull spinner under the pinned bar, OTP 1234 → green cells then Home.

**Left open:** G2 (link can't open) and G3 (session expired) are code-checked only: the emulator has a maps app and dialer, and the mock never expires a token. Each box sweeps on its own (Flutter masks one sweep over the whole layout) — close enough without `MaskedView`. The booking-confirmed animated check (+ its haptic) goes with D4.
