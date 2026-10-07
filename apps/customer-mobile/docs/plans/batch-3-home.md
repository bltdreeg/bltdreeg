# Batch 3: Home (frames 07, 08, 18, 40)

## Context

Home is the first real data screen. It shows the salons near the chosen area, ordered by wait state before rating, with a live queue that moves every 15 s (frame 07). With cached data and no network it shows the offline bar and hides live wait numbers (08). With no data and no network it shows the full no-connection screen (18). The area line opens the area sheet (40).

The parts built here (salon card and row, `Sheet`, `NoConnection`, sort logic, Arabic normalize) are reused by Search, Favorites and the salon page later.

Starting point: the Home research in `~/.claude/plans/we-need-to-focus-compressed-thacker.md` Part 2, re-checked against the board and Flutter on 2026-10-07. Cut from it (ponytail): a seeded PRNG for the drift (`Math.random` is enough; the test checks bounds), and exported skeleton components (the skeleton lives in the Home section until a second screen needs it).

User approval: standing ("work without waiting for approvals", 2026-10-06).

## Board vs Flutter (goes to GAPS §2e)

| Frame | Difference | Board | Flutter | Outcome |
|---|---|---|---|---|
| 07 | Bell unread dot | red dot | dot from `UnreadNotificationsCubit` | Flutter (data-driven); hidden until notifications (batch 7) |
| 07 | "شوف الكل" targets | links only | available → search leastWait + open now; recommended → current chip sort; new → newest | Flutter |
| 07 | Pin on 2-ahead card | "فاضل ٢" amber | `pinPeopleLeft(2)`, level moderate | same |
| 08 | Chips when offline | 3 chips, dimmed | 4 chips, disabled | Board look (dimmed, none selected), Flutter's 4 chips |
| 08 | "آخر صالونات شوفتها" | 2 rows | recently opened, topped up with nearest, max 5 | Flutter; until batch 4 records views it's the 5 nearest |
| 18 | Tab bar | dimmed to .45 | normal | deviation: not dimmed (the tab bar is shared; dimming it for one state isn't worth it) |
| 40 | "Use my location" | permission card | requests permission | Flutter; picks the first nearby area (stub until the backend has area polygons) |

## Tasks

- [x] **1. Types:** `SalonSummary`, `ServiceCategory` (`lib/types/salon/salon-summary.interface.ts`), ported from Flutter `salon_summary.dart`. `Area` gets `isNearby` (keeps the web's `shopCount` name for the count).
- [x] **2. Mock:** `lib/api/mock/salons.mock.ts` with `GET /areas` and `GET /areas/:areaId/salons` (7 areas, 10 salons for the Maadi cluster, `[]` elsewhere), ported from `fake_salon_catalog_remote_data_source.dart`. Drift: on each request apply `floor(elapsed / 15 s)` ticks; each tick moves up to 3 open salons by ±1, clamped 0–8. Register in `adapter.ts`. Test: `salons.mock.test.ts`.
- [x] **3. Data path:** action `lib/actions/salons/salons.action.ts` (`getAreas`, `getCatalog`); hooks `useAreas()` (`QK_AREAS`, `staleTime: Infinity`) and `useCatalog(areaId)` (`QK_CATALOG`, `refetchInterval: 15_000`); selected area in `app-preferences.ts` (SecureStore `beltadreeg_area`, default `maadi`).
- [x] **4. Pure logic + tests:** `lib/utils/salons/salon-sort.utils.ts` (`sortSalons`, port of `SalonMatcher.sort`), `lib/utils/salons/arabic-normalize.utils.ts` (port of `SalonMatcher.normalize`), `screens/home/__lib/home-sections.ts` (port of `HomeState`: radius 5 km, availableNow / recommended / newInArea / lastSeen), `fmt.hour()` + `fmt.weekday()`. One test file each.
- [x] **5. Copy:** `ar.json` `mobile.home`, `mobile.sort`, `mobile.salonLabels`, `mobile.area`, `mobile.offline` (extend), board text exactly; plural/duration strings from Flutter `app_ar.arb`.
- [x] **6. Shared components:**
  - `components/organs/salon-card/`: `SalonRailCard` (`.hcard`), `SalonListItem` (`.shop`), `useSalonLabels()` (port of `salon_labels.dart`). Tap → `/salon/[salonId]`.
  - `components/organs/sheet/`: `Sheet` on `BottomSheetModal` (grab, title + close, scroll body, footer).
  - `components/organs/no-connection/`: frame 18.
  - `SectionDivider` (`.divider`) next to `SectionHeader`.
- [x] **7. Screen:** `screens/home/home.screen.tsx` + `__sections/` (`home-header`, `home-live`, `home-offline`, `home-skeleton`, `area-sheet`). States: skeleton → content; empty area → empty state + "غيّر المنطقة"; error without data → load-error empty state; offline without data → `NoConnection`; offline with data → `OfflineBar` + `home-offline`. Pull to refresh. Centered at `listMaxWidth` on tablets. Wait label fades on change (`motion.ts`).
- [x] **8. GAPS:** §2e rows above; §2c deviations (tab bar not dimmed on 18, bell dot hidden, last seen = nearest, location stub, `Area.isNearby` web parity); §6 batch 3 verification table.
- [x] **9. Device checks** (emulator-5554 only): see Verification.
- [x] **10. Review + checks**, review summary below.

## Files

| Task | Files |
|---|---|
| 1 | `src/lib/types/salon/salon-summary.interface.ts`, `src/lib/types/salon/index.ts`, `src/lib/types/area/area.interface.ts` |
| 2 | `src/lib/api/mock/salons.mock.ts`, `salons.mock.test.ts`, `adapter.ts` |
| 3 | `src/lib/actions/salons/salons.action.ts`, `src/lib/hooks/salons/{index,use-areas.hook,use-catalog.hook}.ts`, `src/lib/data/constants/query-keys.constants.ts`, `src/lib/utils/app-preferences.ts` |
| 4 | `src/lib/utils/salons/{salon-sort,arabic-normalize}.utils.ts` + tests, `src/screens/home/__lib/home-sections.ts` + test, `src/lib/utils/format/number-format.utils.ts` + test |
| 5 | `src/i18n/messages/ar.json` |
| 6 | `src/components/organs/{salon-card,sheet,no-connection}/`, `src/components/molecules/top-bar/top-bar.tsx` |
| 7 | `src/screens/home/home.screen.tsx`, `src/screens/home/__sections/{home-header,home-body,home-skeleton,area-sheet}.tsx` (live + offline share one file: same search entry and chips) |
| 8 | `GAPS.md` |

## Verification

- `npx tsc --noEmit`, `npx expo lint` (0 errors), `pnpm test` (new: salons mock, salon-sort, arabic-normalize, home-sections, fmt.hour/weekday).
- Emulator, force-stop + relaunch first:
  - skeleton, then content in board order (available now → recommended → new);
  - chips re-sort "مرشّح ليك";
  - drift: after > 15 s at least one pin or wait label changes (before/after shots);
  - area sheet: "دجله" finds دجلة; مدينة نصر → empty state → "غيّر المنطقة" reopens the sheet; back to المعادي; the area survives a relaunch;
  - pull to refresh;
  - 08: Home loaded → simulated offline (dev toggle) → bar with time, stale labels, dimmed search and chips, notice;
  - 18: offline at cold start → full no-connection screen; back online → retry → content;
  - a card opens the salon route; "شوف الكل" opens Search.
- Screenshots at 320, 360, 393, 430, 820×1180, 1180×820, plus 360×640 at 140% font; area sheet at 360 and 820.
- Copy audit for the new namespaces.
- One recording: Home → area sheet → change area → back → offline → online.

## Review summary

**Files (this batch)**
- New: `lib/types/salon/salon-summary.interface.ts`, `lib/utils/salons/{salon-mappers,salon-sort.utils,arabic-normalize.utils,salons.utils.test}.ts`, `lib/api/mock/salons.mock(.test).ts`, `lib/actions/salons/salons.action.ts`, `lib/hooks/salons/*`, `components/organs/{salon-card,sheet,no-connection}/`, `screens/home/__lib/home-sections(.test).ts`, `screens/home/__sections/*`.
- Changed: `home.screen.tsx` (was "coming soon"), `area.interface.ts` (+`isNearby`), `adapter.ts`, `query-keys.constants.ts` (+`QK_CATALOG`), `app-preferences.ts` (+selected area), `number-format.utils.ts` + `date.utils.ts` (+`hour`, `weekday`), `top-bar.tsx` (+`SectionDivider`, `SectionHeader style`), `text-field.tsx` (+`inSheet`), `providers.tsx` (−`BottomSheetModalProvider`), `ar.json` (+home, sort, salonLabels, area, offline).

**Found and fixed during review / device checks**
- `BottomSheetModal` never opens on Reanimated 4.5 / RN 0.86 (present() runs, index stays −1; a bare modal fails too, an inline `BottomSheet` works). `Sheet` = inline `BottomSheet` in a transparent `Modal`; the unused provider is removed. Logged in GAPS §2d.
- Sheet didn't lift above the keyboard: gorhom only reacts when a `BottomSheetTextInput` is focused → `TextField inSheet`.
- Sheet hugged the right edge on tablets (absolute container ignores `alignSelf`) → centered with margins.
- "Barber Point دجلة" laid out LTR (first strong char Latin) → RLM prefix on salon names.
- My `ServiceCategory` clashed with the web's menu-section type of the same name → renamed `ServiceKind`.
- Two exports only used in their own file → made local.

**Checks:** `tsc` ✅ · lint 0 errors (same 8 old warnings) ✅ · `pnpm test` 47/47 ✅ (+8: mock, sort, normalize, sections, fmt.hour/weekday) · copy audit: 6 strings not on the board, all states the board doesn't draw (area empty, load error, plural "other" weeks, the existing no-time offline bar) — Flutter copy.

**Evidence** (scratchpad): `b3/m/sheet-home-ar.png` (6 sizes), `b3/x/` (140% font, area sheet 360 and 820), `rec/5-home.mp4`.

**Left open:** Arabic typing in the area search not tried on device (adb can't type Arabic; normalize is unit-tested). Bell dot, last-seen history and location → area are stubs with `ponytail:` notes (batches 4 and 7, backend).
