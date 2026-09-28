# Architecture and conventions

How `apps/web/src` is organised. Follow the pattern in sibling files before adding new ones.

## Routes (`src/app/[locale]/…`)

| Group | Access | Pages |
|---|---|---|
| `(marketing)` | public | home `/`, `search`, `salon/[id]`, `favorites`, `download`, `partner`, `terms`, `privacy`, `refund-policy`, `offline` |
| `(app)` | **login required** | `book/[salonId]` (barber → slot → review → confirmation), `bookings`, `bookings/[id]` (live tracking), `bookings/[id]/rate`, `account/*` |
| `(auth)` | public | `login`, `register`, `verify-otp`, `forgot-password` |
| `src/app/api/*` | route handlers | `auth/*`, `shops/*`, `bookings/*` (incl. `queue-status`), `favorites/*`, `areas`, `user/*` |

Login protection: `src/proxy.ts` redirects to login with a `callbackUrl` when `SESSION_COOKIE` is missing on any
path in `PROTECTED_ROUTES` (`src/middleware.config.ts`). The guest cookie only remembers a choice; it never grants access.

## Where files go

- **Page-private code** lives next to the page:
  - `__components/<name>/<name>.tsx` + `index.ts` (barrel file that re-exports it)
  - `__sections/<name>/`: large page sections (for example booking steps, bookings past/upcoming)
  - `__lib/`: page-only helpers (for example `booking-params.utils.ts`)
- **Shared UI**: `src/components/atoms` (small pieces) → `molecules` (composed pieces) → `organs` (bigger blocks). Each folder has an `index.ts`.
  Several folders are empty `index.ts` stubs so far (for example `atoms/select`, `atoms/tabs`, `molecules/barber-card`,
  `molecules/slot-grid`, `organs/booking-stepper`). Build them out; don't create duplicates somewhere else.
- **Shared logic**: `src/lib/*`

| Folder / suffix | Holds |
|---|---|
| `lib/types/<entity>/*.interface.ts`, `*.dto.ts`, `*.enum.ts` + `index.ts` | Types. Enums are `const` objects plus a matching type, not TS `enum` |
| `lib/data/*.constants.ts` | **Demo data** (shops, barbers, services, slots, bookings, offers, reviews, areas, user) |
| `lib/data/constants/*.constants.ts` | App constants: `routes`, `api-routes`, `query-keys`, `metadata`, `legal`, `app` |
| `lib/actions/<domain>/*.action.ts` | `"use server"` functions. They read demo data today and will call the backend later |
| `lib/hooks/<domain>/use-*.hook.ts` | Client hooks built on TanStack Query |
| `lib/utils/**/*.utils.ts` | Pure helpers (queue, availability, filters, formatting) |
| `*.schema.ts` next to a form | Hand-written form types and validation (**no zod**) |
| `*.test.ts` | `node:test` tests, run by `pnpm test` |
| `*.check.ts` | Standalone `assert` scripts (`npx tsx <file>`) |

Empty `// TODO` stubs: `lib/store/*`, `lib/redis/*`, `lib/contexts/booking-context.tsx`, `lib/routes/route.config.ts`,
`lib/schema/*`, `lib/utils/index.ts`. Don't assume they work.

## Data flow (today)

```
lib/data/*.constants.ts  →  lib/actions/*.action.ts  →  app/api/**/route.ts  →  lib/hooks/*.hook.ts  →  components
      (demo data)               (server functions)          (JSON endpoints)       (useQuery + fetcher)
```

- Server components usually call actions directly. Client components go through hooks → `fetcher` (`lib/utils/api/fetcher.ts`)
  → `API_*` constants. Query keys live in `query-keys.constants.ts`.
- Live tracking polls `queue-status` every 30 s (`use-queue-status.hook.ts`).
- Creating a booking pushes into an in-memory array (`bookings.action.ts`, marked with a `ponytail:` comment).
- Auth is fake: `dev-login.action.ts` sets the session cookie, and the demo OTP is `1234` (`app.constants.ts`). This matches the Flutter
  app's fake backend.
- When the real backend arrives, replace the action bodies. Keep hooks and components unchanged.

## Constants: no hardcoded strings

- Page paths come from `routes.constants.ts` (`ROUTE_*`). API paths come from `api-routes.constants.ts` (`API_*`).
- The salon panel is a separate app: `SALON_PANEL_URL` / `EXTERNAL_SALON_*` read `NEXT_PUBLIC_SALON_PANEL_URL`.
- Store URLs, the app name (`getAppName(locale)`), cookie names and layout heights are in `app.constants.ts`.
- Page metadata comes from `metadata.constants.ts`.

## i18n (next-intl)

- Config lives in `src/i18n/` (`routing.ts`: locales `ar`, `en`, default `ar`, `localeDetection: false`).
- Messages are in `src/i18n/messages/{ar,en}.json`, with top-level namespaces `auth`, `app`, `common`, `marketing`, nested per page
  (for example `marketing.salon.hours`). Add keys to **both** files, then run `pnpm i18n:scan`.
- For links and redirects, use the navigation helpers from `src/i18n/navigation.ts`, not `next/link` directly.
- RTL-first: use logical Tailwind utilities (`ms-/me-/ps-/pe-/start-/end-`). Digits are always Western (`ar-EG-u-nu-latn`).
- `src/i18n/glossary.ts` is empty. The approved terms are in [domain.md](domain.md#vocabulary).

## Styling and UI

- Tailwind 4 with tokens in `src/styles/globals.css`. Icons come from `lucide-react`. Primitives come from `@base-ui/react`.
- Gotcha: `components.json` points shadcn at `src/app/globals.css` and `@/components/ui`, and neither exists.
  Fix those paths before running `shadcn add`, or place the generated files by hand into `components/atoms`.
- Design source: `Beltadreeg customer app design/` (`web.html`, `mobile.html`). Component comments often cite a frame number
  (for example "فريم ٢٣"), matching the Flutter app's design board.

## Code style

- Comments are written in **Arabic** (Egyptian dialect). Keep that style in existing files.
- `ponytail:` comments mark a deliberate shortcut and what should replace it. Update or remove them when you resolve one.
- Keep one component per file, with a named export, re-exported from `index.ts`.
