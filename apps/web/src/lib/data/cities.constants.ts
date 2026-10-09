// بيانات تجريبية: مدن القاهرة والجيزة مع عدد المحلات — الأعداد من التصميم
import type { City } from "@/lib/types/city/city.interface";

export const cities: City[] = [
  { id: "maadi", name: "المعادي", governorate: "القاهرة", shopCount: 128 },
  { id: "nasr-city", name: "مدينة نصر", governorate: "القاهرة", shopCount: 214 },
  { id: "dokki", name: "الدقي", governorate: "الجيزة", shopCount: 96 },
  { id: "mohandessin", name: "المهندسين", governorate: "الجيزة", shopCount: 142 },
  { id: "zamalek", name: "الزمالك", governorate: "القاهرة", shopCount: 48 },
  { id: "shubra", name: "شبرا", governorate: "القاهرة", shopCount: 87 },
  { id: "haram", name: "الهرم", governorate: "الجيزة", shopCount: 103 },
  { id: "helwan", name: "حلوان", governorate: "القاهرة", shopCount: 61 },
  { id: "mokattam", name: "المقطم", governorate: "القاهرة", shopCount: 54 },
  { id: "rehab", name: "الرحاب", governorate: "القاهرة", shopCount: 29 },
];

export const cityById = new Map(cities.map((c) => [c.id, c]));
