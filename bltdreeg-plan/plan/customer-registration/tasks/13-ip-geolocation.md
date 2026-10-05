# 13 · IP geolocation fallback (optional, can ship later)

**Depends on:** 10 · **Spec:** §8.8

Location is skippable, and `PUT /me/location` without coordinates already works with `NullIpGeolocator`
(location stays null). This task only makes the fallback useful, so it doesn't block web or launch.

## Steps
- [ ] Add `geoip2/geoip2` to `central-app`.
- [ ] GeoLite2 City needs a free MaxMind account + license key. Don't commit the `.mmdb`: download it in
      the Docker build or entrypoint with `geoipupdate`, path from env (`GEOIP_DATABASE_PATH`).
- [ ] `MaxMindIpGeolocator`; bind it when the file exists, else keep `NullIpGeolocator`.
- [ ] Private/loopback IPs (local Docker) return null.

## Done when
- [ ] Pest with a fake geolocator: IP fallback saves source `ip`; lookup failure leaves location null.

> **Moved:** `IpGeolocator`, `Coordinates` and `MaxMindIpGeolocator` now live in `packages/core` (`Bltdreeg\Core\Modules\Geo`), with `geoip2/geoip2` in core's composer.json. The database path is `config('geo.maxmind_db_path')` / env `GEOIP_DATABASE_PATH` (default `apps/bltdreeg-server/storage/geoip/GeoLite2-City.mmdb`). A failed or foreign IP now resolves to the default Cairo area instead of leaving location null. See `plan/geo-location`.
