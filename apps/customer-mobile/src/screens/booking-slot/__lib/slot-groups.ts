// منطق خطوة الميعاد من غير واجهة (بيتختبر بـ node): الأيام السبعة، الأيام المقفولة، وتقسيم المواعيد صبح/بعد الضهر/بالليل
import type { DayHours } from "@/lib/types/salon";
import type { TimeSlot } from "@/lib/types/booking";
import { dayMs } from "../../../lib/utils/day-keys.ts";

export type Period = "morning" | "afternoon" | "evening";

export const isClosedOn = (day: string, hours: DayHours[]) => hours.find((h) => h.weekday === new Date(dayMs(day)).getDay())?.opensAt == null;

/** المواعيد بعد نص الليل تبع ليل نفس يوم الشغل (زي Flutter) */
export function groupSlots(day: string, slots: TimeSlot[]): [Period, TimeSlot[]][] {
  const date = new Date(dayMs(day)).getDate();
  const groups = new Map<Period, TimeSlot[]>();
  for (const s of slots) {
    const at = new Date(s.start);
    const p: Period = at.getDate() !== date ? "evening" : at.getHours() < 12 ? "morning" : at.getHours() < 17 ? "afternoon" : "evening";
    groups.set(p, [...(groups.get(p) ?? []), s]);
  }
  return [...groups];
}
