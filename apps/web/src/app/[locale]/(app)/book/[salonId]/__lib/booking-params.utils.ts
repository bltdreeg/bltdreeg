// قراءة اختيارات الحجز من الـ query params، ومشاركة نفس المسودة بين الخطوات الثلاث
import { servicesByShop } from "@/lib/data/services.constants";
import { barbersByShop } from "@/lib/data/barbers.constants";
import type { Service } from "@/lib/types/service/service.interface";
import type { Barber } from "@/lib/types/barber/barber.interface";

export type BookingSearchParams = {
  service?: string | string[];
  when?: string;
  barber?: string;
};

export function resolveSelectedServices(shopId: string, params: BookingSearchParams): Service[] {
  const ids = params.service ? (Array.isArray(params.service) ? params.service : [params.service]) : [];
  const all = servicesByShop(shopId);
  return all.filter((s) => ids.includes(s.id));
}

export function resolveSelectedBarber(shopId: string, params: BookingSearchParams): Barber | null {
  if (!params.barber || params.barber === "any") return null;
  return barbersByShop(shopId).find((b) => b.id === params.barber) ?? null;
}

/** يبني نفس الـ query string زائد باراميتر جديد أو معدّل */
export function withParam(params: BookingSearchParams, key: "when" | "barber", value: string): string {
  const p = new URLSearchParams();
  const ids = params.service ? (Array.isArray(params.service) ? params.service : [params.service]) : [];
  for (const id of ids) p.append("service", id);
  if (params.when) p.set("when", params.when);
  if (params.barber) p.set("barber", params.barber);
  p.set(key, value);
  return p.toString();
}
