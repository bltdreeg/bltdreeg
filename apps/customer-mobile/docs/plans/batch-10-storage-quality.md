# Batch 10: storage + quality

## Context

These are open GAPS items that need code only:
- **#12:** non-secret prefs live in SecureStore, which is meant for secrets and small values.
- **§5 startup:** Cairo loads at runtime, so the splash waits for `useFonts`.
- **§5 layering:** there's no lint rule. Batch 8 also made `lib/` import a UI component, `showToast`.
- **§5 tests:** some are missing.

User approval: plan approved 2026-10-07 (batches 10 + 11; auth batch deferred; decisions stay with the user in GAPS §2b/§2c/#11).

## Tasks

- [x] **1. Prefs to `expo-sqlite/kv-store` (#12).**
  - `lib/utils/device-prefs.ts` provides `readPref`, `writePref` and `removePref` over kv-store.
  - The first read of a key that's missing from kv-store copies the old SecureStore value across once, then deletes it. The pure logic lives in `lib/utils/migrate-pref.ts`, and its test runs under Node.
  - `app-preferences.ts` and `recent-searches.ts` use them. Tokens stay in SecureStore.
- [x] **2. Cairo embedded at build time.**
  - Add the `expo-font` config plugin with the `@expo-google-fonts/cairo` TTFs. Android registers each file under its file name (same as the old `useFonts` keys); iOS uses the PostScript name, so `tokens.font` picks per platform.
  - Drop the runtime wait.
  - Tasks 1 and 2 share one install (Metro stopped) and one dev-client rebuild (gradle, `ANDROID_SERIAL=emulator-5554`).
- [x] **3. Layering.**
  - The `showToast` bus moves to `lib/utils/toast-bus.ts`, and `ToastHost` subscribes to it.
  - ESLint `no-restricted-imports`: `src/components/**` can't import `@/lib/actions/*` or `@/lib/api/*`, and `src/lib/**` can't import `@/components/*`.
- [x] **4. Tests.** `migrate-pref` (copy once, prefer kv, nothing when both are empty) and `toast-bus` (reaches the host; no-op without one).
  - Skipped: `recent-searches` dedupe is a one-liner (YAGNI).
  - Skipped: an `app-preferences` round-trip would need native-module mocks in Node; `migrate-pref` covers the logic.
- [x] **5. GAPS + device.** GAPS #12 and the §5 rows marked done. On emulator-5554:
  - install over the old build, then check that the area, notification toggles, recent searches and onboarding-seen survive the migration;
  - force-stop and relaunch twice, and check they persist;
  - check that the splash shows no system-font flash.

## Review summary

**Files:** `lib/utils/{device-prefs,migrate-pref (+ test),toast-bus (+ test),app-preferences,recent-searches,external-links}.ts`, `i18n/config.ts` (locale also moved — GAPS #12 listed it), `lib/api/axios-instance.ts`, `components/molecules/toast/toast.tsx`, `app/_layout.tsx` (no `useFonts`), `styles/tokens.ts` (`font` per platform), `app.json` (`expo-sqlite`, `expo-font` plugins), `package.json` (`expo-sqlite` ~57.0.4), `eslint.config.js`, `GAPS.md`.

**Found and fixed in review:**
- The saved language was also in SecureStore and has to be written before `reloadAppAsync` → `writePref`/`removePref` return their promise; `config.ts` awaits them.
- Embedded fonts are named differently per platform (Android: file name `Cairo_400Regular`; iOS: PostScript `Cairo-Regular`) → `tokens.font` picks per platform; iOS to confirm on the EAS build.
- `queue.screen.tsx` imports a *type* from `lib/actions` → the lint rule allows type imports.
- `expo prebuild` regenerates `android/` and drops `local.properties` → restored `sdk.dir`. Gradle's install step hung on the emulator → installed the built APK with `adb install -r` (keeps app data, so the migration was tested for real).

**Checks:** `tsc` ✅ · lint 0 errors (8 baseline warnings) · tests 85/85 (+6). The lint rule fires on a probe import of `@/lib/api/api-client` from `components/` (probe deleted). Emulator-5554: before the update the old build saved area دجلة + recent search "Test1" in SecureStore; after installing over it both came back (copied into kv-store), onboarding stayed done, and both survived two force-stop relaunches. Cairo renders in all weights with no runtime font load.

**Left open:** notification toggles weren't changed before the update (same `readPref` path as area). `token-storage`/`app-preferences` themselves have no Node test (native modules); their logic is `migrate-pref`. Web target would need `useFonts` back (not a target).
