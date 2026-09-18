# بالتدريج · Beltadreeg — Customer App

Flutter customer app for barbershop **live queues** and **bookings** in Maadi, Cairo.
Customers find a salon, join the queue right now or book a slot, watch their turn
approach in real time, check in, and rate the visit.

Arabic-first (RTL) with a full English translation. Western digits `0–9` in both
languages, always. Built from a 43-frame design board
(`html_designs/all.html`, frames ٠١–٤٣); every screen matches its frame and its
Arabic copy.

- **Flutter** 3.47.4 · **Dart** 3.13.3
- `flutter analyze` clean · `flutter test` → **155 passing**
- Verified on both an iPhone 17 simulator and an Android emulator (API 36)

---

## Run it

```bash
flutter pub get && flutter run
```

That starts on the **fake backend**: no server needed, everything works, and the
data is seeded to look like a real Maadi evening.

**Demo account** — email `karim.abdelrahman@gmail.com` / password `barber2026`,
or phone `01023456789` with OTP `1234`. In debug builds on the fake backend the
login and OTP screens show these on screen, so nothing has to be memorised.

Things the fake backend does on its own, so a demo has something to watch:
live queue counts drift every 15 s; once you join a queue the person in front
finishes every 20 s until it is your turn; your turn holds for a 5-minute grace
period, auto-postpones once, then is marked missed. Three past bookings are
seeded so the bookings tab and the rating flow have history.

### Backend switch

```bash
flutter run --dart-define=BACKEND=real \
            --dart-define=API_BASE_URL=https://api.beltadreeg.com/v1 \
            --dart-define=QUEUE_WS_URL=wss://api.beltadreeg.com/v1/queue
```

One build flag flips the whole app. Each feature module registers
`env.usesFakeBackend ? FakeXRemoteDataSource(...) : ApiXRemoteDataSource(...)`
and nothing above the data source knows the difference — repositories, use
cases, blocs, widgets and tests are untouched. The `Api*` data sources already
exist and speak to `ApiClient` (dio) and `web_socket_channel`; they are what a
real server plugs into.

### Tests

```bash
flutter test
```

### Platform notes

The app name comes from `android/app/src/main/res/values/strings.xml` (with an
Arabic `values-ar/`) and iOS `CFBundleDisplayName`. The `INTERNET` permission
is declared in the **main** Android manifest, not just debug/profile, so
release builds can reach the API and the queue socket.

Try a deep link on a running emulator:

```bash
adb shell am start -a android.intent.action.VIEW -d "beltadreeg://salon/s4"
```

### Assets and localization codegen

```bash
dart run tool/generate_app_assets.dart   # after adding/renaming/removing an SVG
flutter gen-l10n                         # after editing an .arb
```

`build/untranslated_messages.json` must stay `{}` — both ARB files carry the
same 565 keys.

---

## Architecture

Clean Architecture per feature, offline-first, with a strict rule that
**presentation never imports `data/`** — enforced by
`test/architecture/layering_test.dart`, which also keeps `domain/` pure Dart.

```
lib/
  app/                     root widget, global providers
  core/
    assets/                AppAssets (generated — never reference a path by hand)
    config/                AppEnvironment, AppInfo
    database/              drift: CacheEntries + OutboxEntries
    dev/                   design-system gallery, dev menu
    di/                    get_it composition root
    error/                 Failure / AppException
    l10n_data/             localized seed data
    localization/          arb/ (ar, en) + generated + mappers + time_ago
    network/               ApiClient (dio), FakeServer, connectivity
    router/                AppRoutes / AppRouter / AppNavigation + nav shell
    storage/               AppPreferences (shared_preferences, allow-listed keys)
    sync/                  OutboxProcessor
    theme/                 colors, dimens, typography, tone
    usecase/               UseCase base
    utils/                 Result, Digits, AppFormatters, Validators, extensions
    widgets/               the shared component library (barrel: widgets.dart)
  features/
    onboarding auth salons search home salon_details favorites
    booking queue rating notifications account
```

Each feature is:

```
feature/
  domain/          entities, repository interfaces, use cases  (pure Dart)
  data/            models, remote data sources (Fake + Api), repository impl
  presentation/    blocs/cubits, pages, widgets
  feature_module.dart   registers the feature into get_it
```

**Offline-first shape.** Every repository follows the same sequence: emit the
cached copy → watch connectivity → fetch → cache and emit → subscribe to live
pushes. Offline it emits the cache with `isLive: false`, or a `NetworkFailure`
when there is no cache to show. Writes that can wait go to the **outbox**
(drift) and are replayed in order when the device comes back — favorites,
notification read marks, ratings. Writes that must not be guessed at
(confirming a booking) require the network and are idempotent via a
`requestId`.

**State.** `flutter_bloc`. The live queue is a `QueueBloc` folding booking
pushes, salon details and a 1-second tick into one state.

**Navigation.** `go_router` with a `StatefulShellRoute` for the four bottom-nav
branches. Every branch stays mounted and keeps its own stack; switching tabs
cross-fades. Every pushed screen has a back button. Routes are deep-link ready
(`beltadreeg://salon/42` → `/salon/42`), and `AppRoutes.protectedRoutes` sends
guests to login with a `from` query so they land back where they were headed.

The `beltadreeg://` scheme is registered on both platforms (Android
intent-filter, iOS `CFBundleURLTypes`). Links arrive as full URIs, so
`AppRouter.normalizeAppLink` folds the scheme's host back into the first path
segment before go_router matches.

---

## Design system

Tokens in `core/theme`: `AppColors`, `AppDimens`, `AppTypography`, `AppTone` —
all lifted from the board's CSS. Cairo 400–800 is bundled.

`core/widgets` is the component library (buttons, cards, chips, text fields,
OTP input, tabs, top bars, avatars, images, skeletons, badges, selection
controls, settings groups, empty states, connectivity views, overlays,
progress, salon tiles, rating widgets, bottom nav, brand mark). Everything is
exported from `widgets.dart`.

Browse it all on a device at **`/dev/design-system`** — long-press the bell on
the home screen to open the dev menu.

Tappables get a global press-scale through `AppPressable`. Motion respects the
OS reduce-motion setting: every custom animation falls back to its static SVG
or final frame.

### RTL notes worth keeping

- Signed or prefixed numbers (`−20`, `+9`, `~16`, `2 / 13`) must sit in an LTR
  isolate (`String.ltrIsolate`) or the sign lands on the wrong side.
- `AppTypography` pins `letterSpacing: 0`; Material's default breaks joined
  Arabic.
- Borders over clipped images use `foregroundDecoration`.
- Inline links use `TextSpan` + `TapGestureRecognizer`, not `WidgetSpan`
  (bidi-neutral).
- Illustrations carry no `<text>`; numbers and captions are overlaid in Flutter
  so they localize and stay Western-digit. A test enforces this.

See [`assets/README.md`](assets/README.md) for asset conventions and the full
log of what was fixed in the board's SVGs.

---

## Screens

| Area | Frames | Notes |
|---|---|---|
| Onboarding | 01–03 | 3 slides, animated illustrations |
| Auth | 04–06, 19–20 | email/password, register, phone + OTP |
| Home | 07–08, 18, 40 | nearby salons, recently viewed, area sheet, offline state |
| Bookings | 09–11 | upcoming and past, empty state |
| Search | 12–15 | query, filters, areas, no-results |
| Account | 16–17, 36–38, 42–43 | profile, notifications, language, help, guest |
| Salon | 21–23, 39 | details, barbers, services, gallery + photo viewer |
| Booking flow | slot step, 24–26 | services → **now or slot** → barber → review → confirmed |
| Live queue | 27–30 | position, wait estimate, your turn, check-in |
| Rating | 31, 41 | stars, tags, photos, sent |
| Notifications | 32–33 | grouped by today / this week / earlier |
| Favorites | 34–35 | saved salons |

The booking flow's **slot step** is an addition to the board: step 1 offers
both "الآن" (join the live queue) and scheduled slots.

---

## Testing notes

- Bootstrap DI in `setUp`, never inside `testWidgets`; `tearDown(() => sl.reset(dispose: false))`.
- `testEnvironment` zeroes latency and disables both fake timers.
- Drift runs in memory with `driftRuntimeOptions.dontWarnAboutMultipleDatabases`.
- Use `pumpFor`, not `pumpAndSettle`, on screens with looping animations.
- Await background work before a test ends, or a write lands after `db.close()`.
- `test/architecture/layering_test.dart` fails the build if a dependency starts
  pointing the wrong way; it reads imports off disk, so it needs no annotations.

---

## Known gaps

These are deliberate, and each needs a backend or a platform package that is
not in scope:

- **No push notifications** and no keep-screen-awake on the queue screen.
- **On Android, deep links only navigate on a cold start.** iOS handles both
  cold and warm links. On Android the intent is delivered either way, but when
  the app is already running it resumes the existing route instead of
  navigating — `onNewIntent` is never forwarded to Dart. Fixing it means a
  platform channel in `MainActivity` or the `app_links` package; neither is
  wired up.
- The Arabic launcher name is Android-only (`res/values-ar/strings.xml`). iOS
  shows "Beltadreeg" in every locale; localizing it needs an
  `ar.lproj/InfoPlist.strings` added to the Xcode target.
- Favorites' closed-salon button is "شوف الصالون" rather than frame 34's
  "فكّرني لما يفتح" — there is no notification system to remind with.
- Frame 37's "system notifications are off" warning is omitted; detecting that
  needs a push package.
- Frame 36's photo upload is not wired (no backend field); tapping it explains
  that profile photos come from ratings.
- "غيّر الرقم" routes to help instead of an in-app OTP change flow — the board
  has no frame for one.
