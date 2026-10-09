// البحث والفلترة على الجهاز (فريم 12–15) — منقول من SalonMatcher و SearchCriteria في Flutter. نفس الشروط تقدر تتعمل على الباك إند؛ دي بتفضل للبحث الفوري ومن غير نت.
import type { SalonSummary, ServiceKind } from "@/lib/types/salon";
import { dayMs } from "../day-keys.ts";
import { normalizeArabic } from "./arabic-normalize.utils.ts";
import { isOpen, sortSalons, type SalonSort } from "./salon-sort.utils.ts";

export const PRICE_FLOOR = 40;
export const PRICE_CEILING = 150;
export const DEFAULT_RADIUS_KM = 5;
export const EXPANDED_RADIUS_KM = 10;

export interface SearchCriteria {
  query: string;
  sort: SalonSort | null;
  services: ServiceKind[];
  /** YYYY-MM-DD — الصالون لازم يكون فاتح اليوم ده */
  day: string | null;
  minPrice: number;
  maxPrice: number;
  openNowOnly: boolean;
  radiusKm: number;
}

export const EMPTY_CRITERIA: SearchCriteria = { query: "", sort: null, services: [], day: null, minPrice: PRICE_FLOOR, maxPrice: PRICE_CEILING, openNowOnly: false, radiusKm: DEFAULT_RADIUS_KM };

export const hasPriceFilter = (c: SearchCriteria) => c.minPrice > PRICE_FLOOR || c.maxPrice < PRICE_CEILING;

/** عدد الفلاتر المتطبقة (العدّاد على زرار الفلتر) */
export const activeFilterCount = (c: SearchCriteria) => (c.sort ? 1 : 0) + c.services.length + (c.day ? 1 : 0) + (hasPriceFilter(c) ? 1 : 0) + (c.openNowOnly ? 1 : 0);

/** نفس الكلمة ونفس النطاق، من غير فلاتر */
export const withoutFilters = (c: SearchCriteria): SearchCriteria => ({ ...EMPTY_CRITERIA, query: c.query, radiusKm: c.radiusKm });

/** كلمات عامة مش لازم تطابق ("صالون الورد" → "ورد") */
const STOP_WORDS = new Set(["صالون", "صالونات", "حلاق", "للحلاقه", "salon", "barbershop"]);
/** نفس الاسم بالعربي والإنجليزي */
const ALIASES: Record<string, string[]> = { بربر: ["barber"], barber: ["بربر"], كلاسيك: ["classic"], classic: ["كلاسيك"] };

const tokens = (query: string) =>
  normalizeArabic(query)
    .split(" ")
    .filter((t) => t && !STOP_WORDS.has(t))
    .map((t) => (t.length > 3 && t.startsWith("ال") ? t.slice(2) : t));

export function matchesQuery(salon: SalonSummary, query: string): boolean {
  const haystack = `${normalizeArabic(salon.name)} ${normalizeArabic(salon.areaName)}`;
  return tokens(query).every((t) => haystack.includes(t) || (ALIASES[t]?.some((a) => haystack.includes(a)) ?? false));
}

/** سعر الخدمة لو فيه خدمة واحدة متختارة، وإلا "من" */
export const priceFor = (s: SalonSummary, service: ServiceKind | null) => (service ? (s.servicePrices[service] ?? s.priceFrom) : s.priceFrom);

export function applyCriteria(salons: SalonSummary[], c: SearchCriteria): SalonSummary[] {
  const service = c.services.length === 1 ? c.services[0] : null;
  const priceFiltered = hasPriceFilter(c);
  const results = salons.filter((s) => {
    if (s.distanceKm > c.radiusKm || !matchesQuery(s, c.query)) return false;
    if (!c.services.every((k) => s.services.includes(k))) return false;
    if (c.openNowOnly && !isOpen(s)) return false;
    if (c.day && s.closedWeekdays.includes(new Date(dayMs(c.day)).getDay())) return false;
    const price = priceFor(s, service);
    return !priceFiltered || (price >= c.minPrice && price <= c.maxPrice);
  });
  return sortSalons(results, c.sort ?? "nearest");
}

const bigrams = (s: string) => {
  const padded = ` ${s} `;
  return new Set(Array.from({ length: Math.max(0, padded.length - 1) }, (_, i) => padded.slice(i, i + 2)));
};

/** أقرب أسماء لـ "يمكن تكون بتقصد" لما مفيش نتايج */
export function suggestions(salons: SalonSummary[], query: string, limit = 3): SalonSummary[] {
  const q = normalizeArabic(query);
  if (q.length < 2) return [];
  const a = bigrams(q);
  return salons
    .map((salon) => {
      const b = bigrams(normalizeArabic(salon.name));
      const shared = [...a].filter((g) => b.has(g)).length;
      return { salon, score: shared / (a.size + b.size - shared) };
    })
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .filter((e) => e.score > 0)
    .map((e) => e.salon);
}
