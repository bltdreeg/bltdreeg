// الإشعارات متجمّعة بالعمر (فريم 32): النهارده / الأسبوع ده / أقدم، الأحدث الأول — زي groupedBy في Flutter
import type { AppNotification, NotificationKind } from "@/lib/types/notification";

export type NotificationGroup = "today" | "thisWeek" | "earlier";

/** إشعارات الطابور ليها شريط جانبي ملوّن (ملاحظة فريم 32) */
export const isQueueKind = (k: NotificationKind) => k !== "offer" && k !== "rateReminder";

export function groupNotifications(list: AppNotification[], now: number): [NotificationGroup, AppNotification[]][] {
  const d = new Date(now);
  const today = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const weekAgo = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7).getTime();
  const groups: Record<NotificationGroup, AppNotification[]> = { today: [], thisWeek: [], earlier: [] };
  for (const n of [...list].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))) {
    const at = Date.parse(n.createdAt);
    groups[at >= today ? "today" : at > weekAgo ? "thisWeek" : "earlier"].push(n);
  }
  return (Object.entries(groups) as [NotificationGroup, AppNotification[]][]).filter(([, items]) => items.length);
}
