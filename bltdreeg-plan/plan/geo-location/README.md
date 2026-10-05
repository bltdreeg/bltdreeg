# Geo Location (Governorate · City · Area) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seed Egypt's official admin divisions (27 governorates, 365 cities, 5,716 areas) into the DB. Every customer and every branch then always stores a governorate, city and area next to its lat/lng. These are pre-filled from GPS, the IP address or a fallback, never typed from scratch, and stay editable. Customers confirm them during onboarding. Salons set their first branch during the onboarding wizard, using a map, "use my location", a pasted Google Maps link, or the IP fallback.

**Architecture:** A new `Geo` module in `packages/core` owns the three tables, the importer, `LocationResolver` (point → nearest area), the IP geolocator (moved from central-app), and the Google Maps link parser. Both apps share one MySQL DB and load core migrations, so the data is imported **by a migration** (production doesn't run seeders). `central-app` exposes public geo lookup endpoints and extends `/me/location`. `tenant-app` reworks the wizard's address step. Web and mobile each get a "confirm your location" onboarding step.

**Tech Stack:** Laravel 13, PHP 8.5, Filament 5, Livewire/Alpine, Pest (in-memory SQLite), Spatie Translatable, geoip2/geoip2, Leaflet 1.9.4 + OpenStreetMap tiles, Next.js 16 + React Query 5, Flutter (bloc, dio, get_it) + `geolocator`.

**Spec:** this README's "Decisions" section. It was agreed in the brainstorming session on 2026-10-05; there is no separate spec file, as the user asked.

**Data source:** `https://api.openadmindata.org/api/v1/countries/eg.json` (OCHA COD-AB, CC BY-IGO). Levels are `governorate` → `district` → `shiyakha`, and each row has `id`, `name_en`, `name_local`, `lat`, `lon` and `parent_id`. **Centroids only, no polygons.**

## Decisions

| # | Decision |
|---|---|
| D1 | Labels: `governorate` = Governorate / **المحافظة**, `district` = City / **المدينة**, `shiyakha` = Area / **المنطقة**. Tables: `geo_governorates`, `geo_cities`, `geo_areas`. Columns: `governorate_id`, `city_id`, `area_id`. |
| D2 | Primary keys are the source codes: `char(4)` `EG01`, `char(6)` `EG0111`, `char(8)` `EG011103`. Names are JSON `{ar, en}` read through Spatie Translatable, like `branches.name`. |
| D3 | 14 cities have no areas (the desert "خارج الزمام" zones, e.g. `EG0100`). The importer gives each one **placeholder area** `<cityId>00` (e.g. `EG010000`) with the city's name and centroid, and `is_placeholder = true`. So **every city has ≥ 1 area** and `area_id` can be NOT NULL. |
| D4 | `customers.governorate_id/city_id/area_id` and `branches.governorate_id/city_id/area_id` are **NOT NULL** foreign keys (restrict on delete). `customers.last_lat/last_lng/location_source` and `branches.latitude/longitude/location_source` also become NOT NULL. Branch lat/lng change from `string` to `decimal(10,7)`. |
| D5 | Values are never typed from scratch. On creation they come from IP, falling back to the **default area `EG011103`** (Qasr El-Doubara, Qasr Al-Nile, Cairo; `config('geo.default_area_id')`). In onboarding they are pre-filled from GPS (if permitted), the IP, or the default, and the user only **confirms or changes** them. |
| D6 | Point → divisions = **nearest area centroid** (haversine in PHP over a lat/lng box prefilter, so it works on SQLite tests and MySQL). City and governorate come from that area. |
| D7 | `LocationSourceEnum` moves to core: `Gps=1, Ip=2, Manual=3, MapsUrl=4, Default=5`. Trust rank is `Default 0 < Ip 1 < Gps 2 < Manual = MapsUrl 3`. An **automatic** update (IP fallback, background GPS) replaces the current value only when its rank is ≥ the current rank and the current rank is < 3. An **explicit** choice (the customer confirms an area, or the salon owner picks one) always wins. |
| D8 | Reconcile rule when the user picks an area while a point exists: if the point's nearest area is in the **same city** as the chosen area, keep the precise point and its source. Otherwise replace the point with the chosen area's centroid, with source `Manual`. |
| D9 | Customer onboarding: `location` moves from *skippable* to *missing* until `customers.location_confirmed_at` is set. Confirming = `PUT /me/location` with `area_id`. Existing customers whose saved source was `gps`/`manual` are back-filled as confirmed. Everyone else confirms once. |
| D10 | Customers get **dropdowns only** (no map), pre-filled from GPS or IP. This replaces the customer pin-map in `apps/bltdreeg-server/docs/superpowers/plans/2026-10-01-customer-auth-web-onboarding-social-reset.md` (Task 7b). Salons get map + "use my location" + Google Maps link + IP prefill, and the dropdowns. |
| D11 | Salon location is for the **first branch only** (`OnboardingService::saveFirstBranch`). Physical salons see the map. Mobile/virtual-only salons see only the three dropdowns (pre-filled from IP). Governorate, city and area are required for every salon. |
| D12 | Seeding: the snapshot `packages/core/database/data/geo/eg.json` is committed. The import runs from a migration. `php artisan geo:sync` (central-app) re-downloads, validates, rewrites the snapshot and upserts. Tests import a small fixture `eg.testing.json` (all 27 governorates; the cities and areas of Cairo `EG01` and Alexandria `EG02` only) selected via `GEO_SNAPSHOT_PATH`. |
| D13 | Map: Leaflet 1.9.4 from unpkg (with SRI) via Livewire `@assets`, no composer/npm package. Tiles come from `config('geo.map_tile_url')` (env `MAP_TILE_URL`, default OSM). **Switch to a hosted tile provider before production traffic.** |
| D14 | Approved dependency changes: `geoip2/geoip2` moves into `packages/core` (so tenant-app gets it); `geolocator` is added to the Flutter app. |
| D15 | Google Maps links: parse `!3d<lat>!4d<lng>` (place pin, preferred), `@lat,lng`, `q=`/`query=`/`ll=`/`center=`/`destination=`, `/place/lat,lng`, `geo:lat,lng`. Short links (`maps.app.goo.gl`, `goo.gl/maps`, `g.co/kgs`) are followed server-side: allow-listed Google hosts only, ≤ 5 hops, 3 s timeout, HEAD then GET, never a request body. `consent.google.com` → read its `continue` param. |

## Global Constraints

- Egypt bounds (moved verbatim from `UpdateLocationRequest`): lat **21.5–32.0**, lng **24.5–37.0**. Points outside are rejected (422 in the API, a danger notification in Filament).
- Coordinates are stored as `decimal(10,7)` everywhere. Models cast lat/lng to `float`.
- Known test points (computed from the snapshot, used across tasks):
  - Cairo `30.0444, 31.2357` → area `EG011103` / city `EG0111` / gov `EG01`
  - Garden City area `EG011102` is in the same city `EG0111`
  - `30.0626, 31.2497` → area `EG011304` / city `EG0113` / gov `EG01`
  - Alexandria `31.2001, 29.9187` → area `EG020405` / city `EG0204` / gov `EG02`
- Lang: geo labels in `packages/core/lang/{ar,en}/geo.php` (`core::geo.*`). Wizard strings in `core::onboarding.wizard.*`.
- Server code follows the Laravel Boost rules in each app's `CLAUDE.md`: curly braces always, typed signatures, PHPDoc array shapes, `php artisan make:*`, `vendor/bin/pint --dirty --format agent` before each commit. Read `.ai/rules/index.md` in each app before editing.
- Web follows the `web-data-access` skill: **Component → React Query hook → plain action → `apiClient` → Laravel**. No route handlers, no server actions.
- `packages/core/database/migrations/` existing files are never edited. Add new migrations only.
- Tests: run the narrowest file with `php artisan test --compact <path>`. Ask the user to run full suites at the end (Task 11).

## Review Focus

1. **Automatic updates must not clobber explicit choices.** After a customer confirms an area (rank 3) or GPS (rank 2), a later `PUT /me/location` with no body (IP fallback) or a background GPS refresh must not move them. Pinned in Task 5 (`automatic ip refresh never replaces a confirmed manual location`).
2. **VPN / foreign IP / no MaxMind DB.** The IP lookup returns null, or a point outside Egypt. Creation and the estimate endpoint must still succeed with the default area `EG011103` and source `default`, and never 500. Pinned in Task 2 (`fromIp falls back to default for foreign ip`) and Task 4 (`registration with foreign ip stores default area`).
3. **Hostile or broken Maps links.** A non-Google host, a redirect to a non-Google host, more than 5 hops, a timeout, a URL with no coordinates, or coordinates outside Egypt: each returns null and shows "couldn't read this link". There is no request to the non-Google host. Pinned in Task 3 (`refuses redirect to non-google host`, `stops after five hops`).
4. **Mismatched ids from a tampered client.** `area_id` from one city sent with `city_id`/`governorate_id` from another (wizard), or an unknown `area_id` (API). The API returns 422. The wizard derives city/gov from the area and rejects a mismatch. Pinned in Task 5 (`unknown area is rejected`) and Task 7 (`submit rejects area that does not belong to city`).
5. **Migration on real data.** Existing branches with `''`/`null`/non-numeric `latitude` strings, and customers with null lat/lng, must back-fill to the default area without failing the migration. Pinned in Task 4 and Task 6 back-fill tests.

## Tasks

| # | Task | Side | Depends on | Status |
|---|---|---|---|---|
| 01 | [Geo tables, models, importer, snapshot, `geo:sync`](tasks/01-geo-data.md) | Core / API | — | done |
| 02 | [LocationResolver, source enum, IP geolocator → core](tasks/02-location-resolver.md) | Core | 01 | done |
| 03 | [Google Maps link parser + short-link resolver](tasks/03-google-maps-links.md) | Core | 02 | done |
| 04 | [Customers: NOT NULL geo columns, back-fill, creation paths](tasks/04-customer-geo-columns.md) | Core / API | 02 | done |
| 05 | [Customer API: geo lookups, resolve, estimate, `/me/location`, onboarding status](tasks/05-customer-api.md) | API | 04 | done |
| 06 | [Branches: NOT NULL geo columns, decimal lat/lng, back-fill](tasks/06-branch-geo-columns.md) | Core | 02 | done |
| 07 | [Salon wizard: location step (map, GPS, Maps link, IP, dropdowns)](tasks/07-salon-wizard-location.md) | Tenant | 03, 06 | done |
| 08 | [Central admin: Branch, Customer, submission review](tasks/08-admin-panels.md) | API | 04, 06, 07 | done |
| 09 | [Web: confirm-location onboarding step](tasks/09-web-location-step.md) | Web | 05 | done |
| 10 | [Mobile: confirm-location onboarding step](tasks/10-mobile-location-step.md) | Mobile | 05 | blocked: no Flutter SDK on this machine |
| 11 | [Wrap-up: docs, superseded plan note, full suites, manual check](tasks/11-wrap-up.md) | All | all | partial: docs + MySQL check done; mobile, Scramble and manual e2e pending |

**Critical path:** 01 → 02 → 04 → 05 → 09.
**In parallel once unblocked:** 03 and 06 after 02 · 07 after 03 + 06 · 08, 09 and 10 after their dependencies.
