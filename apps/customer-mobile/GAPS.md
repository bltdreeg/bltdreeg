# Customer mobile app (Expo): gaps

As of 2026-10-05. Compares `apps/customer-mobile` against the Flutter app (`apps/bltdreeg_cutsomer_mobile`),
the design board (`apps/web/Beltadreeg customer app design/mobile.html`), and the
backend (`apps/bltdreeg-server`, customer auth spec `docs/superpowers/specs/2026-09-27-customer-auth-api-design.md`).

**Done so far:** web folder structure; Laravel data layer for auth (copied from web); SecureStore session;
React Query; use-intl with ar/en; all 26 routes as placeholders (paths match Flutter, `beltadreeg://` scheme);
route guards; the full Flutter design system (tokens, 53 icons, 11 illustrations) and a dev gallery at `/dev/design-system`.
Typecheck, lint, tests and the Android bundle pass.

**Phase 1 of the design-board build (2026-10-05):** bugs 1–6 below are fixed; the splash is white (half of 13);
mock API (`src/lib/api/mock/`, auth ported from Flutter's fake); `useResponsive` + scaled `Text`; the atom/molecule
library is in `/dev/design-system`. Runs on the Android emulator (RTL, LTR, 360×640 → 820×1180, 140% font).
Also fixed on device: `/` always redirected to `/home`, which is guarded by `onboardingSeen`, so a fresh install
showed a blank screen; deep-linked screens had no back target.

**Batch 2 — real auth journey (2026-10-06):** splash → onboarding 01–03 → login 04/05 → register 06 → OTP 19/20 → Home,
guest mode, guest → login prompt → back to where they were. Verified on the emulator end to end (§6), decisions it
raised in §2c. Unbuilt routes show a "coming soon" screen, not link lists.

---

## 0. English freeze

English frozen (user, 2026-10-06): Arabic-only copy for new screens; en.json is behind; the Language row is hidden; English is a later batch.

## 1. Bugs in the current code (fix first)

| # | Gap | Evidence | Fix |
|---|---|---|---|
| 1 | ✅ fixed — **First launch renders left-to-right.** `I18nManager.forceRTL` (`src/i18n/config.ts`) only applies after a restart, so Arabic users see a mirrored layout on first open. | Expo localization guide: "an app reload is required" | If `I18nManager.isRTL` doesn't match the locale at boot: `forceRTL`, then `reloadAppAsync()` from `expo` (skip in Expo Go, which resets RTL). Reuse for the language switch. |
| 2 | ✅ fixed — **Plural messages will throw on Hermes.** 22 copied messages use `{count, plural}`; Hermes has no `Intl.PluralRules`. | Hermes `doc/IntlAPIs.md` | Load `@formatjs/intl-pluralrules` (+ its `intl-getcanonicallocales` / `intl-locale` deps) with `ar` and `en` data before `IntlProvider`. |
| 3 | 🔁 **reversed 2026-10-05 by the product owner** — Arabic-Indic digits in Arabic, Western in English, through one formatter (`src/lib/utils/format/number-format.utils.ts`); data, API payloads, the phone field and OTP cells stay Western. Original row: **Digits may show as ٣ instead of 3.** `IntlProvider locale="ar"` formats with the device ICU. The project rule is Western digits everywhere. | Flutter `lib/core/utils/digits.dart` | Pass `ar-u-nu-latn` to `IntlProvider` (keep `getLocale()` as the app's source of truth). |
| 4 | ✅ fixed — **Mobile sessions are recorded as `web`.** The server reads the token platform from the `X-Platform` header (default `web`); axios never sends it. `device_name` is sent as `android`/`ios` instead of a device name. | `central-app/.../Customer/Auth/Http/Controllers/{OtpController,PasswordLoginController,SocialLoginController,PasswordResetController,MePhoneController}.php` | `src/lib/api/axios-instance.ts`: add `X-Platform: Platform.OS`. `auth.action.ts`: `DEVICE_NAME = Device.modelName ?? Platform.OS` (`expo-device` is already installed). |
| 5 | ✅ fixed — **Tab bar has no icons.** | Flutter `lib/core/router/shell/main_shell_scaffold.dart`: home / calendar / search / user, `*_bold` when active | Wire the icons in `src/app/(tabs)/_layout.tsx`, height `sizes.bottomNavHeight`, label `type.navLabel`. |
| 6 | ✅ fixed — **No refetch when the app returns to the foreground.** React Query on RN needs `focusManager` wired to `AppState`. Live queue status depends on it. | TanStack Query React Native guide | ~5 lines in `src/lib/contexts/providers.tsx`, no dependency. (`onlineManager` + netinfo comes with offline support, §4.) |

## 2. Missing compared to the plan and Flutter

| # | Gap | Notes |
|---|---|---|
| 7 | ⏸ waits on social sign-in (batch 13 check) — only Google/Apple sign-in can create an account with no phone, name or terms (register and phone login always have them), and the server applies its `customer.onboarded` middleware to no route yet. Build it with real Google/Apple sign-in (§3). **Complete-profile flow (onboarding gate).** Booking, favorites and rating endpoints return `403 auth.onboarding_required` until the missing steps are done: phone, name + terms, location (skippable), birth date (skippable). | Spec §7.4, §8.5; plan task 16. `tokenStorage.needsOnboarding` is tracked but unused. Mobile `/onboarding` is the intro slides, so use a separate route, e.g. `complete-profile`, guarded by `hasSession && needsOnboarding`; 🔒 routes need `hasSession && !needsOnboarding`. |
| 8 | 🟡 partly done (batch 6–7: `getMe`/`updateMe`/`deleteMe`, `useCurrentUser`, `useUpdateProfile`, `useDeleteAccount`); the rest below is still open. **User layer.** The onboarding flag still never re-syncs from `/me`. These `/me` endpoints have no action yet: `PUT /me/password`, `POST /me/phone` + `/verify` (**must store the new token on a merge**), `/me/email/resend` + `/verify`, `PUT /me/location`, `GET /me/location/estimate`. | Add each with the screen that needs it (change phone and password are help-only today). |
| 9 | ✅ fixed — **Login doesn't return you where you were.** A guest opening a 🔒 route lands on home; Flutter sends them to `login?from=…` and back after sign-in. | `ponytail:` note in `src/app/_layout.tsx`. Do it with the real login screen. |
| 10 | ✅ fixed — **OTP without a pending challenge** should redirect to `login?method=phone` (Flutter `app_router.dart`). | With the real OTP screen. |
| 11 | **Guest vs signed-out.** Flutter keeps a `guest_mode` pref (`AuthStatus.guest` vs `unauthenticated`). | Decide when building login/account. |
| 12 | ✅ fixed (batch 10) — `expo-sqlite/kv-store` via `lib/utils/device-prefs.ts` (prefs, recent searches, locale; old SecureStore values copied over once on first read); SecureStore keeps the token only. **No storage for non-secret local data.** Flutter keeps `selected_area_id`, `guest_mode` and recent searches. Mobile only has SecureStore (meant for secrets, small values); `app-preferences.ts` and the locale also use it today. | Add `expo-sqlite/kv-store` (AsyncStorage-compatible) and move the prefs there. |
| 13 | 🟡 applied (id, name, splash, adaptive icon); open: a ≥1024 logo from design for a sharp icon. **App identity is still the template's.** Name `customer-mobile` (Flutter: `Beltadreeg`, Arabic `بالتدريج`), no `android.package` / `ios.bundleIdentifier`, Expo's blue splash (`#208AEF`) and default icon. Flutter's id is a placeholder with a typo (`com.bltdreeg.customer.bltdreeg_cutsomer_mobile`); no real launcher icon exists in either app (the brand mark is a teal rounded square with scissors, `brand_mark.dart`). | **Decided 2026-10-05:** `com.beltadreeg.customer` (both platforms), name `بالتدريج` / `Beltadreeg`, slug `beltadreeg-customer`. Icon + splash from the web logo `apps/web/public/logo-mark.png` (496×521 — fine for the splash, soft at 1024; ask design for an SVG or a ≥1024 PNG), white background. **Applied in `app.json`** (`com.beltadreeg.customer`, name `بالتدريج`, slug `beltadreeg-customer`, adaptive icon + white splash logo `#FFFFFF`). |
| 14 | **Mobile-only text lives in Flutter's ARB.** Onboarding slides, queue states, rating labels, notifications, etc. (565 strings). | Port the needed strings into `src/i18n/messages/*.json` screen by screen. |
| 15 | **Housekeeping.** Unused template images in `assets/images` (`react-logo*`, `expo-badge*`, `expo-logo.png`, `logo-glow.png`, `tutorial-web.png`, `tabIcons/`); no `.env.example` for `EXPO_PUBLIC_API_URL`; `apps/customer-mobile` is not committed. | Template images in `assets/images` are deleted. |

## 2b. Design board vs `bltdreeg-plan` — NEEDS DECISION

The screens follow `mobile.html` (and Flutter, which follows it) until you decide.

| # | Topic | Board (built) | Plan | Options | Recommendation |
|---|---|---|---|---|---|
| B1 | Grace period when called | 5-min countdown | "absent call" by the barber | A board timer · B barber marks absent · C timer, then the barber confirms | **C** — the customer sees the timer; nobody is dropped by a clock alone |
| B2 | Postpone ("أجّل دوري") | 1 place | 1–3 places | A 1 · B picker 1–3 | **A** — one tap, fewer queue reshuffles; add B if salons ask |
| B3 | Check-in | "أنا في المحل" button | QR scan | A button · B QR · C button + geofence | **A now**, C later — no camera permission, works offline |
| B4 | Wait time | range ±20% | one number | A range · B number | **A** — honest about uncertainty (`waitRange` already does it) |
| B5 | Rating | overall + quality / cleanliness / time accuracy | barber stars + salon stars | A board · B plan | **A** — maps to what the salon controls; the barber is on the booking |
| B6 | Default barber | "any barber" preselected | chosen per chair | A any · B must choose | **A** — shortest wait, one step less |
| B7 | OTP length | 4 cells | 6 (auth spec) | the UI reads `challenge.codeLength` | **6 on the server** (security); the UI already follows the server |
| B8 | Notification channels | push + SMS | push only | A both · B push · C push + SMS for "your turn" only | **C** — SMS costs money; only the time-critical event needs it |

## 2c. Decisions raised while building (batch 2) — NEEDS DECISION

| # | Topic | Built now | Options | Recommendation |
|---|---|---|---|---|
| D1 | Google button mark | multicolor "G" | A multicolor (Google branding rules) · B grey like the board | ✅ **A** (user, batch 13) — already built multicolor (`assets/icons/google.svg`) |
| D2 | After the last onboarding slide | Flutter + board: "ادخل على الصالونات" → Home as guest; "عندي حساب" → login | A as built · B always login first (journey step 1 in your brief) | **A** — browsing without an account is the board's promise; login is asked for only when booking |
| D3 | "نسيت كلمة السر؟" | phone → code → new password → signed in | A build the reset flow now · B later | ✅ **A** (user, batch 13) — `forgot-password` → OTP `purpose=reset_password` → `new-password`; built from board pieces (frame 05 phone field, 19/20 code, 06 password rules). Neither the board nor Flutter draws it, so 6 strings are new and **need design review**: `auth.forgotSubtitle`, `newPasswordTitle`, `newPasswordSubtitle`, `newPassword`, `savePassword`, `passwordChanged` (toast). Phone only — email reset needs a verified email; add a tab if design wants it. |
| D4 | ✅ done (batch 11: animated, Flutter port; reduced motion = final frame) — Onboarding illustrations | static SVG per slide | A port Flutter's layered animation · B keep static | **A in the polish batch** — layers are already in `assets/illustrations/onboarding_*` |
| D5 | OTP wrong-code state (found in Step 0) | the countdown shows under the error until resend opens | A show the countdown under the error too · B as built | ✅ **A** (batch 13) — frame 20 is the state after the countdown; device-checked |
| D6 | OTP at 140% font, 360×640, keyboard open (found in Step 0) | cells, countdown and "تأكيد" all visible | A scale the offset with `fontScale` · B accept for the edge case | ✅ fixed (batch 13) — measured at 140%: everything fit, only the cells' focus halo was clipped, with ~57 dp spare under "تأكيد" → `keyboardOffset` 205 → 195 |
| D7 | "ادخل الطابور" target (batch 4) | → barber (24, board journey); Flutter goes to a time-slot step first that the board doesn't draw | A barber → confirm (board) · B Flutter's slot step before barber | ✅ **B — decided by the user 2026-10-07** ("امتي تحب تيجي" before the barber). Built in batch 5: slot step (now / day + time), barber per slot, review time row, scheduled bookings (upcoming, cancel) |
| D8 | Photo viewer swipe (batch 4) | RTL: swipe right = next photo | A as built · B RTL (swipe right = next) | ✅ **B** (batch 13) — the viewer uses `useSwipePager` (onboarding's Pan + Reanimated pager, now shared) instead of a FlatList; reversed data and `inverted` both failed because Android's RTL scroller flips them back. Device-checked: opens on the tapped photo, right = next |

## 2d. Libraries: brief → this repo

| Brief asked for | Used here | Why |
|---|---|---|
| Expo + expo-router | same (SDK 57, typed routes, `Stack.Protected`) | — |
| i18next | `use-intl` | shares message JSON and ICU plurals with the web app |
| zustand | `useSyncExternalStore` stores (`app-preferences.ts`, `connectivity.ts`) + React Query | three tiny stores; a library adds nothing yet |
| React Query | `@tanstack/react-query` (+ `focusManager` / `onlineManager`) | — |
| fetch client | `axios` + a mock adapter (`src/lib/api/mock`) | copied from web; the mock turns off with `EXPO_PUBLIC_API_MOCK=0` |
| Cairo | `@expo-google-fonts/cairo`, one family per weight | — |
| react-native-svg | same (53 icons, 11 illustrations from Flutter) | — |
| safe-area-context | same | — |
| Reanimated | Reanimated 4 + worklets; every timing in `src/theme/motion.ts` | — |
| @gorhom/bottom-sheet | same, but `BottomSheet` inside a transparent RN `Modal` (`components/organs/sheet`) | `BottomSheetModal`'s portal never opens with Reanimated 4.5 / RN 0.86 (present() runs, index stays −1); inputs in a sheet use `TextField inSheet` (`BottomSheetTextInput`) or the sheet won't lift above the keyboard |
| flash-list | `@shopify/flash-list` | — |
| netinfo | same, + a simulated-offline switch for QA | — |
| expo-haptics | same | — |
| (not in brief) keyboard | `react-native-keyboard-controller` | keeps the focused field and CTA above the keyboard on both platforms |
| (not in brief) session storage | `expo-secure-store` + `expo-sqlite/kv-store` | tokens in SecureStore; non-secret prefs in kv-store (#12, batch 10) |
| (not in brief) Hermes `Intl` | `@formatjs/intl-pluralrules` + `intl-locale` | Hermes has no `PluralRules` |
| (not in brief) phone parsing | `libphonenumber-js` | copied from web; the Egyptian mobile check is a local regex |
| (not in brief) interactive controls | `@rn-primitives/{switch,checkbox,radio-group,tabs}` 1.5.2 (dialog, accordion, slider, select later) | role/state/press behavior; the look stays ours. `Checkbox.Root` drops `asChild`, so `Checkbox` styles the primitive's own Pressable (`hitSlop` to 44); `Switch` sends English "on"/"off" as value text, so `Toggle` blanks it |
| (not in brief) UI kit | none: no Paper / Tamagui / gluestack, no `@expo/ui` | they don't match the board; `@expo/ui`, `expo-glass-effect`, `expo-symbols` removed (Step 0) |
| (not in brief) dev build | `expo-dev-client` | iOS/Android development builds via EAS |

## 2e. Board vs Flutter, per frame

| Frame | Difference | Board | Flutter | Outcome |
|---|---|---|---|---|
| 07 | Bell unread dot | red dot | from unread notifications | ✅ Flutter (live since batch 7) |
| 07 | "شوف الكل" targets | links | available → search leastWait + open now; recommended → chip sort; new → newest | Flutter |
| 07 | Closed salon row | no tag on the thumb | "مقفول" tag | Board (no tag); the wait line already says "بيفتح الساعة…" |
| 07 | Rail "new" badge size | 24 high, 11.5 px | same | our `Badge` is 26/12 — kept (2 px) |
| 08 | Chips offline | 3, dimmed | 4, disabled | Board look (dimmed, none selected), Flutter's 4 chips |
| 08 | "آخر صالونات شوفتها" | 2 rows | recently opened, topped up with nearest, max 5 | Flutter; the 5 nearest until batch 4 records views |
| 18 | Tab bar | dimmed .45 | normal | deviation: not dimmed |
| 40 | Search field height | 46 | 52 | ours 52 (`SearchField` has one height) |
| 40 | "Use my location" | permission card | asks permission, picks area | Flutter; picks the first nearby area (stub until the backend has area polygons) |
| 21 | Sticky bar with nothing selected | "خدمة واحدة · ٧٠ ج.م" though no row is selected | "اختار خدمة", button disabled | Flutter (the board's state is inconsistent) |
| 21 | Tabs | separate panes implied | one scroll, tabs jump + track the section | Flutter (22/23 show several tabs' content in one scroll) |
| 21 | CTA target | → barber (24) | → time slot | ✅ Flutter (D7 = B, user 2026-10-07): → "امتى تحب تيجي؟" |
| 22 | Years label | "٦ سنين خبرة" / "٤ سنين" | always "… خبرة" | Flutter (consistent) |
| 23 | Day names | الأربع، التلات، الاتنين (colloquial) | Intl names (الأربعاء…) | Board |
| 39 | Counts | 12 photos, place 4, all 13 | 7 work + 5 place + 1 video = 13 | Flutter (board numbers don't add up) |
| — | Step 1 "امتى تحب تيجي؟" | not drawn | now / day chips + times by period | Flutter (D7 = B, user 2026-10-07) |
| 24 | Steps | "الخطوة ٢ من ٣" | step 2 of 3 (slot = step 1) | Same bar |
| 24 | Barber at a booked time | not drawn | "فاضي · ١٢:٣٠ م" / "مش فاضي في المعاد ده", no "الأسرع" badge | Flutter |
| 24 | Initials "محمود السيد" | "م س" | "م ا" (first letter of each word) | ✅ Board (batch 11): `initials` skips "ال" |
| 25 | Time row | none | "المعاد · … غيّر" | Flutter (D7) |
| 25 | Discount line | "باقة قصة + دقن" | "خصم الباقة" | Flutter (one generic label; offer titles carry prices) |
| 25/26/27 | Scheduled booking | not drawn | slot card + 10 min policy, "أكّد الحجز", appointment card + "حجوزاتي", upcoming + "الغي الحجز" dialog | Flutter (D7) |
| 26 | After confirming | note says it moves to tracking by itself | stays, "تابع دورك" button | Flutter (the board frame itself draws the button) |
| 29 | Way out | no leave action, no back | quiet "اطلع من الطابور" link | Flutter (otherwise no way out) |
| — | In service / completed / missed / left / cancelled | not drawn | full-screen states | Flutter |
| 09 | Second card | "مستني تأكيد الصالون" + "إلغاء" | appointment card "معاد محجوز"; cancel opens the booking | Flutter (no salon-confirmation state exists) |
| 09 | Active card colors | note says dark; drawn teal tint | teal tint | Board drawing = Flutter |
| 09–11 | Guest | not drawn | fake data shows without auth | Sign-in empty state (the bookings mock needs auth) — deviation |
| 10 | Past caption | weekday + date + time | day + month + time | Flutter (the weekday pushes the badge off) |
| 10 | Rebook | same salon, service, barber | same services + barber in the draft, starts at the time step | Flutter (time step = D7) |
| 12 | Nearby list | 4 rows | every salon in the area, by wait | Flutter |
| 14 | Price slider | two thumbs | `RangeSlider`, 5 EGP steps | own `RangeSlider` (`@rn-primitives/slider` is single-value) — deviation from the component rule |
| 14 | Days | 4 chips | 4 chips (today + 3) | same |
| 15 | Actions | clear filters + widen to 10 km | same, each only when it can help | Flutter |
| 16 | Language row | shown | shown | Hidden (English freeze) |
| 16 | "الإعدادات" row | shown (gear) | not there (no settings page) | Flutter |
| 16 | Rows' values | "١ نشط", "٣" | active bookings count, favorites count; hidden when 0 | Flutter |
| 16 | Stats | ١٤ cuts, ٣ favorites | completed visits, favorites count | Flutter (from bookings + favorites) |
| 43 | Language row (guest) | shown | shown | Hidden (English freeze) |
| 31 | Visit date | "النهارده ٧:٢٠ م" | day + time | "{day} الساعة {time}" (`useBookingLabels().timing`, same as the booking steps) |
| 31 | Time accuracy note | "قال ٢٠ د واستنيت ٢٥ د" | quoted wait at join vs served − joined | Flutter; mock adds `quoted_wait_minutes` + `served_at` (seeded 20 / 25 like Flutter) |
| 31 | Add photo | one button | camera / gallery sheet, max 3, thumbnails with × | Flutter (`expo-image-picker`, already in the build) |
| 31 | Not completed / already rated | not drawn | "التقييم لسه مش متاح" / straight to 41 | Flutter |
| 31 | Offline submit | not drawn | saved on the device, sent later (outbox) | Deviation: no outbox — the submit fails with a toast; outbox with the backend |
| 41 | Already a favorite | not drawn | "اتضاف للمفضلة" + filled heart, no button | Flutter |
| 32 | Highlight | queue items with a side stripe | only unread "حان دورك" / "فاضلك واحد" | Flutter |
| 32 | Tap | — | queue kinds → queue, rate reminder → rate, offer → salon; marks read | Flutter |
| 33 | Empty | drawn | same | ✅ device-checked in batch 12 |
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
| — | Copy drift (batch 12 audit) | — | a11y password, coming soon, auth network/generic, register password rule, "غير مقروء" | ✅ Flutter ARB wording; register shows the one failing rule like Flutter |
| 08 | Offline bar with no update time | always "آخر تحديث الساعة …" | always has a time | Kept "مفيش نت — الأرقام دي مش متحدّثة" as the fallback when no data was ever loaded (no time to show) |
| 32 | Notifications load error | not drawn | no error state (fake stream) | Kept "معرفناش نجيب الإشعارات" (Flutter's "معرفناش نجيب …" pattern) |
| 33 | Empty | drawn | same | ✅ device-checked in batch 12 (mock emptied for the check) |
| — | Loading skeletons (batch 8) | not drawn in mobile.html; web.html §03: `#F1F3F5` boxes, title/price lines `#EDEFF2`, static | `Shimmer`: `surf` `#F7F8FA` boxes + darker band `#EDEFF2` sweeping every 1300 ms; salon-row skeletons on search/favorites | ✅ Board colors + Flutter sweep (2026-10-07): `skeleton`/`skeletonStrong` fills, `#E5E7EB` band — see `docs/plans/skeleton-board-colors.md` |
| — | Link can't open (batch 8) | — | toast "مش قادرين نفتح التطبيق ده على موبايلك" | ✅ Flutter (app-wide `showToast`; not device-checked — the emulator has maps + dialer) |
| — | Session expired (batch 8) | — | "جلستك انتهت. سجّل دخولك تاني." | ✅ toast when a 401 clears a live token (not device-checked — the mock has no expiry) |
| 40 | "Use my location" result (batch 8) | — | toast "حددنا منطقتك: {area}" | ✅ Flutter (toast inside the sheet) |
| 19 | Code accepted (batch 8) | — | cells turn green + 1.06 scale, 650 ms hold, medium haptic; wrong code = heavy haptic | ✅ Flutter |
| 36 | Saved (batch 8) | — | medium haptic + toast | ✅ Flutter |
| 21 | Pull to refresh (batch 8) | — | `RefreshIndicator` under the pinned bar | ✅ Flutter |
| 26 | Joined illustration (batch 8) | static | check draws itself, haptic when drawn | ✅ Flutter (batch 11): halo, disc, drawn check, ripple, confetti; medium haptic when drawn |
| 16/36 | Avatar ring (batch 11) | 1px `teal-t2` ring on the account header and profile | — | ✅ Board (`Avatar ring`) |
| 21 | Tab strip at 140% (batch 11) | — | — | ✅ the active tab scrolls into view |

**Batch 3 deviations (2026-10-07):** salon names get a direction mark (RLM in Arabic) so "Barber Point دجلة" lays out RTL like the board — Android ignores `writingDirection`. `Area.isNearby` added. Mock queue drift is computed per request (every 15 s by React Query); real push comes with the backend.

**Batch 4 deviations (2026-10-07):** the shared `Barber`/`Review`/`Service` types don't fit the salon page (no day-off date, no review photos/reply/barber id) — mobile has its own `SalonPage` types in `lib/types/salon/salon-page.interface.ts`; offers reuse `SalonOffer`. Favorites and recently viewed are mock/in-memory until the backend; recently viewed resets on relaunch.

**Batch 5 deviations (2026-10-07):** the shared `Booking` type is a scheduled appointment (startAt, bookingCode) and doesn't fit the queue — mobile has `QueueBooking` (`lib/types/booking/queue-booking.interface.ts`, from Flutter `booking.dart`; `startAt` set = scheduled). Day + time read "النهارده الساعة ١٢:٣٠ م" instead of Flutter's "{day} · {time}": with Arabic-Indic digits the "·" next to "٠" reads as another zero. "~N" / "+N" are LTR-isolated like Flutter. The live queue polls every 5 s and the mock queue moves only when polled (real push = backend). Bookings and slot holds are in memory (reset on relaunch). Haptics follow Flutter (heavy on your turn, medium on almost/completed).

**Batch 6 deviations (2026-10-07):** bookings for guests show a sign-in empty state (Flutter's fake shows data without auth). Past bookings carry `rating` on the booking (Flutter keeps ratings in a separate repository) — the batch 7 rating flow must set it. The account header reads the user from `GET /me` (`useCurrentUser`, same `QK_USER` cache login fills) so it survives a cold start. Shared pieces added: `Text digits` (big numbers), `DateChip` moved to `molecules/chip`, `utils/day-keys.ts`, `ListRow iconColor`. The dev-only "Log out (dev)" button is gone (real sign-out exists); "Design system" stays inside `__DEV__`.

**Batch 7 deviations (2026-10-07):** ratings submit online only (Flutter queues them in an outbox); photos go as uris in the JSON body (Flutter: multipart) — both wait for the backend endpoint. The profile's area is the device-selected area (no area on `Customer`). Notification settings live on the device like Flutter. New packages: `@react-native-community/datetimepicker` 9.1.0 (native — dev client rebuilt with `gradlew :app:installDebug`, `ANDROID_SERIAL=emulator-5554`), `@rn-primitives/accordion`. `AreaSheet` moved to `components/organs/area-sheet` (Home + profile); `Meta` exported from `salon-card` (booking cards, rate) and `SalonListItem` takes an `action`.

## 3. Blocked on the backend

- **Salon photos are demo images until the API sends them** (batch 13). `lib/data/salon-photos.ts` uses the web's
  `public/dummy_salon` images (9 unique, `5.png` = `4.png`; 800 px JPEG, ~750 KB in all) in cards, booking thumbs, the salon
  hero, gallery and viewer. A real `image_url` / gallery `url` always wins; the image is picked from the id, so a salon looks
  the same everywhere. Delete the folder and the fallback once the API has images. Videos show a still + play button.

- **No customer endpoints beyond auth and `/me`.** The central app only has `Customer/Auth` routes. Salons, search,
  availability, bookings, queue, favorites, ratings and notifications don't exist yet.
  Meanwhile mobile runs on its mock adapter (`src/lib/api/mock`, ported from Flutter's fake server; off with `EXPO_PUBLIC_API_MOCK=0`).
- **Push token registration** endpoint (spec §14 follow-up; feature 05 says every queue event is a push).
- **Queue WebSocket** (Flutter: `queueSocketUrl` + `/bookings/{id}` in `booking_remote.dart`).
- **Social login for mobile**: the server checks `aud` against configured client ids. iOS/Android client ids must be
  added. Apple requires a `nonce` and sends names only on first sign-in (spec §8.4).

## 4. Features Flutter has (✅ = built since)

| Feature | Flutter | Expo equivalent |
|---|---|---|
| Push notifications + notification center | (push not wired yet) | `expo-notifications` |
| Live queue updates | `web_socket_channel` | built-in `WebSocket` |
| ✅ Offline banner + full-screen offline | `connectivity_plus`, `connectivity_views.dart` | `@react-native-community/netinfo` + React Query `onlineManager` |
| Offline cache (show cached, then refresh) | drift `CacheEntries` | React Query persistence (`@tanstack/query-async-storage-persister` over the KV store) |
| Offline writes (e.g. favorite on the metro) | drift `OutboxEntries` + `OutboxProcessor` | React Query paused mutations + persistence |
| Google / Apple sign-in | social buttons (`google.svg`, `apple.svg`) | `expo-apple-authentication`; Google via a native sign-in library |
| Device location for `PUT /me/location` | (fake backend) | `expo-location`, fall back to the IP estimate |
| ✅ Photos in a rating | `image_picker` (`features/rating/data/photo_picker.dart`) | `expo-image-picker` |
| ✅ Share a salon | `share_plus` | RN `Share` |
| ✅ Directions / call / external links | `url_launcher` (`external_links.dart`) | `Linking`, `expo-web-browser` for terms/privacy |
| Language switch | `language_page.dart` | `setLocale` + reload (gap 1) |
| ✅ Bottom sheets and dialogs (filter, area picker, logout, leave queue, discard changes) | `overlays.dart` | needs `GestureHandlerRootView` at the root + a sheet component |
| ✅ Toasts | `context.showToast` | `useToast` per screen + app-wide `showToast`/`ToastHost` (batch 8) |
| ✅ Illustration labels + layered onboarding animation | `IllustrationCanvas`, `IllustrationLabel` | batch 11: `screens/onboarding/__components/onboarding-art.tsx` |
| ✅ Booking draft shared across slot → barber → review | one shared cubit | `lib/utils/booking-draft.ts` store (batch 4) |
| ✅ ~60 core widgets (button, text field, OTP input, chips, tabs, cards, top bar, rating, skeleton, empty state, salon tiles…) | `lib/core/widgets/*` | port into `components/` as each screen needs them |

## 5. Quality and tooling

- **Windows builds need `node-linker=hoisted`** (`.npmrc`). With pnpm's default layout the native CMake paths pass
  260 chars and the SDK's ninja loops on "build.ninja still dirty after 100 tries".
- **Metro runs on 8090** for everyone: `pnpm start|dev|mobile|ios` pass `--port 8090`, and `.env` sets `RCT_METRO_PORT`.
- **Changing the device display size (density) restarts the JS app**: Android recreates the activity (`density` is not
  in `configChanges`). Normal Android behavior; in-memory state such as a pending OTP challenge is lost.
- **Hermes `Intl` on device:** `date.utils.ts` uses `ar-EG-u-nu-latn`, and `IntlProvider` sets `timeZone="Africa/Cairo"`. Confirm both on Android and iOS.
- **Tests:** 87 node tests (utils, mock rules incl. password reset, pref migration, toast bus). Native-backed stores (`token-storage`, `app-preferences`) have no Node test — their logic is `migrate-pref.ts`, which is tested.
- ✅ **Layering (batch 10):** ESLint `no-restricted-imports` — `components/`, `screens/`, `app/` can't import `lib/actions` or `lib/api` (types allowed); `lib/` can't import UI. Same idea as Flutter's `test/architecture/layering_test.dart`.
- **Build/CI:** `eas.json` exists (development, development-simulator, preview, production; mock on except production). Open: `eas init` on the Expo account, iOS build, CI.
- ✅ **Startup (batch 10):** Cairo is embedded with the `expo-font` config plugin (Android names = file names, iOS = PostScript names, picked in `tokens.font`); no runtime `useFonts` wait. iOS names to confirm on the EAS build.
- **Lint:** 8 warnings, all in files copied verbatim from web (kept identical on purpose).

## Suggested order

1. Section 1 (bugs 1–6). Small, and all in existing code.
2. Decisions: bundle id + icon (13), mock-data approach (§3).
3. User layer + complete-profile flow (7, 8), KV storage (12).
4. Then screens, porting components and ARB strings as each one needs them.

## 6. Batch 2 verification (Android emulator, Pixel 9, 2026-10-06)

| Check | Result |
|---|---|
| Fresh install → RTL reload → onboarding 01–03 (swipe, skip, last-slide CTAs) | ✅ |
| Login email + password → Home | ✅ |
| Phone validation (inline, button disabled until valid) → OTP 1234 → Home | ✅ |
| Wrong OTP → attempts left, red cells, resend | ✅ |
| Resend timer 60 s → "ابعتلي كود جديد" → timer restarts | ✅ |
| Register (field chaining, live password rules, terms) → OTP → Home | ✅ |
| Guest → deep link to a login-required screen → login → back there; back → Home | ✅ |
| Relaunch while logged in → Home | ✅ |
| Keyboard never hides the field or the CTA at 360×640 (login phone, register password, OTP) | ✅ after the fixes below |
| Screenshots at 360×640, 393×852, 430×932, 820×1180 | Arabic only ✅, English frozen |
| Screen recordings (Step 0): journey, guest, wrong OTP + resend, onboarding animations | ✅ |
| Onboarding at 320×568 and 1180×820; auth screens at 140% font (360×640) | ✅ (OTP + keyboard at 140%: D6) |
| iOS | ⏳ needs the EAS development build on an iPhone |

Fixed during verification: `login?method=phone` was ignored when login was already open; tapping the `+20` prefix or
a field icon didn't focus the input; the top-bar guest link wrapped and lost its last word at widths ≥ 430; the CTA
hid under the keyboard on short screens.

### iOS checklist — batch 2 (run on the EAS development build: `eas build --profile development --platform ios`)

Not run yet: needs `eas init` on your Expo account and an iPhone registered for internal distribution.

- [ ] Notch / Dynamic Island: top bars and the onboarding header sit below the status area (SafeAreaView `top`).
- [ ] Home indicator: onboarding CTAs and form bottoms keep ≥ 8pt above it.
- [ ] Back-swipe from the left edge works on login, register and OTP; disabled on onboarding (it is replaced, not pushed).
- [ ] Keyboard: field + CTA visible on iPhone SE (375×667) for login phone, register password, OTP; `oneTimeCode` autofill offers the SMS code.
- [ ] VoiceOver in Arabic: reading order right-to-left, back button says "رجوع", OTP reads as one field, password rules announce ✓/✕.
- [ ] Launcher name shows "بالتدريج" with the device in Arabic and "Beltadreeg" in English.

## 7. Batch 3 verification — Home (Android emulator, Pixel 9, 2026-10-07)

| Check | Result |
|---|---|
| Skeleton → content in board order (available now → recommended → new) | ✅ |
| Chips re-sort "مرشّح ليك" (top rated → Barber Point first, "بيفتح الساعة ١٢ م") | ✅ |
| Live drift: pins and wait lines change between refreshes | ✅ |
| Area sheet: opens over the tab bar, plurals (٢٤ صالون، ٩ صالونات), keyboard lifts the sheet | ✅ |
| مدينة نصر → empty state → "غيّر المنطقة" → المعادي; area survives a relaunch | ✅ |
| Pull to refresh (teal spinner) | ✅ |
| 08: simulated offline → bar with time, disabled search, dimmed chips, stale wait, notice; back online → live | ✅ |
| 18: cold start in airplane mode → full screen; airplane off → content loads by itself | ✅ |
| Card → salon route; "شوف الكل" → Search | ✅ |
| 320×568, 360, 393, 430, 820×1180, 1180×820; 140% font at 360×640 (names and long wait lines ellipsize) | ✅ |
| Arabic typing in the area search | ⏳ not on device (adb can't type Arabic); `normalizeArabic` is unit-tested ("دجله" = "دجلة") |

## 8. Batch 4 verification — Salon + gallery (Android emulator, Pixel 9, 2026-10-07)

| Check | Result |
|---|---|
| Home card → salon page: hero, name, meta, live status card (changes with drift) | ✅ |
| Compact bar fades in on scroll (name + "المعادي · فاضي دلوقتي"); tabs pin under it | ✅ |
| Tabs jump to each section; the active tab follows scrolling (last tab at the page end) | ✅ |
| Services ✓ toggle; bar shows count + total; "ادخل الطابور" → barber placeholder | ✅ |
| Barbers (queue / off with return day), offers (dashed discount, bundle strike-through, loyalty dots), reviews (summary, 3 bars, filters, reply), hours (7 days from today, "النهارده —", إجازة) | ✅ |
| Heart: guest → login → back to the salon; signed in → toggles with pop + haptic | ✅ |
| `/salon/xyz` → not found → "ارجع للرئيسية" | ✅ |
| Gallery: filters, video tile, collapsed grid with "+N" → expands; photo viewer counter matches the tapped tile | ✅ |
| 320×568, 360, 393, 430, 820×1180, 1180×820; 140% font at 360×640 | ✅ — at 140% the active tab could sit off-screen in the tab strip → ✅ fixed in batch 11 (`UnderlineTabs` centres the active tab) |
| Directions / call / share open the system apps | ✅ (intent opens; no maps/dialer app content checked) |
| Offline with data (stale status, join disabled) and without (`NoConnection`) | ✅ same components as Home, simulated |

## 9. Batch 5 verification — Booking → queue (Android emulator, Pixel 9, 2026-10-07)

| Check | Result |
|---|---|
| Salon "ادخل الطابور" → step 1: "دلوقتي" (live wait) / "احجز معاد" (7 day chips, closed days off, الصبح / بعد الضهر / بالليل, taken = struck, CTA disabled until a time) | ✅ |
| Barber step: now (any = الأسرع, +N د amber, فاضي, off faded) and at a booked time (فاضي · time / مش فاضي) | ✅ |
| Review: time row + "غيّر", wait range or appointment card, policy, totals (bundle −٢٠ → ١٠٠), confirm labels | ✅ |
| Confirmed: queue number + ahead + expected / appointment card; "تابع دورك" / "حجوزاتي"; × → home | ✅ |
| Queue moves by itself: waiting → amber + "اتحرّك دلوقتي" banner → حان دورك countdown → postpone (toast) → turn again (postpone used, final note) → check in → on the chair → نعيماً + قيّم | ✅ |
| Upcoming appointment → "الغي الحجز" dialog → "الحجز اتلغى"; leave dialog (frame 30) on a queue booking | ✅ |
| Errors: already in a queue (+ "تابع دورك", confirm blocked); slot taken / barber unavailable / salon closed (mock tests) | ✅ |
| Offline: queue "لايف" grey; review offline notice + confirm blocked; load errors (booking not found) at all sizes | ✅ |
| 320×568, 360, 393, 430, 820×1180, 1180×820 + 140% (slot, schedule, barber, review, confirmed, queue) | ✅ after fixes: confirmed compacted on short screens (CTA hidden at 320/360), directions button min width (140%), progress label re-measure, bottom inset on the queue, close button under the status bar |
| Recording of the journey | ✅ (session scratchpad `b5-booking.mp4`) |

## 10. Batch 6 verification — Bookings, Search, Account (Android emulator, Pixel 9, 2026-10-07)

| Check | Result |
|---|---|
| Bookings current: live queue card (number, "حان دورك" / ahead + wait, meta with board bars, "تابع دورك"), notify note; empty → search; guest → sign-in empty state | ✅ |
| Bookings past: done / missed badges, "{date} — {time}", rate prompt vs your stars, missed reason, rebook → slot step with the services + barber | ✅ |
| Search idle (recent + "قريب منك دلوقتي"), "شوف الكل" params (sort + open), applied chips, filter sheet (sort, services, 4 days, price range, open now, live count), no results (clear / widen 10 km / suggestions), offline lock | ✅ |
| Account signed in: header from `GET /me` after a cold start, stats, "١ نشط" / favorites values, groups (no Language row), sign out | ✅ |
| Sign-out dialog with a running queue (names the salon) and without | ✅ |
| Guest account (frame 43): card + login, locked rows "مقفول", allowed rows (green), help, version | ✅ |
| 320×568, 360, 393, 430, 820×1180, 1180×820 + 140% (bookings ×2, search ×4 incl. keyboard open, filter sheet, account, guest account, guest bookings) | ✅ after fixes: past/active meta one line with the board's thin bars (was "·" next to digits, then wrapped with an orphan bar), no-results buttons at the board's 48 (label clipped at 320 at 52/16), version digits Arabic-Indic |
| Recording | ✅ (session scratchpad `b6/b6-tabs.mp4`: bookings → past → search → filters → account → sign-out dialog) |

## 11. Batch 7 verification — the rest (Android emulator, Pixel 9, 2026-10-07)

| Check | Result |
|---|---|
| Past visit "قيّم دلوقتي" → rate: overall stars + label, details pre-filled, tags, comment (500), photos sheet, anonymous → "ابعت التقييم" → 41 with your stars; rated booking → straight to 41; back from 41 doesn't reopen the form | ✅ |
| 41 favorite suggestion: "اتضاف للمفضلة" when already a favorite | ✅ (add path = `useToggleFavorite`, same as the salon heart) |
| Notifications: groups, highlighted act-now items, unread dots, tap → queue / rate / salon, "علّم الكل كمقروء", Home bell dot on/off, guest sign-in state | ✅ |
| Favorites: least wait first, "ادخل الطابور" (ghost when free) / "شوف الصالون" when closed, note, empty after removing all three | ✅ |
| Profile: fields from `/me`, locked phone + "متأكّد", birth date system picker, area sheet, save → toast + account header, delete → dialog → signed out → Home | ✅ |
| Notification settings: queue locked "دايماً شغّالة" + note, other toggles persist | ✅ |
| Help: search filters, one FAQ open, call, terms/privacy, version | ✅ |
| 320×568, 360, 393, 430, 820×1180, 1180×820 + 140% (8 screens) + keyboard open (profile, help) | ✅ |
| Recording | ✅ (session scratchpad `b7/b7-rest.mp4`) |

## 12. Batch 13 verification — last UI gaps + salon photos (Android emulator, Pixel 9, 2026-10-07)

| Check | Result |
|---|---|
| Profile phone field: "متأكّد" badge centred (fix in `Badge` itself: `alignSelf: flex-start` pinned it to the top of every row) | ✅ |
| Forgot password: phone → code (`reset_password`) → new password, rules red on early save then green → home signed in | ✅ |
| OTP wrong code with the countdown still running: error + countdown + disabled resend (D5) | ✅ |
| OTP at 140% font on 360×640 with the keyboard: cells, countdown, "تأكيد" visible (D6) | ✅ at 205 (only the halo clipped) → 195; the floating emulator keyboard blocked a re-shot |
| Photo viewer: opens on the tapped photo, swipe right = next, left = previous (D8) | ✅ |
| Onboarding on the shared `useSwipePager`: slides 1→2→3, dots, "تخطّي" hides | ✅ |
| Salon photos: home list + rails, salon hero (light status bar + top scrim over the photo, dark again when the white bar shows), gallery grid + review photos, viewer (contain, light status bar) | ✅ |
