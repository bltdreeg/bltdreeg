// باك إند الاكتشاف الوهمي — منقول من Flutter (fake_salon_catalog_remote_data_source.dart): 7 مناطق، و10 صالونات
// لمجموعة المعادي (8 جوه 5 كم و2 بره) وفاضي لأي منطقة تانية. الطابور بيتحرك: كل 15 ثانية لحد 3 صالونات مفتوحين ±1.
import type { RawArea, RawSalonSummary } from "@/lib/utils/salons/salon-mappers";
import { route } from "./router.ts";

export const DRIFT_MS = 15_000;
const MAADI_CLUSTER = new Set(["maadi", "zahraa-maadi", "degla", "maadi-gardens"]);

const AREAS: RawArea[] = [
  { id: "maadi", name: "المعادي", city: "القاهرة", salons_count: 24, is_nearby: true },
  { id: "zahraa-maadi", name: "زهراء المعادي", city: "القاهرة", salons_count: 11, is_nearby: true },
  { id: "degla", name: "دجلة", city: "القاهرة", salons_count: 9, is_nearby: true },
  { id: "maadi-gardens", name: "حدائق المعادي", city: "القاهرة", salons_count: 7, is_nearby: true },
  { id: "nasr-city", name: "مدينة نصر", city: "القاهرة", salons_count: 41, is_nearby: false },
  { id: "heliopolis", name: "مصر الجديدة", city: "القاهرة", salons_count: 33, is_nearby: false },
  { id: "dokki", name: "الدقي والمهندسين", city: "القاهرة", salons_count: 28, is_nearby: false },
];

const DAY_MS = 86_400_000;
const SUNDAY = 0;
const FRIDAY = 5;

interface Seed {
  id: string;
  name: string;
  area: string;
  areaName?: string;
  km: number;
  rating?: number;
  reviews?: number;
  prices: RawSalonSummary["service_prices"];
  openedDaysAgo: number;
  ahead?: number;
  perPerson?: number;
  /** الصالون مقفول دلوقتي وبيفتح الساعة دي (النهارده لو لسه، وإلا بكرة) */
  opensAtHour?: number;
  forceTomorrow?: boolean;
  closedWeekdays?: number[];
}

const SEEDS: Seed[] = [
  { id: "s1", name: "صالون الكابتن حسام", area: "maadi", km: 0.8, rating: 4.8, reviews: 214, prices: { haircut: 70, beard: 50, kids: 55, skincare: 110 }, openedDaysAgo: 900, closedWeekdays: [SUNDAY] },
  { id: "s2", name: "الدهّان للحلاقة", area: "zahraa-maadi", km: 1.4, rating: 4.5, reviews: 96, prices: { haircut: 60, beard: 60 }, openedDaysAgo: 700, ahead: 1, perPerson: 10 },
  { id: "s3", name: "بربر لاونج المعادي", area: "maadi", areaName: "المعادي الجديدة", km: 1.2, rating: 4.6, reviews: 138, prices: { haircut: 90, beard: 45, color: 200 }, openedDaysAgo: 520, ahead: 2, perPerson: 8 },
  { id: "s4", name: "حلاق الأسطى رجب", area: "maadi", areaName: "عرب المعادي", km: 1.6, rating: 4.4, reviews: 62, prices: { haircut: 50, beard: 30, kids: 40 }, openedDaysAgo: 2400, ahead: 5, closedWeekdays: [FRIDAY] },
  { id: "s5", name: "Barber Point دجلة", area: "degla", km: 2.1, rating: 4.9, reviews: 309, prices: { haircut: 120, beard: 70, skincare: 180, color: 250 }, openedDaysAgo: 400, opensAtHour: 12 },
  { id: "s6", name: "صالون النجم", area: "maadi", km: 1.9, prices: { haircut: 65, kids: 50 }, openedDaysAgo: 14 },
  { id: "s7", name: "كلاسيك بربر شوب", area: "maadi", areaName: "سرايات المعادي", km: 2.3, rating: 4.3, reviews: 41, prices: { haircut: 75, beard: 40 }, openedDaysAgo: 30, ahead: 3, perPerson: 8 },
  { id: "s8", name: "بربر هاوس الأوتوستراد", area: "maadi", areaName: "الأوتوستراد", km: 3.7, rating: 4.1, reviews: 18, prices: { haircut: 65 }, openedDaysAgo: 200, opensAtHour: 11, forceTomorrow: true },
  { id: "s9", name: "وردة بيوتي سنتر", area: "maadi-gardens", km: 6.4, rating: 4.2, reviews: 57, prices: { haircut: 80, color: 220, skincare: 150 }, openedDaysAgo: 330, ahead: 1, perPerson: 12 },
  { id: "s10", name: "صالون الملك", area: "zahraa-maadi", km: 8.1, rating: 4.0, reviews: 33, prices: { haircut: 55, beard: 35, kids: 45 }, openedDaysAgo: 1100, ahead: 4 },
];

/** الكتالوج بساعة قابلة للتبديل عشان التست يقدّم الوقت */
export function createCatalog(clock: () => number = Date.now, random: () => number = Math.random) {
  const start = clock();
  const nextAt = (hour: number, forceTomorrow = false) => {
    const today = new Date(start);
    today.setHours(hour, 0, 0, 0);
    return new Date(forceTomorrow || today.getTime() <= start ? today.getTime() + DAY_MS : today.getTime()).toISOString();
  };
  const perPerson = new Map(SEEDS.map((s) => [s.id, s.perPerson ?? 9]));
  const salons: RawSalonSummary[] = SEEDS.map((s) => {
    const ahead = s.ahead ?? 0;
    return {
      id: s.id,
      name: s.name,
      area_id: s.area,
      area_name: s.areaName ?? AREAS.find((a) => a.id === s.area)!.name,
      distance_km: s.km,
      rating: s.rating ?? null,
      reviews_count: s.reviews ?? 0,
      price_from: s.prices.haircut ?? Math.min(...Object.values(s.prices)),
      service_prices: s.prices,
      image_url: null,
      opened_on: new Date(start - s.openedDaysAgo * DAY_MS).toISOString(),
      queue: { people_ahead: ahead, wait_minutes: ahead * perPerson.get(s.id)! },
      opens_at: s.opensAtHour === undefined ? null : nextAt(s.opensAtHour, s.forceTomorrow),
      closed_weekdays: s.closedWeekdays ?? [],
    };
  });

  let lastDrift = start;
  const tick = () => {
    const open = salons.filter((s) => s.opens_at === null);
    for (let i = 0; i < 3 && open.length; i++) {
      const salon = open.splice(Math.floor(random() * open.length), 1)[0];
      const ahead = Math.min(8, Math.max(0, salon.queue.people_ahead + Math.floor(random() * 3) - 1));
      salon.queue = { people_ahead: ahead, wait_minutes: ahead * perPerson.get(salon.id)! };
    }
  };
  // ponytail: الطابور الحي بيتحسب وقت الطلب (React Query بيسأل كل 15 ثانية) — الدفع الحقيقي (WebSocket) مع الباك إند
  const drift = () => {
    const ticks = Math.floor((clock() - lastDrift) / DRIFT_MS);
    lastDrift += ticks * DRIFT_MS;
    for (let i = 0; i < Math.min(ticks, 20); i++) tick();
  };

  const copy = (s: RawSalonSummary) => ({ ...s, queue: { ...s.queue } });
  return {
    areas: () => AREAS,
    salons: (areaId: string): RawSalonSummary[] => {
      if (!MAADI_CLUSTER.has(areaId)) return [];
      drift();
      return salons.map(copy);
    },
    /** صالون واحد بحالة الطابور الحالية (صفحة الصالون) */
    salon: (id: string): RawSalonSummary | null => {
      drift();
      const s = salons.find((x) => x.id === id);
      return s ? copy(s) : null;
    },
    /** دقايق كل فرد في الطابور */
    perPerson: (id: string) => perPerson.get(id) ?? 9,
    /** العميل دخل الطابور: بيرجع الطابور قبله، وبيزوّد واحد */
    join(id: string): { peopleAhead: number; waitMinutes: number } {
      const s = salons.find((x) => x.id === id)!;
      const before = { peopleAhead: s.queue.people_ahead, waitMinutes: s.queue.wait_minutes };
      s.queue = { people_ahead: before.peopleAhead + 1, wait_minutes: (before.peopleAhead + 1) * perPerson.get(id)! };
      return before;
    },
    /** حد خلص أو خرج من الطابور */
    leave(id: string): void {
      const s = salons.find((x) => x.id === id)!;
      const ahead = Math.max(0, s.queue.people_ahead - 1);
      s.queue = { people_ahead: ahead, wait_minutes: ahead * perPerson.get(id)! };
    },
  };
}

export const catalog = createCatalog();

export const salonRoutes = [
  route("GET", "/areas", () => catalog.areas()),
  route("GET", "/areas/:areaId/salons", (req) => catalog.salons(req.params.areaId)),
  /** صالونات بعينها مهما كانت منطقتها (المفضلة — فريم 34) */
  route("GET", "/salons", (req) => (req.query.ids ?? "").split(",").flatMap((id) => catalog.salon(id) ?? [])),
];
