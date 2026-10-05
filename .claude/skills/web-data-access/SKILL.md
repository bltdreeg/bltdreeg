---
name: web-data-access
description: Use when adding or changing anything in apps/web that loads or sends data — a form submit, a list, auth, profile, bookings, favorites, a new hook, a new action, or a new /api route. Enforces the structure Component → React Query hook → plain action → apiClient (axios) → Laravel, with no route handlers and no server actions.
---

# Web data access (apps/web)

Same structure as the ATS dashboard (`ats/frontend/dashboard`): the browser calls the API directly.

## The rule

```
Component  →  React Query hook  →  action (plain async fn)  →  apiClient (axios)  →  Laravel
```

- **Components** use a hook and nothing else. No `axios`, no `apiClient`, no direct action call, no data loading in `useEffect`.
- **Hooks** (`src/lib/hooks/<domain>/use-*.hook.ts`) are `useQuery` or `useMutation` and call an action. One hook per file, exported from the domain `index.ts`.
- **Actions** (`src/lib/actions/<domain>/*.action.ts`) are plain `async` functions. **No `"use server"`.** They call `apiClient`, map `snake_case` to camelCase, and own side effects like saving the token.
- **`src/lib/api/`** is the client layer: `axios-instance.ts` (interceptors) and `api-client.ts` (`get/post/put/patch/delete` returning `response.data`).
- **No `src/app/api/*` route handlers and no server actions** for first-party data. Route handlers are only for external callers (webhooks, third-party callbacks).

Legacy code (`fetcher()` hooks over `/api/*` stubs, and the older `"use server"` booking/review actions) is a placeholder for backends that do not exist yet. When one gets a real backend, convert it to this pattern.

## Writing an action

```ts
import { apiClient } from "@/lib/api";

export async function updateThing(dto: ThingDto): Promise<Thing> {
  return mapThing(await apiClient.put<RawThing>("/things/1", { first_name: dto.firstName }));
}
```

- Laravel returns raw resources (no `{ data }` wrapper) in `snake_case`. Keep the raw types and mappers in `src/lib/utils/auth/laravel-mappers.ts` or a sibling file, and export camelCase types.
- Opening a session = `tokenStorage.setSession(token, onboardingComplete, remember)`. Closing = `tokenStorage.clear()`. Only touch the cookie through `src/lib/utils/auth/token-storage.ts`.
- A "who am I" style action returns `null` on 401 instead of throwing (see `getMe`).
- Do not catch and rethrow errors to change them: the axios interceptor already turns every failure into an `ApiError` with `status`, `code`, `data` (e.g. `attemptsLeft`) and `errors`.

## Writing a hook

```ts
export function useUpdateThing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ThingDto) => updateThing(dto),
    onSuccess: (thing) => queryClient.setQueryData(QK_THING, thing),
  });
}
```

- Queries: `useQuery({ queryKey: QK_X, queryFn: getX })`. Put every key in `src/lib/data/constants/query-keys.constants.ts`.
- `error` is typed `ApiError` everywhere (global `Register` in `src/lib/api/react-query.d.ts`). Branch on `error.code` and `error.data`.
- A hook that changes server state updates the cache with `setQueryData`/`setQueriesData` in `onSuccess` (or invalidates the key). Opening a session writes `user` into `QK_USER`. Logging out clears the whole cache.

## Config

- `NEXT_PUBLIC_API_URL` points at Laravel's `/api/v1`. Laravel must list the web origin in `CORS_ALLOWED_ORIGINS`.
- The token is a JS-readable cookie so `proxy.ts` can guard routes on the server. Do not move it to `localStorage`.

## Checklist before finishing

1. No component imports from `lib/actions/*`, `lib/api`, or `axios`.
2. No new file under `src/app/api/` and no new `"use server"` for first-party data.
3. Actions are plain functions that go through `apiClient`.
4. Pure helpers (mappers, cookie helpers, error parsing) have `node --test` tests next to them, importing with a `.ts` extension so `pnpm test` runs them.
5. `npx tsc --noEmit` and `npx eslint` are clean for the files you touched.
