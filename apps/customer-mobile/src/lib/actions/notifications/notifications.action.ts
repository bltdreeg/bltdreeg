// الإشعارات (محتاجة تسجيل دخول) — بتتنادى من React Query hooks بس
import { apiClient } from "@/lib/api";
import type { AppNotification, NotificationKind } from "@/lib/types/notification";

interface RawNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
  booking_id: string | null;
  salon_id: string | null;
}

export async function getNotifications(): Promise<AppNotification[]> {
  const raw = await apiClient.get<RawNotification[]>("/me/notifications");
  return raw.map((n) => ({ id: n.id, kind: n.kind, title: n.title, body: n.body, createdAt: n.created_at, isRead: n.is_read, bookingId: n.booking_id, salonId: n.salon_id }));
}

/** من غير ids = الكل */
export async function markNotificationsRead(ids?: string[]): Promise<void> {
  await apiClient.post("/me/notifications/read", ids ? { ids } : {});
}
