# 11 · Wrap-up: docs, superseded plan note, full suites, manual check

**Depends on:** all

**Files:**
- Modify: `apps/bltdreeg-server/docs/superpowers/plans/2026-10-01-customer-auth-web-onboarding-social-reset.md`: add a note at the top of Task 7b (and wherever the customer pin-map / `location-picker-map` appears):
  > **Superseded by `bltdreeg-plan/plan/geo-location/` (D10):** customers confirm governorate / city / area via pre-filled dropdowns. There is no customer map. Location is no longer skippable.
- Modify: `bltdreeg-plan/plan/customer-registration/tasks/16-web-onboarding-and-account.md` step 3: change "Location … Skippable" to "Location: render `<LocationStep>` from geo-location task 09 (required confirm)".
- Modify: `bltdreeg-plan/plan/customer-registration/tasks/13-ip-geolocation.md`: note that the geolocator now lives in `packages/core` (`Bltdreeg\Core\Modules\Geo`), and its path config is `geo.maxmind_db_path` / `GEOIP_DATABASE_PATH`.
- Modify: `apps/bltdreeg-server/docs/superpowers/specs/2026-09-27-customer-auth-api-design.md`: in the location/onboarding sections, describe the new `location` object (`confirmed`, governorate/city/area), the new `PUT /me/location` `area_id`, and `location` as required.
- Modify: `apps/bltdreeg-server/README.md`: add a "Geo data" paragraph covering:
  - the snapshot path, and that the import runs from a migration
  - `php artisan geo:sync`, plus `--fixture` after a sync
  - the `GEO_SNAPSHOT_PATH`, `GEOIP_DATABASE_PATH` and `MAP_TILE_URL` env vars
  - the CC BY-IGO attribution (OCHA COD-AB via OpenAdminData)
- Modify: `apps/bltdreeg-server/central-app/.env.example`, `tenant-app/.env.example`: add `GEOIP_DATABASE_PATH=`, `MAP_TILE_URL=`, `MAP_ATTRIBUTION=`
- Modify: the `README.md` of this plan: set each task's status to `done`

---

- [ ] **Step 1: Docs edits above**

- [ ] **Step 2: Fresh-migrate on MySQL (real driver, real data)**

Run (in `central-app`, with the local MySQL from `infra/local/docker-compose.yml` running):
```bash
php artisan migrate:fresh --seed --no-interaction
php artisan tinker --execute 'dump(DB::table("geo_areas")->count(), DB::table("customers")->whereNull("area_id")->count(), DB::table("branches")->whereNull("area_id")->count());'
```
Expected: `5730`, `0`, `0`. The import migration takes a few seconds on MySQL.

Then check the back-fill on a copy of real data, if one exists (staging dump). Run `php artisan migrate` on top of the pre-feature schema and confirm it finishes without errors (Review Focus #5).

- [ ] **Step 3: Ask the user to run the full suites**

Ask the user to run:
```bash
cd apps/bltdreeg-server/central-app && php artisan test --compact
cd ../tenant-app && php artisan test --compact
cd ../../web && npm test && npx tsc --noEmit && npm run lint
cd ../bltdreeg_cutsomer_mobile && flutter analyze && flutter test
```

- [ ] **Step 4: Scramble**

Open `/docs/api` in central-app. Confirm the Geo endpoints are listed with their params, and that `PUT /me/location` shows `area_id`.

- [ ] **Step 5: End-to-end manual pass**

1. A new web customer signs up, is sent to the location step, confirms it, and reaches home. In the admin, the customer's View page shows governorate/city/area and "Location Confirmed At".
2. A new mobile customer goes through the same flow.
3. A new salon (physical) does the wizard:
   - use "my location", then drag the pin
   - paste a real `maps.app.goo.gl` link
   - submit
   - in the admin review, the comparison shows the division names, and the branch has the ids and decimal coordinates
4. A new salon (mobile-only) does the wizard: no map, the selects are pre-filled, and submit works.
5. With a VPN abroad: the web estimate shows Cairo with the "approximate" note.

- [ ] **Step 6: Commit**

```bash
git add apps/bltdreeg-server/docs apps/bltdreeg-server/README.md apps/bltdreeg-server/*/.env.example bltdreeg-plan
git commit -m "docs(geo): document geo data, sync command and superseded customer map plan"
```
