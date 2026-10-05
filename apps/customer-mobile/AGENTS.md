This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Structure & data access (Beltadreeg)

Mirrors `apps/web/src`. Full route map: `apps/bltdreeg_cutsomer_mobile/lib/core/router/app_routes.dart` (paths match it so `beltadreeg://` deep links keep working).

```
src/
  app/          routes only — each file is a one-line re-export: export { default } from "@/screens/<name>/<name>.screen"
                (tabs)/ bottom nav · (auth)/ guest-only (Stack.Protected) · signed-in screens go under Stack.Protected guard={hasSession}
  screens/<name>/  <name>.screen.tsx + __components/ __sections/ __lib/ (route-local, same as web; can't live in app/ — Expo Router would treat them as routes)
  components/   atoms/ molecules/ organs/ — <name>/<name>.tsx + index.ts
  i18n/         config.ts (locale, RTL) + messages/{ar,en}.json (copied from web; use-intl = same t() API as next-intl)
  lib/          api/ actions/ hooks/ types/ utils/ data/constants/ contexts/ — same as web
  styles/tokens.ts  colors/tone/radius/spacing/sizes/shadow/motion/type — 1:1 with Flutter lib/core/theme/*; style with StyleSheet.create (no NativeWind)
  assets/icons, assets/illustrations  SVGs from Flutter assets/ (icons use currentColor); compiled to components by react-native-svg-transformer (metro.config.js)
```

- Data: **component → React Query hook (`lib/hooks/<domain>`) → action (`lib/actions/<domain>/*.action.ts`) → `apiClient` → Laravel**. Components never call axios/apiClient/actions directly. Same rules as `apps/web/AGENTS.md`.
- `lib/types`, `lib/actions/auth`, `lib/hooks/auth`, `lib/utils/{api,auth,format}`, messages are **copies of web** — change both when the API changes.
- Mobile-only: `lib/utils/auth/token-storage.ts` (SecureStore, same API as web), `lib/api/axios-instance.ts` (`EXPO_PUBLIC_API_URL`, Android emulator: `http://10.0.2.2:8011/api/v1`), `i18n/config.ts`.
- Always render text through `components/atoms/text` with a `variant` from the type scale; icons via `components/atoms/icon` (`mirror` for chevrons/back), art via `components/atoms/illustration`. New SVG → add it to the registry (`icons.ts` / `illustrations.ts`). Dev gallery: `/dev/design-system`. Use logical style props (`marginStart`, `paddingEnd`) for RTL.
- Checks: `npx tsc --noEmit`, `npx expo lint`, `pnpm test` (node test runner, `src/**/*.test.ts`).
