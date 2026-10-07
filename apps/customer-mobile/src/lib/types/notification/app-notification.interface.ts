// إشعار في قايمة الإشعارات (فريم 32) — زي AppNotification في Flutter
export type NotificationKind = "yourTurn" | "almostUp" | "queueMoved" | "offer" | "rateReminder" | "cancelled";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  bookingId: string | null;
  salonId: string | null;
}
