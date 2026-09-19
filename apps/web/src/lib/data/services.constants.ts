// بيانات تجريبية: خدمات بمدد حقيقية وأسعار — من التصميم (بربر لاونج المعادي) زائد مجموعة أصغر لصالون-1
import { ServiceCategory, type Service } from "@/lib/types/service/service.interface";

export const services: Service[] = [
  // shop-2 — بربر لاونج المعادي — الخدمات السبعة الكاملة من FRAME 04
  {
    id: "svc-2-1",
    shopId: "shop-2",
    name: "قص شعر بالمقص",
    durationMinutes: 30,
    price: 120,
    category: ServiceCategory.CUT,
    note: "مع غسيل وتجفيف",
  },
  {
    id: "svc-2-2",
    shopId: "shop-2",
    name: "قص شعر بالماكينة",
    durationMinutes: 20,
    price: 90,
    category: ServiceCategory.CUT,
  },
  {
    id: "svc-2-3",
    shopId: "shop-2",
    name: "قص شعر أطفال",
    durationMinutes: 25,
    price: 70,
    category: ServiceCategory.CUT,
    note: "لحد 12 سنة",
  },
  {
    id: "svc-2-4",
    shopId: "shop-2",
    name: "تحديد دقن",
    durationMinutes: 20,
    price: 60,
    category: ServiceCategory.BEARD,
  },
  {
    id: "svc-2-5",
    shopId: "shop-2",
    name: "حلاقة بالموس",
    durationMinutes: 30,
    price: 100,
    category: ServiceCategory.BEARD,
    note: "فوطة سخنة وكريم",
  },
  {
    id: "svc-2-6",
    shopId: "shop-2",
    name: "صبغة شعر",
    durationMinutes: 60,
    price: 180,
    category: ServiceCategory.EXTRA,
  },
  {
    id: "svc-2-7",
    shopId: "shop-2",
    name: "ماسك فحم للوش",
    durationMinutes: 15,
    price: 55,
    category: ServiceCategory.EXTRA,
  },

  // shop-1 — صالون الكابتن حسام — خدمات متكاملة
  {
    id: "svc-1-1",
    shopId: "shop-1",
    name: "قص شعر بالمقص",
    durationMinutes: 30,
    price: 80,
    category: ServiceCategory.CUT,
    note: "مع غسيل وتجفيف",
  },
  {
    id: "svc-1-2",
    shopId: "shop-1",
    name: "قص شعر بالماكينة",
    durationMinutes: 20,
    price: 60,
    category: ServiceCategory.CUT,
  },
  {
    id: "svc-1-3",
    shopId: "shop-1",
    name: "قص شعر أطفال",
    durationMinutes: 25,
    price: 50,
    category: ServiceCategory.CUT,
    note: "لحد 12 سنة",
  },
  {
    id: "svc-1-4",
    shopId: "shop-1",
    name: "تحديد دقن",
    durationMinutes: 20,
    price: 50,
    category: ServiceCategory.BEARD,
  },
  {
    id: "svc-1-5",
    shopId: "shop-1",
    name: "حلاقة بالموس",
    durationMinutes: 30,
    price: 95,
    category: ServiceCategory.BEARD,
    note: "فوطة سخنة وكريم",
  },
  {
    id: "svc-1-6",
    shopId: "shop-1",
    name: "صبغة شعر",
    durationMinutes: 60,
    price: 150,
    category: ServiceCategory.EXTRA,
  },
  {
    id: "svc-1-7",
    shopId: "shop-1",
    name: "ماسك فحم للوش",
    durationMinutes: 15,
    price: 45,
    category: ServiceCategory.EXTRA,
  },
];

/** خدمات صالون معيّن — لو مفيش خدمات مخصّصة، بيرجّع قائمة متكاملة افتراضية */
export function servicesByShop(shopId: string, priceFrom = 80): Service[] {
  const own = services.filter((s) => s.shopId === shopId);
  if (own.length > 0) return own;

  return [
    {
      id: `svc-${shopId}-1`,
      shopId,
      name: "قص شعر بالمقص",
      durationMinutes: 30,
      price: priceFrom,
      category: ServiceCategory.CUT,
      note: "مع غسيل وتجفيف",
    },
    {
      id: `svc-${shopId}-2`,
      shopId,
      name: "قص شعر بالماكينة",
      durationMinutes: 20,
      price: Math.max(40, priceFrom - 20),
      category: ServiceCategory.CUT,
    },
    {
      id: `svc-${shopId}-3`,
      shopId,
      name: "تحديد دقن",
      durationMinutes: 20,
      price: Math.max(30, priceFrom - 30),
      category: ServiceCategory.BEARD,
    },
    {
      id: `svc-${shopId}-4`,
      shopId,
      name: "حلاقة بالموس",
      durationMinutes: 30,
      price: priceFrom + 20,
      category: ServiceCategory.BEARD,
      note: "فوطة سخنة وكريم",
    },
    {
      id: `svc-${shopId}-5`,
      shopId,
      name: "ماسك فحم للوش",
      durationMinutes: 15,
      price: 50,
      category: ServiceCategory.EXTRA,
    },
  ];
}
