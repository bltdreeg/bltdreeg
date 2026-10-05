# Customer mobile app (Expo): gaps

As of 2026-10-05. Compares `apps/customer-mobile` against the Flutter app (`apps/bltdreeg_cutsomer_mobile`),
the web app (`apps/web`), the design board (`apps/web/Beltadreeg customer app design/mobile.html`), and the
backend (`apps/bltdreeg-server`, customer auth spec `docs/superpowers/specs/2026-09-27-customer-auth-api-design.md`).

**Done so far:** web folder structure; Laravel data layer for auth (copied from web); SecureStore session;
React Query; use-intl with ar/en; all 26 routes as placeholders (paths match Flutter, `beltadreeg://` scheme);
route guards; the full Flutter design system (tokens, 53 icons, 11 illustrations) and a dev gallery at `/dev/design-system`.
Typecheck, lint, tests and the Android bundle pass. **Nothing has been run on a device yet.**

---

## 1. Bugs in the current code (fix first)

| # | Gap | Evidence | Fix |
|---|---|---|---|
| 1 | **First launch renders left-to-right.** `I18nManager.forceRTL` (`src/i18n/config.ts`) only applies after a restart, so Arabic users see a mirrored layout on first open. | Expo localization guide: "an app reload is required" | If `I18nManager.isRTL` doesn't match the locale at boot: `forceRTL`, then `reloadAppAsync()` from `expo` (skip in Expo Go, which resets RTL). Reuse for the language switch. |
| 2 | **Plural messages will throw on Hermes.** 22 copied messages use `{count, plural}`; Hermes has no `Intl.PluralRules`. | Hermes `doc/IntlAPIs.md` | Load `@formatjs/intl-pluralrules` (+ its `intl-getcanonicallocales` / `intl-locale` deps) with `ar` and `en` data before `IntlProvider`. |
| 3 | **Digits may show as ٣ instead of 3.** `IntlProvider locale="ar"` formats with the device ICU. The project rule is Western digits everywhere. | Flutter `lib/core/utils/digits.dart`; web `date.utils.ts` uses `ar-EG-u-nu-latn` | Pass `ar-u-nu-latn` to `IntlProvider` (keep `getLocale()` as the app's source of truth). |
| 4 | **Mobile sessions are recorded as `web`.** The server reads the token platform from the `X-Platform` header (default `web`); axios never sends it. `device_name` is sent as `android`/`ios` instead of a device name. | `central-app/.../Customer/Auth/Http/Controllers/{OtpController,PasswordLoginController,SocialLoginController,PasswordResetController,MePhoneController}.php` | `src/lib/api/axios-instance.ts`: add `X-Platform: Platform.OS`. `auth.action.ts`: `DEVICE_NAME = Device.modelName ?? Platform.OS` (`expo-device` is already installed). |
| 5 | **Tab bar has no icons.** | Flutter `lib/core/router/shell/main_shell_scaffold.dart`: home / calendar / search / user, `*_bold` when active | Wire the icons in `src/app/(tabs)/_layout.tsx`, height `sizes.bottomNavHeight`, label `type.navLabel`. |
| 6 | **No refetch when the app returns to the foreground.** React Query on RN needs `focusManager` wired to `AppState`. Live queue status depends on it. | TanStack Query React Native guide | ~5 lines in `src/lib/contexts/providers.tsx`, no dependency. (`onlineManager` + netinfo comes with offline support, §4.) |

## 2. Missing compared to the plan, web and Flutter

| # | Gap | Notes |
|---|---|---|
| 7 | **Complete-profile flow (onboarding gate).** Booking, favorites and rating endpoints return `403 auth.onboarding_required` until the missing steps are done: phone, name + terms, location (skippable), birth date (skippable). | Spec §7.4, §8.5; plan task 16. `tokenStorage.needsOnboarding` is tracked but unused. **Name clash:** web's `/onboarding` = complete profile, Flutter/mobile `/onboarding` = intro slides. Use a separate route, e.g. `complete-profile`, guarded by `hasSession && needsOnboarding`; 🔒 routes need `hasSession && !needsOnboarding`. |
| 8 | **User layer not wired.** Web's `getMe`/`updateMe` and `useUser`/`useUpdateProfile` weren't copied, so after a restart the app has a token but no user, and the onboarding flag never re-syncs. The other `/me` endpoints have no action yet (web doesn't have them either): `PUT /me/password`, `POST /me/phone` + `/verify` (**must store the new token on a merge**), `/me/email/resend` + `/verify`, `PUT /me/location`, `GET /me/location/estimate`, `DELETE /me`. | Copy `user.action.ts` + `use-update-profile.hook.ts` as-is; `use-user.hook.ts` reads a DOM cookie, so it needs a small mobile version. |
| 9 | **Login doesn't return you where you were.** A guest opening a 🔒 route lands on home; Flutter sends them to `login?from=…` and back after sign-in. | `ponytail:` note in `src/app/_layout.tsx`. Do it with the real login screen. |
| 10 | **OTP without a pending challenge** should redirect to `login?method=phone` (Flutter `app_router.dart`). | With the real OTP screen. |
| 11 | **Guest vs signed-out.** Flutter keeps a `guest_mode` pref (`AuthStatus.guest` vs `unauthenticated`). | Decide when building login/account. |
| 12 | **No storage for non-secret local data.** Web keeps the selected area and favorites in `localStorage` (favorites until the backend exists), Flutter keeps `selected_area_id`, `guest_mode` and recent searches. Mobile only has SecureStore (meant for secrets, small values); `app-preferences.ts` and the locale also use it today. | Add `expo-sqlite/kv-store` (AsyncStorage-compatible) and move the prefs there. |
| 13 | **App identity is still the template's.** Name `customer-mobile` (Flutter: `Beltadreeg`, Arabic `بالتدريج`), no `android.package` / `ios.bundleIdentifier`, Expo's blue splash (`#208AEF`) and default icon. Flutter's id is a placeholder with a typo (`com.bltdreeg.customer.bltdreeg_cutsomer_mobile`); no real launcher icon exists in either app (the brand mark is a teal rounded square with scissors, `brand_mark.dart`). | **Decision needed:** bundle id and an app icon. Splash should be white like Flutter. |
| 14 | **Mobile-only text lives in Flutter's ARB, not the web JSON.** Onboarding slides, queue states, rating labels, notifications, etc. Flutter has 565 strings; web messages have 848 but mostly web pages. | Port the needed strings into `src/i18n/messages/*.json` screen by screen. |
| 15 | **Housekeeping.** Unused template images in `assets/images` (`react-logo*`, `expo-badge*`, `expo-logo.png`, `logo-glow.png`, `tutorial-web.png`, `tabIcons/`); no `.env.example` for `EXPO_PUBLIC_API_URL`; `apps/customer-mobile` is not committed. | |

## 3. Blocked on the backend

- **No customer endpoints beyond auth and `/me`.** The central app only has `Customer/Auth` routes. Salons, search,
  availability, bookings, queue, favorites, ratings and notifications don't exist yet.
  **Decision needed:** how mobile screens get data meanwhile. Web uses mock constants (`src/lib/data/*.constants.ts`),
  Flutter uses a fake server (`lib/core/network/fake_server.dart`).
- **Push token registration** endpoint (spec §14 follow-up; feature 05 says every queue event is a push).
- **Queue WebSocket** (Flutter: `queueSocketUrl` + `/bookings/{id}` in `booking_remote.dart`).
- **Social login for mobile**: the server checks `aud` against configured client ids. iOS/Android client ids must be
  added. Apple requires a `nonce` and sends names only on first sign-in (spec §8.4).

## 4. Features not started (Flutter has them)

| Feature | Flutter | Expo equivalent |
|---|---|---|
| Push notifications + notification center | (push not wired yet) | `expo-notifications` |
| Live queue updates | `web_socket_channel` | built-in `WebSocket` |
| Offline banner + full-screen offline | `connectivity_plus`, `connectivity_views.dart` | `@react-native-community/netinfo` + React Query `onlineManager` |
| Offline cache (show cached, then refresh) | drift `CacheEntries` | React Query persistence (`@tanstack/query-async-storage-persister` over the KV store) |
| Offline writes (e.g. favorite on the metro) | drift `OutboxEntries` + `OutboxProcessor` | React Query paused mutations + persistence |
| Google / Apple sign-in | social buttons (`google.svg`, `apple.svg`) | `expo-apple-authentication`; Google via a native sign-in library |
| Device location for `PUT /me/location` | (fake backend) | `expo-location`, fall back to the IP estimate |
| Photos in a rating | `image_picker` (`features/rating/data/photo_picker.dart`) | `expo-image-picker` |
| Share a salon | `share_plus` | RN `Share` |
| Directions / call / external links | `url_launcher` (`external_links.dart`) | `Linking`, `expo-web-browser` for terms/privacy |
| Language switch | `language_page.dart` | `setLocale` + reload (gap 1) |
| Bottom sheets and dialogs (filter, area picker, logout, leave queue, discard changes) | `overlays.dart` | needs `GestureHandlerRootView` at the root + a sheet component |
| Toasts | `context.showToast` | toast component in `providers.tsx` |
| Illustration labels + layered onboarding animation | `IllustrationCanvas`, `IllustrationLabel` | layers are in `assets/illustrations/onboarding_*/`; port with the onboarding screen |
| Booking draft shared across slot → barber → review | one shared cubit | web uses `booking-context.tsx` + query params; pick one |
| ~60 core widgets (button, text field, OTP input, chips, tabs, cards, top bar, rating, skeleton, empty state, salon tiles…) | `lib/core/widgets/*` | port into `components/` as each screen needs them |

## 5. Quality and tooling

- **No device run yet.** Check: the design-system gallery (tint, mirrored chevrons, Cairo weights, line heights),
  onboarding → home, guards, deep link `beltadreeg://salon/42`.
- **Hermes `Intl` on device:** `date.utils.ts` uses `ar-EG-u-nu-latn`, and `IntlProvider` sets `timeZone="Africa/Cairo"`. Confirm both on Android and iOS.
- **Tests:** only the 25 util tests copied from web. No test for `token-storage.ts` / `app-preferences.ts`.
  Flutter enforces layering with `test/architecture/layering_test.dart`; the equivalent here is an ESLint
  `no-restricted-imports` rule (components can't import `lib/actions` or `lib/api`).
- **Build/CI:** no `eas.json`, no CI.
- **Startup:** Cairo is loaded at runtime with `useFonts`; embedding it with the `expo-font` config plugin would shorten the splash.
- **Lint:** 8 warnings, all in files copied verbatim from web (kept identical on purpose).

## Suggested order

1. Section 1 (bugs 1–6). Small, and all in existing code.
2. Decisions: bundle id + icon (13), mock-data approach (§3).
3. User layer + complete-profile flow (7, 8), KV storage (12).
4. Then screens, porting components and ARB strings as each one needs them.
