// الإحداثيات اللي بتتبعت للسيرفر وبتدخل في الـ query key: 3 أرقام عشرية (~100م) تكفي للترتيب بالأقرب،
// وبتثبّت المفتاح فالقائمة ماتتجابش تاني مع كل تغيير صغير في الموقع
import type { BrowserPosition } from "./browser-position.ts";
import { isInEgypt } from "./location-choice.ts";

export type QueryPosition = { lat: number; lng: number };

const round = (value: number) => Math.round(value * 1000) / 1000;

export function toQueryPosition(position: BrowserPosition | undefined): QueryPosition | null {
  if (!position || "error" in position || !isInEgypt(position.lat, position.lng)) return null;
  return { lat: round(position.lat), lng: round(position.lng) };
}
