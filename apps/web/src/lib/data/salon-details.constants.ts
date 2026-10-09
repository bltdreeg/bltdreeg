// بيانات تجريبية: تفاصيل الصالون — shop-2 مكتوبة يدوياً من FRAME 04؛ باقي المحلات بتاخد قيم افتراضية
import { Punctuality } from "@/lib/types/queue";
import type { SalonDetails } from "@/lib/types/salon";
import { shops, shopById } from "@/lib/data/shops.constants";

const HOURS_DEFAULT = [
  { day: "الأحد", open: "10:00", close: "22:00" },
  { day: "الاثنين", open: "10:00", close: "22:00" },
  { day: "الثلاثاء", open: "10:00", close: "22:00" },
  { day: "الأربعاء", open: "10:00", close: "22:00" },
  { day: "الخميس", open: "10:00", close: "22:00" },
  { day: "الجمعة", open: "13:00", close: "23:00" },
  { day: "السبت", open: "10:00", close: "23:00" },
];

// بيانات shop-2 المكتوبة يدوياً من التصميم
const SALON_2_DETAIL: SalonDetails = {
  ...shopById.get("shop-2")!,
  photos: [
    "/dummy_salon/2.png",
    "/dummy_salon/3.png",
    "/dummy_salon/4.png",
    "/dummy_salon/5.png",
    "/dummy_salon/6.png",
  ],
  address: "12 شارع النصر، المعادي، القاهرة",
  landmark: "قريب من محطة مترو المعادي",
  phone: "01012345678",
  hours: [
    { day: "الأحد", open: "10:00", close: "22:00" },
    { day: "الاثنين", open: "10:00", close: "22:00" },
    { day: "الثلاثاء", open: "10:00", close: "22:00" },
    { day: "الأربعاء", open: "10:00", close: "22:00" },
    { day: "الخميس", open: "10:00", close: "22:00" },
    { day: "الجمعة", open: "13:00", close: "23:00" },
    { day: "السبت", open: "10:00", close: "23:00" },
  ],
  ratingCounts: { 1: 2, 2: 4, 3: 12, 4: 48, 5: 72 },
  ratingBreakdown: [
    { label: "جودة القصة", value: 4.9 },
    { label: "النظافة", value: 4.7 },
    { label: "دقة الوقت", value: 4.2 },
  ],
  punctuality: Punctuality.ON_TIME,
  avgDelayMinutes: 4,
  recentBookingsSampled: 30,
  queue: { peopleAhead: 2, waitMinutes: 20 },
  chairsActive: 3,
};

/** بيانات shop-1 */
const SALON_1_DETAIL: SalonDetails = {
  ...shopById.get("shop-1")!,
  photos: ["/dummy_salon/1.png", "/dummy_salon/7.png", "/dummy_salon/8.png"],
  address: "5 شارع 9، المعادي، القاهرة",
  landmark: "بجوار سوبر ماركت عمر أفندي",
  phone: "01098765432",
  hours: HOURS_DEFAULT,
  ratingCounts: { 1: 1, 2: 3, 3: 15, 4: 80, 5: 115 },
  ratingBreakdown: [
    { label: "جودة القصة", value: 4.9 },
    { label: "النظافة", value: 4.8 },
    { label: "دقة الوقت", value: 4.5 },
  ],
  punctuality: Punctuality.ON_TIME,
  avgDelayMinutes: 2,
  recentBookingsSampled: 25,
  queue: { peopleAhead: 0, waitMinutes: 0 },
  chairsActive: 3,
};

/** بنانة بـ id — تحويل النص لعدد بين 0 و 99 */
function hashId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100;
  return h;
}

/** بيانات افتراضية لأي صالون مش عنده تفاصيل يدوية */
function generateFallback(shopId: string): SalonDetails {
  const shop = shopById.get(shopId);
  if (!shop) throw new Error(`shop ${shopId} not found`);

  const n = hashId(shopId);
  const coverIdx = (n % 10) + 1;
  const extraIdx = ((n + 3) % 10) + 1;
  const extraIdx2 = ((n + 6) % 10) + 1;

  return {
    ...shop,
    photos: [
      shop.coverImage,
      `/dummy_salon/${coverIdx}.png`,
      `/dummy_salon/${extraIdx}.png`,
      `/dummy_salon/${extraIdx2}.png`,
    ],
    address: `${n + 1} شارع ${shop.cityName}، ${shop.cityName}، القاهرة`,
    landmark: `بالقرب من ميدان ${shop.cityName}`,
    phone: `010${String(n).padStart(8, "0")}`,
    hours: HOURS_DEFAULT,
    ratingCounts: {
      1: Math.max(1, n % 5),
      2: Math.max(2, n % 10),
      3: 10 + (n % 15),
      4: 30 + (n % 30),
      5: 20 + (n % 50),
    },
    ratingBreakdown: [
      { label: "جودة القصة", value: Math.round((3.5 + (n % 15) / 10) * 10) / 10 },
      { label: "النظافة", value: Math.round((3.8 + (n % 12) / 10) * 10) / 10 },
      { label: "دقة الوقت", value: Math.round((3.6 + (n % 13) / 10) * 10) / 10 },
    ],
    punctuality: n % 3 === 0 ? Punctuality.RUNNING_LATE : Punctuality.ON_TIME,
    avgDelayMinutes: n % 3 === 0 ? 5 + (n % 10) : 3,
    recentBookingsSampled: 20 + (n % 20),
    queue: { peopleAhead: n % 5, waitMinutes: n % 5 === 0 ? 0 : 8 + (n % 20) },
    chairsActive: 2 + (n % 3),
  };
}

const HAND_AUTHORED = new Map<string, SalonDetails>([
  ["shop-2", SALON_2_DETAIL],
  ["shop-1", SALON_1_DETAIL],
]);

const _cache = new Map<string, SalonDetails>();

/** بيانات الصالون الكاملة — بيرجع undefined لو الـ id مش معروف */
export function salonDetailsById(id: string): SalonDetails | undefined {
  const hand = HAND_AUTHORED.get(id);
  if (hand) return hand;

  // التحقق إن الصالون موجود أصلاً
  if (!shopById.has(id)) return undefined;

  if (!_cache.has(id)) {
    _cache.set(id, generateFallback(id));
  }
  return _cache.get(id)!;
}

// تولّد بيانات كل المحلات مرة واحدة عشان نضمن ما فيش فرق في الـ id
for (const shop of shops) {
  salonDetailsById(shop.id);
}
