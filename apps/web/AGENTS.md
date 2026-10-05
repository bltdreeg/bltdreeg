# apps/web — agent rules

## Data access (mandatory)

The web app calls the Laravel API **directly from the browser**, with the same structure as the ATS dashboard:

```
Component → React Query hook → action (plain async function) → apiClient (axios) → Laravel
```

- Components use **hooks only** (`src/lib/hooks/<domain>/`). They never call `axios`, `apiClient`, an action, or load data in `useEffect`.
- Hooks are `useQuery` / `useMutation` and call an action inside. Mutations update the React Query cache in `onSuccess` (session hooks write `user` into `QK_USER`).
- Actions (`src/lib/actions/<domain>/*.action.ts`) are plain `async` functions, **not** `"use server"`. They call `apiClient` from `src/lib/api`, map Laravel `snake_case` to camelCase types, and persist the session when needed.
- `src/lib/api/axios-instance.ts` is the single axios instance: it adds the bearer token and `Accept-Language`, and turns every failure into an `ApiError` (`code`, `data`, `errors`). `error` in every hook is an `ApiError` (global `Register` declaration).
- **Do not create `src/app/api/*` route handlers or server actions for first-party data.** They only add a useless hop. Route handlers are only for external callers (webhooks, third-party callbacks).
- The token lives in the `beltadreeg_session` cookie via `tokenStorage` (JS-readable so `proxy.ts` can guard routes). Never store it elsewhere.
- Env: `NEXT_PUBLIC_API_URL`. Laravel must list the web origin in `CORS_ALLOWED_ORIGINS`.
- Legacy hooks using `fetcher()` + `/api/*` stubs (shops, bookings, favorites, reviews, queue, areas) and the old `"use server"` booking/review actions get converted to this pattern when their backend exists.

Full guide and checklist: `.claude/skills/web-data-access/SKILL.md`.
Design background: `apps/bltdreeg-server/docs/superpowers/specs/2026-09-27-customer-auth-api-design.md` §11 and ADR 0005.

## Checks

`pnpm test` (node test runner, `src/**/*.test.ts`, import with `.ts` extensions), `npx tsc --noEmit`, `npx eslint <files>`.
