// باك إند صفحة الصالون الوهمي — منقول من FakeSalonDetailsRemoteDataSource في Flutter. مبني فوق الكتالوج عشان الصفحة
// والقوايم يتفقوا على الطابور. "صالون الكابتن حسام" (s1) بمحتوى البورد بالظبط، والباقي محتوى متولّد ثابت.
import type { SalonOffer } from "@/lib/types/offer/offer.interface";
import type { DayHours, GalleryItem, SalonBarber, SalonReview, ServiceGroup, SalonService, ServiceKind } from "@/lib/types/salon";
import type { RawSalonPage, RawSalonSummary } from "@/lib/utils/salons/salon-mappers";
import { MockHttpError, route } from "./router.ts";
import { catalog as defaultCatalog, type createCatalog } from "./salons.mock.ts";

type Catalog = ReturnType<typeof createCatalog>;
const DAY_MS = 86_400_000;
const H = 60;
const THURSDAY = 4;
const FRIDAY = 5;

const ADDRESSES: Record<string, string> = { s1: "9 ش المنشية، المعادي", s3: "27 ش النصر، المعادي الجديدة" };

const S1_GROUPS: ServiceGroup[] = [
  {
    title: "حلاقة وتصفيف",
    services: [
      { id: "s1-haircut", name: "قصة شعر", kind: "haircut", durationMinutes: 25, price: 70 },
      { id: "s1-haircut-wash", name: "قصة شعر + غسيل", kind: "haircut", durationMinutes: 35, price: 90 },
      { id: "s1-kids", name: "حلاقة أطفال", kind: "kids", durationMinutes: 20, price: 55 },
    ],
  },
  {
    title: "دقن وعناية",
    services: [
      { id: "s1-beard", name: "حلاقة دقن", kind: "beard", durationMinutes: 15, price: 50 },
      { id: "s1-skincare", name: "ماسك وتنظيف بشرة", kind: "skincare", durationMinutes: 30, price: 110 },
    ],
  },
];

const SERVICE_META: Record<ServiceKind, [string, number]> = {
  haircut: ["قصة شعر", 25],
  kids: ["حلاقة أطفال", 20],
  color: ["صبغة", 45],
  beard: ["حلاقة دقن", 15],
  skincare: ["تنظيف بشرة", 30],
};

const NAMES: [string, string][] = [
  ["عمر حسين", "فيد وتدريج"],
  ["مصطفى كمال", "حلاقة كلاسيك"],
  ["سيد عبد العزيز", "دقن وتحديد"],
  ["هاني فؤاد", "قصات أطفال"],
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function createSalonDetails(catalog: Catalog = defaultCatalog, clock: () => number = Date.now) {
  function services(s: RawSalonSummary): ServiceGroup[] {
    if (s.id === "s1") return S1_GROUPS;
    const service = (k: ServiceKind): SalonService => ({ id: `${s.id}-${k}`, name: SERVICE_META[k][0], kind: k, durationMinutes: SERVICE_META[k][1], price: s.service_prices[k]! });
    const pick = (kinds: ServiceKind[]) => kinds.filter((k) => s.service_prices[k] !== undefined).map(service);
    const hair = pick(["haircut", "kids", "color"]);
    const care = pick(["beard", "skincare"]);
    return [...(hair.length ? [{ title: "حلاقة وتصفيف", services: hair }] : []), ...(care.length ? [{ title: "دقن وعناية", services: care }] : [])];
  }

  /** حلاق بالاسم = طابور فرعي أطول من الطابور المشترك بفرق ثابت (فريم 22: الصالون فاضي وأحمد قدامه ٢) */
  function barbers(s: RawSalonSummary): SalonBarber[] {
    const perPerson = catalog.perPerson(s.id);
    const working = (offset: number) => {
      const ahead = s.queue.people_ahead + offset;
      return { queue: { peopleAhead: ahead, waitMinutes: ahead * perPerson + offset }, returnsOn: null };
    };
    const tomorrow = new Date(clock());
    tomorrow.setHours(24, 0, 0, 0);
    const off = { queue: null, returnsOn: tomorrow.toISOString() };
    if (s.id === "s1") {
      return [
        { id: "s1-b1", name: "أحمد مجدي", specialty: "فيد وتدريج", yearsExperience: 6, rating: 4.9, reviewsCount: 86, ...working(2) },
        { id: "s1-b2", name: "محمود السيد", specialty: "حلاقة كلاسيك ودقن", yearsExperience: 4, rating: 4.6, reviewsCount: 52, ...working(0) },
        { id: "s1-b3", name: "كريم عبد الله", specialty: "صبغة وعلاج شعر", yearsExperience: null, rating: 4.4, reviewsCount: 29, ...off },
      ];
    }
    const seed = Number(s.id.slice(1));
    return [0, 1].map((i) => {
      const [name, specialty] = NAMES[(seed + i) % NAMES.length];
      return {
        id: `${s.id}-b${i + 1}`,
        name,
        specialty,
        yearsExperience: 2 + ((seed + i) % 7),
        rating: s.rating === null ? null : clamp(s.rating - i * 0.2, 3, 5),
        reviewsCount: Math.floor(s.reviews_count / (2 + i)),
        ...(s.opens_at === null ? working(i) : off),
      };
    });
  }

  function offers(s: RawSalonSummary): SalonOffer[] {
    if (s.id === "s1") {
      return [
        { id: "s1-o1", shopId: s.id, kind: "discount", title: "خصم 20٪ على قصة الشعر", description: "من الأحد للأربعاء، من 12 ظهراً لـ 4 عصراً", expiresAt: new Date(clock() + 6 * DAY_MS).toISOString(), highlighted: true },
        { id: "s1-o2", shopId: s.id, kind: "bundle", title: "باقة: قصة + دقن بـ 100 ج.م", originalPrice: 120, price: 100, serviceIds: ["s1-haircut", "s1-beard"] },
        { id: "s1-o3", shopId: s.id, kind: "loyalty", title: "الخامسة ببلاش", visitsDone: 3, visitsTarget: 5 },
      ];
    }
    return [{ id: `${s.id}-o1`, shopId: s.id, kind: "loyalty", title: "السادسة ببلاش", visitsDone: Number(s.id.slice(1)) % 5, visitsTarget: 6 }];
  }

  function reviews(s: RawSalonSummary): SalonReview[] {
    if (s.rating === null) return [];
    const ago = (days: number) => new Date(clock() - days * DAY_MS).toISOString();
    const r = (o: Partial<SalonReview> & Pick<SalonReview, "id" | "authorName" | "stars" | "createdAt" | "text">): SalonReview => ({ serviceName: null, barberName: null, barberId: null, photoCount: 0, salonReply: null, ...o });
    if (s.id === "s1") {
      return [
        r({ id: "s1-r1", authorName: "محمد طارق", stars: 5, createdAt: ago(3), text: "الأسطى أحمد ايده خفيفة والقصة طلعت زي ما طلبت بالظبط. المحل نضيف والدور كان بالظبط زي ما التطبيق قال.", serviceName: "قصة شعر", barberName: "أحمد مجدي", barberId: "s1-b1" }),
        r({ id: "s1-r2", authorName: "يوسف الشناوي", stars: 4, createdAt: ago(7), text: "الحلاقة ممتازة بس استنيت 10 دقايق زيادة عن الوقت اللي التطبيق قاله.", salonReply: "اعتذر يا فندم، كان فيه زبون اتأخر. شكراً لملاحظتك." }),
        r({ id: "s1-r3", authorName: "عمرو فتحي", stars: 5, createdAt: ago(12), text: "أحسن فيد عملته من زمان. صورت القصة عشان أرجع بيها تاني.", serviceName: "قصة شعر + غسيل", barberName: "أحمد مجدي", barberId: "s1-b1", photoCount: 2 }),
        r({ id: "s1-r4", authorName: "شريف منير", stars: 3, createdAt: ago(20), text: "الدقن كويسة بس المكان كان زحمة شوية يوم الجمعة.", serviceName: "حلاقة دقن", barberName: "محمود السيد", barberId: "s1-b2" }),
      ];
    }
    return [r({ id: `${s.id}-r1`, authorName: "أحمد سامي", stars: Math.round(s.rating), createdAt: ago(5), text: "خدمة كويسة والأسعار زي المكتوب بالظبط.", serviceName: "قصة شعر" })];
  }

  const hours = (s: RawSalonSummary): DayHours[] =>
    [0, 1, 2, 3, 4, 5, 6].map((weekday) =>
      s.closed_weekdays.includes(weekday)
        ? { weekday, opensAt: null, closesAt: null }
        : weekday === THURSDAY
          ? { weekday, opensAt: 11 * H, closesAt: 25 * H }
          : weekday === FRIDAY
            ? { weekday, opensAt: 14 * H, closesAt: 25 * H }
            : { weekday, opensAt: 11 * H, closesAt: 24 * H },
    );

  const item = (id: string, kind: GalleryItem["kind"], caption: string | null = null, durationSeconds: number | null = null): GalleryItem => ({ id, kind, url: null, caption, durationSeconds });

  return {
    page(id: string): RawSalonPage {
      const s = catalog.salon(id);
      if (!s) throw new MockHttpError(404, "salon.not_found", `Salon ${id} not found`);
      const hash = [...s.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 1_000_000, 7);
      return {
        summary: s,
        address: ADDRESSES[s.id] ?? s.area_name,
        phone: `0225${String(hash).padStart(6, "0")}`,
        latitude: 29.9602 + s.distance_km / 200,
        longitude: 31.2569 + s.distance_km / 250,
        chairsActive: s.id === "s1" ? 3 : 2,
        serviceGroups: services(s),
        barbers: barbers(s),
        offers: offers(s),
        ratingBreakdown: s.rating === null ? null : { quality: clamp(s.rating + 0.1, 0, 5), cleanliness: clamp(s.rating - 0.1, 0, 5), timeAccuracy: clamp(s.rating - 0.6, 0, 5) },
        reviews: reviews(s),
        hours: hours(s),
        gallery: [item(`${s.id}-v1`, "video", "جولة في المحل", 48), ...[1, 2, 3, 4, 5, 6, 7].map((i) => item(`${s.id}-w${i}`, "work")), ...[1, 2, 3, 4, 5].map((i) => item(`${s.id}-p${i}`, "place"))],
        reviewPhotos: [1, 2, 3].map((i) => item(`${s.id}-rp${i}`, "work")),
      };
    },
  };
}

const details = createSalonDetails();

export const salonDetailsRoutes = [route("GET", "/salons/:salonId", (req) => details.page(req.params.salonId))];
