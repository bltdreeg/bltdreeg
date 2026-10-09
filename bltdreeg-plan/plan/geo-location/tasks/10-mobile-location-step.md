# 10 · Mobile: confirm-location onboarding step

**Depends on:** 05 · **Decisions:** D5, D9, D10, D14

Root: `apps/bltdreeg_cutsomer_mobile/`.

The app follows feature-first clean architecture: `domain/` (entities, repository contracts, use cases), `data/` (API + fake data sources, repository impl) and `presentation/` (cubits, pages). Each feature has a `*_module.dart` registering with `get_it`. `test/architecture/layering_test.dart` enforces the layering, so keep `domain` free of Flutter/dio imports. HTTP goes through `ApiClient.getJson/putJson(path, {query|body})`. Every remote has an API and a **fake** implementation backed by `FakeServer`, which tests use.

**Files:**
- Modify: `pubspec.yaml`: add `geolocator: ^14.0.0`, or the latest stable version that resolves with the current Flutter SDK (`flutter pub add geolocator`)
- Modify: `android/app/src/main/AndroidManifest.xml` (`ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`), `ios/Runner/Info.plist` (`NSLocationWhenInUseUsageDescription`, ar + en via `InfoPlist.strings` if the project localizes plist strings)
- Create: `lib/features/location/domain/entities/{geo_division.dart,resolved_location.dart}`
- Create: `lib/features/location/domain/location_repository.dart`, `lib/features/location/domain/location_usecases.dart`
- Create: `lib/features/location/domain/location_choice.dart` (pure: `confirmBody`)
- Create: `lib/features/location/data/{location_remote_data_source.dart,api_location_remote_data_source.dart,fake_location_remote_data_source.dart,location_repository_impl.dart,device_position.dart}`
- Create: `lib/features/location/presentation/{confirm_location_cubit.dart,pages/confirm_location_page.dart}`
- Create: `lib/features/location/location_module.dart`. Register it where the other `register*Module(sl)` calls live (`lib/core/di/injection.dart`).
- Modify: `lib/features/auth/domain/entities/user.dart` + `lib/features/auth/data/models/auth_models.dart` (`locationConfirmed`, `areaName` from `location.area.name`)
- Modify: `lib/core/router/app_routes.dart` (`confirmLocation` route), `lib/core/router/app_router.dart` (route + redirect)
- Modify: `lib/core/localization/arb/app_{ar,en}.arb`, then regenerate (`flutter gen-l10n`)
- Test: `test/features/location/location_choice_test.dart`, `test/features/location/confirm_location_cubit_test.dart`, `test/core/router/confirm_location_redirect_test.dart`

**Interfaces:**
- Consumes (HTTP, Task 05): the same endpoints as Task 09
  - `GET /geo/governorates`, `/geo/governorates/{id}/cities`, `/geo/cities/{id}/areas`
  - `GET /geo/resolve?lat&lng`
  - `GET /me/location/estimate`
  - `PUT /me/location`
  - `GET /me` (`location.confirmed`, `location.area.name`)
- Produces:
  - `GeoDivision(id, name)`
  - `ResolvedLocation(governorate, city, area, lat, lng, source)`
  - `Map<String, Object?> confirmBody(String areaId, ResolvedLocation prefill)`
  - `ConfirmLocationCubit` with `ConfirmLocationState(status, prefill, gps, governorates, cities, areas, governorateId, cityId, areaId)` and methods `load()`, `selectGovernorate(id)`, `selectCity(id)`, `selectArea(id)`, `confirm()`
  - `User.locationConfirmed`
  - Route `AppRoutes.confirmLocation` (`/confirm-location`)

---

- [ ] **Step 1: Write the failing pure + cubit tests**

`test/features/location/location_choice_test.dart`:
```dart
import 'package:bltdreeg_cutsomer_mobile/features/location/domain/entities/resolved_location.dart';
import 'package:bltdreeg_cutsomer_mobile/features/location/domain/location_choice.dart';
import 'package:flutter_test/flutter_test.dart';

ResolvedLocation prefill(String source) => ResolvedLocation(
  governorate: const GeoRef('EG01', 'Cairo'),
  city: const GeoRef('EG0111', 'Qasr Al-Nile'),
  area: const GeoRef('EG011103', 'Qasr El-Doubara'),
  lat: 30.0444,
  lng: 31.2357,
  source: source,
);

void main() {
  test('gps and ip prefills send their point', () {
    expect(confirmBody('EG011102', prefill('gps')), {'area_id': 'EG011102', 'lat': 30.0444, 'lng': 31.2357, 'source': 'gps'});
    expect(confirmBody('EG011103', prefill('ip'))['source'], 'ip');
  });

  test('default prefill sends only the area', () {
    expect(confirmBody('EG011103', prefill('default')), {'area_id': 'EG011103'});
  });
}
```

`test/features/location/confirm_location_cubit_test.dart`. Build the cubit with a `FakeLocationRemoteDataSource` and a `DevicePosition` stub, following `login_cubit_test.dart`'s setup with `FakeServer` and `testEnvironment`:
```dart
blocTest<ConfirmLocationCubit, ConfirmLocationState>(
  'load pre-fills from gps when permission is granted',
  build: () => buildCubit(position: const DevicePositionResult.granted(31.2001, 29.9187)),
  act: (cubit) => cubit.load(),
  verify: (cubit) {
    expect(cubit.state.areaId, 'EG020405');
    expect(cubit.state.cityId, 'EG0204');
    expect(cubit.state.gps, GpsStatus.granted);
  },
);

blocTest<ConfirmLocationCubit, ConfirmLocationState>(
  'load falls back to the server estimate when permission is denied',
  build: () => buildCubit(position: const DevicePositionResult.denied()),
  act: (cubit) => cubit.load(),
  verify: (cubit) {
    expect(cubit.state.areaId, 'EG011103');
    expect(cubit.state.gps, GpsStatus.denied);
  },
);

blocTest<ConfirmLocationCubit, ConfirmLocationState>(
  'changing governorate clears city and area; a single-area city auto-selects',
  build: () => buildCubit(position: const DevicePositionResult.denied()),
  act: (cubit) async {
    await cubit.load();
    await cubit.selectGovernorate('EG01');
    await cubit.selectCity('EG0100'); // خارج الزمام — منطقة واحدة
  },
  verify: (cubit) => expect(cubit.state.areaId, 'EG010000'),
);

blocTest<ConfirmLocationCubit, ConfirmLocationState>(
  'confirm sends the body and finishes',
  build: () => buildCubit(position: const DevicePositionResult.denied()),
  act: (cubit) async {
    await cubit.load();
    await cubit.confirm();
  },
  verify: (cubit) => expect(cubit.state.status, ConfirmLocationStatus.done),
);
```
The fake data source returns canned JSON for the fixture ids used above: `EG01`/`EG02`, `EG0111`/`EG0204`/`EG0100`, `EG011103`/`EG020405`/`EG010000`. `resolve(31.2001, 29.9187)` returns `EG020405`, and `estimate()` returns `EG011103` with `source: 'default'`.

`test/core/router/confirm_location_redirect_test.dart`: copy the router test setup already in `test/core/router/`. Then assert that a signed-in user with `locationConfirmed: false` going to `/home` is redirected to `/confirm-location`. Also assert that a confirmed user and a guest are not redirected.

- [ ] **Step 2: Run them to verify they fail**

Run: `flutter test test/features/location test/core/router/confirm_location_redirect_test.dart`
Expected: FAIL. `location_choice.dart` doesn't exist.

- [ ] **Step 3: Domain**

`lib/features/location/domain/entities/resolved_location.dart`:
```dart
import 'package:equatable/equatable.dart';

final class GeoRef extends Equatable {
  const GeoRef(this.id, this.name);

  final String id;
  final String name;

  @override
  List<Object?> get props => [id, name];
}

final class ResolvedLocation extends Equatable {
  const ResolvedLocation({
    required this.governorate,
    required this.city,
    required this.area,
    required this.lat,
    required this.lng,
    required this.source,
  });

  final GeoRef governorate;
  final GeoRef city;
  final GeoRef area;
  final double lat;
  final double lng;

  /// `gps | ip | manual | maps_url | default`, as sent by the API.
  final String source;

  @override
  List<Object?> get props => [governorate, city, area, lat, lng, source];
}
```
`geo_division.dart`: `GeoDivision(id, name)`, as `Equatable`.

`lib/features/location/domain/location_choice.dart`:
```dart
import 'entities/resolved_location.dart';

/// The server keeps the point if it is in the same city, otherwise it uses the area centroid.
Map<String, Object?> confirmBody(String areaId, ResolvedLocation prefill) =>
    switch (prefill.source) {
      'gps' || 'ip' || 'manual' => {
        'area_id': areaId,
        'lat': prefill.lat,
        'lng': prefill.lng,
        'source': prefill.source,
      },
      _ => {'area_id': areaId},
    };
```

`location_repository.dart`:
```dart
abstract interface class LocationRepository {
  Future<List<GeoDivision>> governorates();
  Future<List<GeoDivision>> cities(String governorateId);
  Future<List<GeoDivision>> areas(String cityId);
  Future<ResolvedLocation> resolve(double lat, double lng);
  Future<ResolvedLocation> estimate();
  Future<User> confirm(Map<String, Object?> body);
}
```
In `location_usecases.dart`, wrap each method with `guardResult`, like `CompleteOnboarding`, and name them `GetGovernorates`, `GetCities`, `GetAreas`, `ResolvePoint`, `GetLocationEstimate`, `ConfirmLocation`.

- [ ] **Step 4: Data**

`device_position.dart`: a thin wrapper over `geolocator` that returns a sealed `DevicePositionResult` (`granted(lat, lng)`, `denied()`, `unavailable()`).
- Call `Geolocator.isLocationServiceEnabled()`. If it's off, return `unavailable`.
- Call `Geolocator.checkPermission()`, then `requestPermission()` if the result is `denied`. `deniedForever` maps to `denied`.
- Call `Geolocator.getCurrentPosition(locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, timeLimit: Duration(seconds: 10)))`. Any exception maps to `unavailable`.
- Keep this file in `data/`, because domain must not import plugins.

`api_location_remote_data_source.dart`:
```dart
Future<List<GeoDivision>> governorates() async =>
    _divisions(await _api.getJson('/geo/governorates'));
Future<List<GeoDivision>> cities(String id) async =>
    _divisions(await _api.getJson('/geo/governorates/$id/cities'));
Future<List<GeoDivision>> areas(String id) async =>
    _divisions(await _api.getJson('/geo/cities/$id/areas'));
Future<ResolvedLocation> resolve(double lat, double lng) async =>
    resolvedFromJson((await _api.getJson('/geo/resolve', query: {'lat': lat, 'lng': lng}))['data']! as Map<String, Object?>);
Future<ResolvedLocation> estimate() async =>
    resolvedFromJson((await _api.getJson('/me/location/estimate'))['estimate']! as Map<String, Object?>);
Future<User> confirm(Map<String, Object?> body) async =>
    UserModel.fromJson(await _api.putJson('/me/location', body: body));
```
Add `resolvedFromJson` and `_divisions` (the latter maps `json['data']` as a list of `{id, name}`). The fake data source implements the same interface with the canned data described in Step 1. Register the API or fake version the same way the auth module chooses between `ApiAuthRemoteDataSource` and `FakeAuthRemoteDataSource`.

`UserModel.fromJson`: add `locationConfirmed: (json['location'] as Map<String, Object?>?)?['confirmed'] as bool? ?? true` and set `areaName` from `location.area.name` when present. Add `locationConfirmed` (default `true`) to `User`, plus its `copyWith`/`props`, and add it to `toJson`. The default `true` keeps fake/legacy users unaffected.

- [ ] **Step 5: Presentation, route, redirect, strings**

`ConfirmLocationCubit` (states: `loading → ready → saving → done | failure`):
- `load()`: get the device position. If granted, call `ResolvePoint`; otherwise call `GetLocationEstimate`. Then load governorates, plus the cities of the prefilled governorate and the areas of the prefilled city, and emit `ready` with the three ids set.
- `selectGovernorate(id)`: clear the city and area and load the cities.
- `selectCity(id)`: clear the area and load the areas. If there is exactly 1 area, set `areaId`.
- `selectArea(id)`.
- `confirm()`: call `ConfirmLocation(confirmBody(areaId, prefill))`, then emit `done`. The session repository's user stream should pick up the returned `User`. Update the session the same way `EditProfileCubit` does after `updateProfile`.

`ConfirmLocationPage`:
- A title and subtitle.
- An "approximate" note when `prefill.source` is `ip` or `default`, and a "denied" note when `gps == denied`.
- Three `DropdownButtonFormField<String>`s using the app's design-system widgets, if `core/widgets` has a dropdown.
- A primary "Continue" button, disabled until all three are set.
- On `done`: `context.go(from ?? AppRoutes.home.path)`.

`app_routes.dart`: `static const confirmLocation = AppRoute('confirmLocation', '/confirm-location');` Add it to `protectedRoutes`.

`app_router.dart` `_redirect`, after the protected-route check:
```dart
final user = session.state.user;
final onConfirm = state.matchedLocation == AppRoutes.confirmLocation.path;
if (session.state.isAuthenticated && user != null && !user.locationConfirmed && !onConfirm) {
  return Uri(
    path: AppRoutes.confirmLocation.path,
    queryParameters: {RouteQuery.from: state.uri.toString()},
  ).toString();
}
```
Check what `SessionSnapshot` exposes for the user (`session.state.user` or similar) and use that.

ARB keys (en / ar):
- `confirmLocationTitle`: "Confirm your location" / "أكّد موقعك"
- `confirmLocationSubtitle`: "We filled this in for you. Change anything that's wrong." / "جهّزنالك البيانات دي. غيّر أي حاجة مش مظبوطة."
- `locationApproximate`: "This is approximate, based on your connection." / "ده موقع تقريبي من اتصالك."
- `locationDenied`: "Location access is off, so we used your connection instead." / "إذن الموقع مقفول، فاستخدمنا اتصالك بدلاً منه."
- `governorateLabel`: Governorate / المحافظة
- `cityLabel`: City / المدينة
- `areaLabel`: Area / المنطقة
- `continueAction`: reuse the key if it already exists

Platform strings:
- Android: `<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>` and `ACCESS_FINE_LOCATION`.
- iOS `NSLocationWhenInUseUsageDescription`: "Bltdreeg uses your location to suggest your area and nearby salons."

- [ ] **Step 6: Run the tests + analyzer**

Run: `flutter gen-l10n && flutter analyze && flutter test`
Expected: no analyzer issues. All tests pass, including `test/architecture/layering_test.dart`.

- [ ] **Step 7: Device check**

Run on an Android emulator or device against the real API (`--dart-define` or env as the app's `Environment` expects). Check these:
- Sign up, and the app lands on `/confirm-location`.
- Allow the permission prompt: the selects fill from GPS.
- Deny it, by reinstalling or resetting permissions: they fill from the IP or Cairo.
- Continue: you reach home, and relaunching doesn't show the step again.

- [ ] **Step 8: Commit**

```bash
git add apps/bltdreeg_cutsomer_mobile
git commit -m "feat(mobile): confirm governorate/city/area after sign-up, prefilled from gps or ip"
```
