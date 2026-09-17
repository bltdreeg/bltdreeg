// بيانات تجريبية: مناطق القاهرة والجيزة مع عدد المحلات — الأعداد من التصميم
import type { Area } from "@/lib/types/area/area.interface";

export const areas: Area[] = [
  { id: "maadi", name: "المعادي", city: "القاهرة", shopCount: 128 },
  { id: "nasr-city", name: "مدينة نصر", city: "القاهرة", shopCount: 214 },
  { id: "dokki", name: "الدقي", city: "الجيزة", shopCount: 96 },
  { id: "mohandessin", name: "المهندسين", city: "الجيزة", shopCount: 142 },
  { id: "zamalek", name: "الزمالك", city: "القاهرة", shopCount: 48 },
  { id: "shubra", name: "شبرا", city: "القاهرة", shopCount: 87 },
  { id: "haram", name: "الهرم", city: "الجيزة", shopCount: 103 },
  { id: "helwan", name: "حلوان", city: "القاهرة", shopCount: 61 },
  { id: "mokattam", name: "المقطم", city: "القاهرة", shopCount: 54 },
  { id: "rehab", name: "الرحاب", city: "القاهرة", shopCount: 29 },
];

export const areaById = new Map(areas.map((a) => [a.id, a]));
