// حالة الانتظار من حمل الطابور. من غير نت الرقم الحي "بيكدب" فبيبقى stale (فريم 08).
import type { QueueLoad, WaitStatus } from "../../types/queue/index.ts";

export function waitStatus(load: QueueLoad, isOpen: boolean, online: boolean): WaitStatus {
  if (!online) return "stale";
  if (!isOpen) return "closed";
  if (load.peopleAhead === 0) return "free";
  if (load.peopleAhead === 1) return "short";
  return load.peopleAhead <= 3 ? "mid" : "busy";
}

/** الوقت كمدى مش رقم واحد (فريم 25) — منقول من WaitEstimate.around في Flutter: ±20% مقرّب لـ 5 دقايق */
export function waitRange(minutes: number): { min: number; max: number } {
  if (minutes <= 0) return { min: 0, max: 0 };
  const min = Math.round((minutes * 0.8) / 5) * 5;
  const high = Math.ceil((minutes * 1.2) / 5) * 5;
  return { min, max: high > min ? high : min + 5 };
}
