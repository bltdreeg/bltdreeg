// بيانات تجريبية: مناطق القاهرة والجيزة مع عدد المحلات
import type { Area } from "@/lib/types/area/area.interface";

export const areas: Area[] = [
  { id: "maadi", name: "المعادي", city: "القاهرة", shopCount: 14 },
  { id: "nasr-city", name: "مدينة نصر", city: "القاهرة", shopCount: 22 },
  { id: "heliopolis", name: "مصر الجديدة", city: "القاهرة", shopCount: 18 },
  { id: "zamalek", name: "الزمالك", city: "القاهرة", shopCount: 6 },
  { id: "new-cairo", name: "التجمع الخامس", city: "القاهرة", shopCount: 25 },
  { id: "dokki", name: "الدقي", city: "الجيزة", shopCount: 11 },
  { id: "mohandessin", name: "المهندسين", city: "الجيزة", shopCount: 16 },
  { id: "6-october", name: "6 أكتوبر", city: "الجيزة", shopCount: 19 },
];
