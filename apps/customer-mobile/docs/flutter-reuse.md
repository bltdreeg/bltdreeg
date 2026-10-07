# Flutter → React Native reuse audit

Source app: `apps/bltdreeg_cutsomer_mobile` (Flutter). Target: `apps/customer-mobile` (Expo).
Rule of truth: the **design board** (`mobile.html`) wins for screens, layout, copy and states; **Flutter** wins for the
user journey and is the code we port; the **web app** is the source for brand assets. Any other conflict goes on the
decision list (§F) — nothing is picked silently.

Status as of 2026-10-06 (end of batch 2).

## A. Coverage per board frame

| Frames | Screen | Flutter (route → page) | RN route | RN status |
|---|---|---|---|---|
| 01–03 | Onboarding | `/onboarding` → `onboarding_page.dart` | `/onboarding` | ✅ built (static art, see D4) |
| 04–05 | Login (email / phone) | `/login` → `login_page.dart` | `/login` | ✅ built |
| 06 | Register | `/register` → `register_page.dart` | `/register` | ✅ built |
| 19–20 | OTP (normal / wrong code) | `/otp` → `otp_page.dart` | `/otp` | ✅ built |
| 07–08, 18, 40 | Home, location sheet, offline | `/home` → `home_page.dart` | `/home` | batch 3 |
| 21–23, 39 | Salon page, gallery | `/salon/:id`, `…/gallery` | same | batch 4 |
| — , 24–25 | Slot (Flutter-only step), barber, review | `/salon/:id/book/{slot,barber,review}` | same | batch 5 |
| 26 | Booking confirmed | `/booking/:id/confirmed` | same | batch 5 |
| 27–30 | Queue tracking | `/queue/:id` | same | batch 5 |
| 09–11 | Bookings tab | `/bookings` | same | batch 6 |
| 12–15 | Search + filters | `/search` | same | batch 6 |
| 16–17, 43 | Account, guest, logout | `/account` | same | batch 6 |
| 31, 41 | Rate visit, rating sent | `/booking/:id/rate`, `…/sent` | same | batch 7 |
| 32–33 | Notifications | `/home/notifications` | same | batch 7 |
| 34–35 | Favorites | `/account/favorites` | same | batch 7 |
| 36 | Edit profile | `/account/profile` | same | batch 7 |
| 37 | Notification settings | `/account/notification-settings` | same | batch 7 |
| 38 | Language | `/account/language` | same | batch 7 |
| 42 | Help | `/account/help` | same | batch 7 |

Unbuilt routes render a "coming soon" screen (`organs/coming-soon`) — no link lists, no dev labels.

## B. Journey map

Mirrors `core/router/app_router.dart`. 🔒 = `AppRoutes.protectedRoutes` (needs a session).

```mermaid
flowchart TD
  splash([Splash]) -->|onboardingSeen = false| onb[Onboarding 01–03]
  splash -->|onboardingSeen| home[Home 07]
  onb -->|"ادخل على الصالونات" (guest)| home
  onb -->|"عندي حساب"| login[Login 04/05]
  login -->|email + password| back{{from ?? Home}}
  login -->|phone| otp[OTP 19/20]
  login -->|"اعمل واحد دلوقتي"| reg[Register 06] --> otp
  login -->|"تصفّح من غير حساب"| home
  otp -->|code ok| back
  otp -->|no pending challenge| loginPhone[login?method=phone]
  home --> salon[Salon 21–23] -->|"ادخل الطابور" 🔒| barber[Barber 24 🔒]
  salon -. guest .-> loginFrom[login?from=…] -. after sign-in .-> barber
  barber --> review[Review 25 🔒] --> confirmed[Confirmed 26 🔒] --> queue[Queue 27–30 🔒]
  queue --> rate[Rate 31 🔒] --> sent[Sent 41 🔒] --> home
  deep([Deep link beltadreeg://salon/:id, /queue/:id]) --> salon
  deep -. back with no history .-> home
```

Differences from Flutter (each on the decision list or justified):

| Flutter | RN | Why |
|---|---|---|
| Login is pushed over onboarding | Onboarding is replaced (it's guarded off once seen), so back from login goes Home as a guest | expo-router `Stack.Protected` removes the onboarding route when `onboardingSeen` flips |
| `redirect` in GoRouter | `LoginRedirect` in the root layout + `requiresLogin()` (`src/lib/utils/route-guards.ts`, tested) | same rule set, one place |
| `from` is trusted | `safeReturnPath()` accepts only in-app paths | a deep link can't bounce sign-in to an arbitrary URL |

## C. Motion that exists in Flutter

| Where | Flutter | RN equivalent |
|---|---|---|
| Tokens (`AppMotion`, `app_dimens.dart`) | press 90 · release 160 · fast 180 · medium 280 · slow 480 · celebrate 900 ms | `duration.*` in `src/theme/motion.ts` (same values) |
| Curves | standard `easeOutCubic`, emphasized `easeOutBack`, page `easeInOutCubic` | `Easing.bezier(.215,.61,.355,1)`, `(.175,.885,.32,1.275)`, `(.645,.045,.355,1)` |
| Pressable feedback | scale 0.97 (`AppMotion.pressedScale`) | `atoms/pressable` (Reanimated, `pressedScale`) |
| Page transitions | `CustomTransitionPage`, fade, `AppMotion.medium` | native stack defaults; fades on confirmed/rating-sent (`options.animation: "fade"`) |
| Tab switch | `FadeBranchContainer` 220 ms easeOut/easeIn | batch 3 (tab bar is built; cross-fade pending) |
| Content entrance | `FadeSlideIn` slow + standard, `scaleFrom` 0.92 for art | Reanimated `entering` with `duration.slow` / `easing.standard` (batch 3+) |
| Onboarding art | layered entrance 1300 ms + 2600 ms loop (`bounceOut` pin drop) | static SVG now — **D4** |
| Live dot | 1400 ms pulse, scale 1 → 2.6 | `duration.livePulse` in `status-badges` |
| Skeleton | 1300 ms shimmer sweep | `duration.shimmer` — an opacity pulse, simpler than a sweep; same feel |
| Favorite heart | 420 ms, 1 → 1.35 then `elasticOut` | batch 4 (`easing.emphasized`) |
| Queue joined / your turn / rating sent art | 1500–1800 ms phased entrances, `elasticOut` discs, ripple loop | batches 5 + 7 |

## D. Motion system (RN)

- Every timing and curve comes from `src/theme/motion.ts`. No inline numbers in screens.
- Reduce Motion: `useReducedMotion()` → jump or fade instead of slide/scale (the onboarding pager already does it).
- Transitions: native-stack slide for pushes, fade for "result" screens (confirmed, rating sent), cross-fade between tabs.
- Celebrations (`duration.celebrate`) only on success states: queue joined, your turn, rating sent.

## E. Logic

**Ported (with tests):**

| Logic | Flutter | RN |
|---|---|---|
| Fake auth server (OTP 1234, 3 attempts, 60 s resend, 10 min lock) | `fake_server.dart`, auth fakes | `src/lib/api/mock/auth.mock.ts` |
| Egyptian mobile check + when to show the error | `core/utils/validators.dart`, `login_cubit.dart` | `phone-field.utils.ts` |
| Password criteria (8+, a digit) | `register_cubit.dart` | `auth-validation.utils.ts` (from web) |
| Wait status + ±20% range | `WaitEstimate.around` (`features/booking/domain/booking.dart`) | `wait-status.utils.ts` |
| Protected routes + `from` | `app_routes.dart`, `app_router.dart` | `route-guards.ts` |

**To port next:** fake salon catalog (`fake_salon_catalog_remote_data_source.dart`), salon details
(`salon_details_remote.dart`), `BookingPricing` + the shared booking draft (`in_memory_booking_draft_repository.dart`),
queue state machine (`booking_remote.dart`), recent searches.

**Do not copy:**
- `core/utils/digits.dart` (forces Western digits) — reversed by the product owner; see GAPS #3.
- Bloc/Cubit layering — React Query + small `useSyncExternalStore` stores cover it.
- drift cache + outbox — React Query persistence and paused mutations (GAPS §4).
- The app id `com.bltdreeg.customer.bltdreeg_cutsomer_mobile` (placeholder with a typo).
- `CustomPainter` illustrations — port as SVG layers + Reanimated.

## F. Decision list

Open items live in `GAPS.md` so there is one list:

- **§2b B1–B8** — board vs plan (grace period, postpone, check-in, wait, rating, default barber, OTP length, channels).
- **§2c D1–D4** — raised while building batch 2 (Google mark colors, onboarding exit, forgot password, onboarding art).
