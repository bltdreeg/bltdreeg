// حالة مسار الحجز في الـ URL: ?service=..&service=..&chair=..&when=now|slot&slot=..
// الخطوة الحالية بتتحسب من اللي متحدد (مش متخزنة)، فالرجوع للخلف في المتصفح بيرجع خطوة
import type { ReservationType } from "../../types/reservation/index.ts";

export type BookingStep = "barber" | "when" | "review";

export interface BookingSelection {
  serviceIds: string[];
  chairId: string | null;
  when: ReservationType | null;
  slotId: string | null;
}

type ParamsReader = { get(name: string): string | null; getAll(name: string): string[] };

export function parseBookingSelection(params: ParamsReader): BookingSelection {
  const serviceIds = [...new Set(params.getAll("service").filter(Boolean))];
  const chairId = params.get("chair") || null;
  const rawWhen = params.get("when");
  const slotId = params.get("slot") || null;
  const when: ReservationType | null =
    rawWhen === "now" ? "join_now" : rawWhen === "slot" && slotId ? "slot" : null;

  return { serviceIds, chairId, when: chairId ? when : null, slotId: when === "slot" ? slotId : null };
}

export function bookingStep(selection: BookingSelection): BookingStep {
  if (!selection.chairId) return "barber";
  if (!selection.when) return "when";
  return "review";
}

/** query string للاختيار (من غير "?") — الحقول اللي بعد الخطوة المتغيرة بتتمسح عن طريق null */
export function toBookingQuery(selection: BookingSelection): string {
  const params = new URLSearchParams();
  for (const id of selection.serviceIds) params.append("service", id);
  if (selection.chairId) {
    params.set("chair", selection.chairId);
    if (selection.when === "join_now") params.set("when", "now");
    if (selection.when === "slot" && selection.slotId) {
      params.set("when", "slot");
      params.set("slot", selection.slotId);
    }
  }
  return params.toString();
}
