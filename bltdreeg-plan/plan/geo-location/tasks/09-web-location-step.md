# 09 · Web: confirm-location onboarding step

**Depends on:** 05 · **Decisions:** D5, D9, D10 · **Skill:** load `web-data-access` before writing any hook or action.

Root: `apps/web/`. Data flow (mandatory): **Component → React Query hook → plain action → `apiClient` → Laravel**. No route handlers, no server actions.

This task **replaces Task 7b** (customer pin-map) of `apps/bltdreeg-server/docs/superpowers/plans/2026-10-01-customer-auth-web-onboarding-social-reset.md`. Customers get dropdowns only. If the `/onboarding` page from `bltdreeg-plan/plan/customer-registration/tasks/16-web-onboarding-and-account.md` already exists when you start, render `<LocationStep>` as its location step instead of creating the standalone page in Step 7.

**Files:**
- Create: `src/lib/types/geo/geo.interface.ts`, `src/lib/types/geo/index.ts`
- Modify: `src/lib/types/auth/customer.interface.ts` (`CustomerLocation`)
- Modify: `src/lib/utils/auth/laravel-mappers.ts` (+ `laravel-mappers.test.ts`)
- Create: `src/lib/utils/location/location-choice.ts` (+ `location-choice.test.ts`)
- Create: `src/lib/utils/location/browser-position.ts`
- Create: `src/lib/actions/geo/geo.action.ts`
- Modify: `src/lib/actions/user/user.action.ts` (add `getLocationEstimate`, `confirmLocation`)
- Modify: `src/lib/data/constants/query-keys.constants.ts`
- Create: `src/lib/hooks/geo/{use-governorates,use-cities,use-areas,index}.ts` (files named `*.hook.ts`, as in `hooks/user`)
- Create: `src/lib/hooks/user/use-location-prefill.hook.ts`, `src/lib/hooks/user/use-confirm-location.hook.ts`. Export both from `hooks/user/index.ts`.
- Create: `src/app/[locale]/(auth)/onboarding/__components/location-step/location-step.tsx` (+ `index.ts`)
- Create: `src/app/[locale]/(auth)/onboarding/location/page.tsx`
- Modify: `src/i18n/messages/en.json`, `src/i18n/messages/ar.json` (`auth.onboarding.location.*`)

**Interfaces:**
- Consumes (HTTP, Task 05):
  - `GET /geo/governorates`, `GET /geo/governorates/{id}/cities`, `GET /geo/cities/{id}/areas` → `{data: RawGeoDivision[]}`
  - `GET /geo/resolve?lat&lng` → `{data: RawResolvedLocation}`
  - `GET /me/location/estimate` → `{estimate: RawResolvedLocation}`
  - `PUT /me/location {area_id, lat?, lng?, source?}` → `RawCustomer`
- Produces:
  - Types `GeoDivision`, `ResolvedLocation`, `LocationSource`
  - `toConfirmPayload(areaId: string, prefill: ResolvedLocation): ConfirmLocationDto`, `isInEgypt(lat, lng): boolean`
  - `requestBrowserPosition(timeoutMs?): Promise<{lat, lng} | {error: "denied" | "unavailable"}>`
  - Hooks `useGovernorates()`, `useCities(governorateId)`, `useAreas(cityId)`, `useLocationPrefill()`, `useConfirmLocation()`
  - Component `<LocationStep onDone={(user) => void} />`

---

- [ ] **Step 1: Types**

`src/lib/types/geo/geo.interface.ts`:
```ts
// المحافظة/المدينة/المنطقة زي ما بترجع من Laravel /geo
export type LocationSource = "gps" | "ip" | "manual" | "maps_url" | "default";

export interface GeoDivision {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface NamedRef {
  id: string;
  name: string;
}

export interface ResolvedLocation {
  governorate: NamedRef;
  city: NamedRef;
  area: NamedRef;
  lat: number;
  lng: number;
  source: LocationSource;
}

export interface ConfirmLocationDto {
  areaId: string;
  lat?: number;
  lng?: number;
  source?: "gps" | "ip" | "manual";
}
```
`index.ts`: `export * from "./geo.interface";`

In `customer.interface.ts`, replace `CustomerLocation` with the following, and make `Customer.location: CustomerLocation` (no longer nullable):
```ts
import type { LocationSource, NamedRef } from "../geo/geo.interface.ts";

export interface CustomerLocation {
  lat: number;
  lng: number;
  source: LocationSource;
  updatedAt: string | null;
  confirmed: boolean;
  governorate: NamedRef;
  city: NamedRef;
  area: NamedRef;
}
```

- [ ] **Step 2: Write the failing pure tests**

`src/lib/utils/location/location-choice.test.ts`:
```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import type { ResolvedLocation } from "../../types/geo/geo.interface.ts";
import { isInEgypt, toConfirmPayload } from "./location-choice.ts";

const prefill = (source: ResolvedLocation["source"]): ResolvedLocation => ({
  governorate: { id: "EG01", name: "Cairo" },
  city: { id: "EG0111", name: "Qasr Al-Nile" },
  area: { id: "EG011103", name: "Qasr El-Doubara" },
  lat: 30.0444,
  lng: 31.2357,
  source,
});

test("gps and ip prefills send their point so the server can keep it", () => {
  assert.deepEqual(toConfirmPayload("EG011102", prefill("gps")), { areaId: "EG011102", lat: 30.0444, lng: 31.2357, source: "gps" });
  assert.deepEqual(toConfirmPayload("EG011103", prefill("ip")), { areaId: "EG011103", lat: 30.0444, lng: 31.2357, source: "ip" });
});

test("default prefill sends only the area (server uses its centroid)", () => {
  assert.deepEqual(toConfirmPayload("EG011103", prefill("default")), { areaId: "EG011103" });
});

test("egypt bounds", () => {
  assert.equal(isInEgypt(30.0444, 31.2357), true);
  assert.equal(isInEgypt(51.5074, -0.1278), false);
  assert.equal(isInEgypt(21.5, 24.5), true);
  assert.equal(isInEgypt(21.49, 30), false);
});
```

Extend `src/lib/utils/auth/laravel-mappers.test.ts` with a case that maps the new raw `location` (with `confirmed` and the three refs) to the camelCase shape. Copy the structure of the existing `mapCustomer` test in that file.

- [ ] **Step 3: Run them to verify they fail**

Run: `npm test`
Expected: FAIL. `Cannot find module './location-choice.ts'`.

- [ ] **Step 4: Pure helpers + mapper**

`src/lib/utils/location/location-choice.ts`:
```ts
// منطق اختيار الموقع (من غير DOM) — بيتختبر بـ node --test
import type { ConfirmLocationDto, ResolvedLocation } from "../../types/geo/geo.interface.ts";

export const EGYPT_BOUNDS = { lat: [21.5, 32.0], lng: [24.5, 37.0] } as const;

export function isInEgypt(lat: number, lng: number): boolean {
  return lat >= EGYPT_BOUNDS.lat[0] && lat <= EGYPT_BOUNDS.lat[1] && lng >= EGYPT_BOUNDS.lng[0] && lng <= EGYPT_BOUNDS.lng[1];
}

/** السيرفر بيحتفظ بالنقطة لو في نفس المدينة، وإلا بيستخدم مركز المنطقة (D8). */
export function toConfirmPayload(areaId: string, prefill: ResolvedLocation): ConfirmLocationDto {
  if (prefill.source === "gps" || prefill.source === "ip" || prefill.source === "manual") {
    return { areaId, lat: prefill.lat, lng: prefill.lng, source: prefill.source };
  }
  return { areaId };
}
```

`src/lib/utils/location/browser-position.ts`:
```ts
// طلب إذن الموقع من المتصفح — مرة واحدة، مع timeout
export type BrowserPosition = { lat: number; lng: number } | { error: "denied" | "unavailable" };

export function requestBrowserPosition(timeoutMs = 10000): Promise<BrowserPosition> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ error: "unavailable" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => resolve({ error: e.code === e.PERMISSION_DENIED ? "denied" : "unavailable" }),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60000 },
    );
  });
}
```

In `laravel-mappers.ts`, add the raw types and update `RawCustomer.location` + `mapCustomer`:
```ts
import type { LocationSource, ResolvedLocation } from "../../types/geo/geo.interface.ts";

export interface RawNamedRef { id: string; name: string }
export interface RawGeoDivision { id: string; name: string; lat: number; lng: number }
export interface RawResolvedLocation {
  governorate: RawNamedRef; city: RawNamedRef; area: RawNamedRef;
  lat: number; lng: number; source: LocationSource;
}

// in RawCustomer:
location: RawResolvedLocation & { updated_at: string | null; confirmed: boolean };

// in mapCustomer:
location: {
  lat: raw.location.lat,
  lng: raw.location.lng,
  source: raw.location.source,
  updatedAt: raw.location.updated_at,
  confirmed: raw.location.confirmed,
  governorate: raw.location.governorate,
  city: raw.location.city,
  area: raw.location.area,
},

export function mapResolvedLocation(raw: RawResolvedLocation): ResolvedLocation {
  return { governorate: raw.governorate, city: raw.city, area: raw.area, lat: raw.lat, lng: raw.lng, source: raw.source };
}
```
Fix every compile error from `location` becoming non-null:
```bash
npx tsc --noEmit
```

- [ ] **Step 5: Run the pure tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Actions, query keys, hooks**

`query-keys.constants.ts`:
```ts
export const QK_GEO_GOVERNORATES = ["geo", "governorates"] as const;
export const QK_GEO_CITIES = (governorateId: string | null) => ["geo", "cities", governorateId] as const;
export const QK_GEO_AREAS = (cityId: string | null) => ["geo", "areas", cityId] as const;
export const QK_LOCATION_PREFILL = ["user", "location-prefill"] as const;
```

`src/lib/actions/geo/geo.action.ts`:
```ts
// قوائم المحافظات/المدن/المناطق + تحويل نقطة لمنطقة — /geo في Laravel
import { apiClient } from "@/lib/api";
import type { GeoDivision, ResolvedLocation } from "@/lib/types/geo";
import { mapResolvedLocation, type RawGeoDivision, type RawResolvedLocation } from "@/lib/utils/auth/laravel-mappers";

export async function getGovernorates(): Promise<GeoDivision[]> {
  return (await apiClient.get<{ data: RawGeoDivision[] }>("/geo/governorates")).data;
}

export async function getCities(governorateId: string): Promise<GeoDivision[]> {
  return (await apiClient.get<{ data: RawGeoDivision[] }>(`/geo/governorates/${governorateId}/cities`)).data;
}

export async function getAreas(cityId: string): Promise<GeoDivision[]> {
  return (await apiClient.get<{ data: RawGeoDivision[] }>(`/geo/cities/${cityId}/areas`)).data;
}

export async function resolvePoint(lat: number, lng: number): Promise<ResolvedLocation> {
  return mapResolvedLocation((await apiClient.get<{ data: RawResolvedLocation }>("/geo/resolve", { params: { lat, lng } })).data);
}
```

Add to `user.action.ts`:
```ts
export async function getLocationEstimate(): Promise<ResolvedLocation> {
  return mapResolvedLocation((await apiClient.get<{ estimate: RawResolvedLocation }>("/me/location/estimate")).estimate);
}

export async function confirmLocation(dto: ConfirmLocationDto): Promise<Customer> {
  return syncOnboarding(
    await apiClient.put<RawCustomer>("/me/location", { area_id: dto.areaId, lat: dto.lat, lng: dto.lng, source: dto.source }),
  );
}
```

Hooks (`src/lib/hooks/geo/use-governorates.hook.ts`, and the same pattern for cities and areas):
```ts
// قائمة المحافظات — نادراً ما تتغير، فبنكاشها طول الجلسة
import { useQuery } from "@tanstack/react-query";
import { getGovernorates } from "@/lib/actions/geo/geo.action";
import { QK_GEO_GOVERNORATES } from "@/lib/data/constants/query-keys.constants";

export function useGovernorates() {
  return useQuery({ queryKey: QK_GEO_GOVERNORATES, queryFn: getGovernorates, staleTime: Infinity });
}
```
```ts
export function useCities(governorateId: string | null) {
  return useQuery({
    queryKey: QK_GEO_CITIES(governorateId),
    queryFn: () => getCities(governorateId as string),
    enabled: !!governorateId,
    staleTime: Infinity,
  });
}
```
`useAreas(cityId)` is identical, using `getAreas`/`QK_GEO_AREAS`.

`src/lib/hooks/user/use-location-prefill.hook.ts`:
```ts
// تعبئة مبدئية: GPS لو المستخدم سمح، وإلا تقدير الـ IP (أو القاهرة) من السيرفر
import { useQuery } from "@tanstack/react-query";
import { resolvePoint } from "@/lib/actions/geo/geo.action";
import { getLocationEstimate } from "@/lib/actions/user/user.action";
import { QK_LOCATION_PREFILL } from "@/lib/data/constants/query-keys.constants";
import { requestBrowserPosition } from "@/lib/utils/location/browser-position";
import { isInEgypt } from "@/lib/utils/location/location-choice";

export function useLocationPrefill() {
  return useQuery({
    queryKey: QK_LOCATION_PREFILL,
    staleTime: Infinity,
    retry: false,
    queryFn: async () => {
      const position = await requestBrowserPosition();
      if ("lat" in position && isInEgypt(position.lat, position.lng)) {
        return { location: await resolvePoint(position.lat, position.lng), gps: "granted" as const };
      }
      return { location: await getLocationEstimate(), gps: "error" in position ? position.error : ("outside" as const) };
    },
  });
}
```

`src/lib/hooks/user/use-confirm-location.hook.ts`:
```ts
// تأكيد الموقع — بيكمّل خطوة الـ onboarding ويحدّث كاش المستخدم
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmLocation } from "@/lib/actions/user/user.action";
import { QK_USER } from "@/lib/data/constants/query-keys.constants";
import type { ConfirmLocationDto } from "@/lib/types/geo";

export function useConfirmLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ConfirmLocationDto) => confirmLocation(dto),
    onSuccess: (user) => queryClient.setQueryData(QK_USER, user),
  });
}
```

- [ ] **Step 7: Component + page + messages**

Add to `en.json` → `auth.onboarding.location`:
```json
{
  "title": "Confirm your location",
  "subtitle": "We filled this in for you. Change anything that's wrong.",
  "approximate": "This is approximate, based on your connection.",
  "denied": "Location access is off, so we used your connection instead.",
  "governorate": "Governorate",
  "city": "City",
  "area": "Area",
  "choose": "Choose…",
  "continue": "Continue",
  "error": "Couldn't save your location. Try again."
}
```
And add to `ar.json`:
```json
{
  "title": "أكّد موقعك",
  "subtitle": "جهّزنالك البيانات دي. غيّر أي حاجة مش مظبوطة.",
  "approximate": "ده موقع تقريبي من اتصالك.",
  "denied": "إذن الموقع مقفول، فاستخدمنا اتصالك بدلاً منه.",
  "governorate": "المحافظة",
  "city": "المدينة",
  "area": "المنطقة",
  "choose": "اختار…",
  "continue": "متابعة",
  "error": "معرفناش نحفظ موقعك. حاول تاني."
}
```

`location-step.tsx`:
```tsx
"use client";
// خطوة تأكيد الموقع: ٣ قوائم متسلسلة متعبّية مبدئياً (GPS أو IP) — العميل بيأكّد أو يغيّر بس
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAreas, useCities, useGovernorates } from "@/lib/hooks/geo";
import { useConfirmLocation, useLocationPrefill } from "@/lib/hooks/user";
import type { Customer } from "@/lib/types/auth";
import type { GeoDivision } from "@/lib/types/geo";
import { toConfirmPayload } from "@/lib/utils/location/location-choice";

interface Props {
  onDone: (user: Customer) => void;
}

export function LocationStep({ onDone }: Props) {
  const t = useTranslations("auth.onboarding.location");
  const prefill = useLocationPrefill();
  const [governorateId, setGovernorateId] = useState<string | null>(null);
  const [cityId, setCityId] = useState<string | null>(null);
  const [areaId, setAreaId] = useState<string | null>(null);
  const governorates = useGovernorates();
  const cities = useCities(governorateId);
  const areas = useAreas(cityId);
  const confirm = useConfirmLocation();

  useEffect(() => {
    const location = prefill.data?.location;
    if (!location || governorateId) return;
    setGovernorateId(location.governorate.id);
    setCityId(location.city.id);
    setAreaId(location.area.id);
  }, [prefill.data, governorateId]);

  // مدن "خارج الزمام" فيها منطقة واحدة بس
  useEffect(() => {
    if (areas.data?.length === 1 && !areaId) setAreaId(areas.data[0].id);
  }, [areas.data, areaId]);

  const source = prefill.data?.location.source;
  const ready = !!(governorateId && cityId && areaId && prefill.data);

  return (
    <form
      className="mx-auto flex w-full max-w-md flex-col gap-4 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!areaId || !prefill.data) return;
        confirm.mutate(toConfirmPayload(areaId, prefill.data.location), { onSuccess: onDone });
      }}
    >
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-sm text-[#5B6470]">{t("subtitle")}</p>
      {prefill.data?.gps === "denied" && <p className="text-sm text-[#8A5A00]">{t("denied")}</p>}
      {(source === "ip" || source === "default") && <p className="text-sm text-[#8A5A00]">{t("approximate")}</p>}

      <GeoSelect label={t("governorate")} placeholder={t("choose")} value={governorateId} options={governorates.data}
        onChange={(id) => { setGovernorateId(id); setCityId(null); setAreaId(null); }} />
      <GeoSelect label={t("city")} placeholder={t("choose")} value={cityId} options={cities.data}
        onChange={(id) => { setCityId(id); setAreaId(null); }} />
      <GeoSelect label={t("area")} placeholder={t("choose")} value={areaId} options={areas.data} onChange={setAreaId} />

      {confirm.isError && <p role="alert" className="text-sm text-red-600">{t("error")}</p>}
      <button type="submit" disabled={!ready || confirm.isPending}
        className="rounded-xl bg-[#0B5A54] px-4 py-3 font-semibold text-white disabled:opacity-50">
        {t("continue")}
      </button>
    </form>
  );
}

function GeoSelect(props: {
  label: string;
  placeholder: string;
  value: string | null;
  options: GeoDivision[] | undefined;
  onChange: (id: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {props.label}
      <select
        className="rounded-xl border border-[#CFE6E3] bg-white px-3 py-3 disabled:opacity-50"
        value={props.value ?? ""}
        disabled={!props.options}
        onChange={(e) => props.onChange(e.target.value)}
      >
        <option value="" disabled>{props.placeholder}</option>
        {props.options?.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </label>
  );
}
```
The select atom in `src/components/atoms/select` is an empty stub, so a native `<select>` is used. Match colours to the `(auth)` pages. `index.ts`: `export { LocationStep } from "./location-step";`

`src/app/[locale]/(auth)/onboarding/location/page.tsx`:
```tsx
"use client";
// صفحة مستقلة لخطوة الموقع لحد ما صفحة الـ onboarding الكاملة تتبني (customer-registration task 16)
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { CALLBACK_PARAM } from "@/lib/data/constants/app.constants";
import { afterAuthPath } from "@/lib/utils/auth/post-auth-redirect";
import { LocationStep } from "../__components/location-step";

export default function OnboardingLocationPage() {
  const router = useRouter();
  const callback = useSearchParams().get(CALLBACK_PARAM);
  return <LocationStep onDone={(user) => router.replace(afterAuthPath(user, callback))} />;
}
```
Check that `route-guard.ts`'s `matches([ROUTE_ONBOARDING], path)` treats `/onboarding/location` as an onboarding path (prefix match). If it does exact matching only, add a test case to `route-guard.test.ts` and make it a prefix match.

- [ ] **Step 8: Verify**

Run: `npm test && npx tsc --noEmit && npm run lint`
Expected: all green.

Manual check: run the API (`apps/bltdreeg-server/dev.ps1`) and `npm run dev`, then go through these:
- Register a new customer, then open `/ar/onboarding/location`.
- Allow location: the three selects fill from GPS.
- Deny location: the selects fill from the IP or Cairo, and the "denied" + "approximate" notes appear.
- Change the governorate: city and area clear.
- Pick a "خارج الزمام" city: its single area auto-selects.
- Continue: you land on the callback, and `GET /me` shows `location.confirmed: true`.

- [ ] **Step 9: Commit**

```bash
git add apps/web/src
git commit -m "feat(web): confirm governorate/city/area onboarding step prefilled from gps or ip"
```
