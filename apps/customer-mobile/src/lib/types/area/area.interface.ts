// نوع المنطقة
export interface Area {
  id: string;
  name: string;
  city: "القاهرة" | "الجيزة";
  shopCount: number;
  /** بتظهر تحت "مناطق قريبة منك" (فريم 40) — موبايل بس لحد ما الويب يحتاجها */
  isNearby: boolean;
}
