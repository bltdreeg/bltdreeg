// تفضيلات الجهاز (مش بيانات الحساب): الأونبوردنج، المنطقة المختارة، وإعدادات الإشعارات (فريم 37) — زي تطبيق Flutter
import { readPref, removePref, writePref } from "./device-prefs";

const ONBOARDING_SEEN_KEY = "beltadreeg_onboarding_seen";
const AREA_KEY = "beltadreeg_area";
const DEFAULT_AREA = "maadi";
const NOTIFICATIONS_KEY = "beltadreeg_notification_settings";

/** إشعارات الطابور مش هنا: مقفولة على "شغّالة" (قرار منتج — فريم 37) */
export type NotificationSetting = "favoriteOffers" | "favoriteFree" | "rateReminder" | "newSalons" | "push" | "sms";
const DEFAULT_NOTIFICATIONS: Record<NotificationSetting, boolean> = { favoriteOffers: true, favoriteFree: true, rateReminder: true, newSalons: false, push: true, sms: true };

let onboardingSeen = false;
let selectedAreaId = DEFAULT_AREA;
let notifications = DEFAULT_NOTIFICATIONS;
const listeners = new Set<() => void>();

export const appPreferences = {
  async load(): Promise<void> {
    onboardingSeen = (await readPref(ONBOARDING_SEEN_KEY)) === "1";
    selectedAreaId = (await readPref(AREA_KEY)) ?? DEFAULT_AREA;
    try {
      notifications = { ...DEFAULT_NOTIFICATIONS, ...JSON.parse((await readPref(NOTIFICATIONS_KEY)) ?? "{}") };
    } catch {
      notifications = DEFAULT_NOTIFICATIONS;
    }
    listeners.forEach((l) => l());
  },

  onboardingSeen(): boolean {
    return onboardingSeen;
  },

  markOnboardingSeen(): void {
    onboardingSeen = true;
    void writePref(ONBOARDING_SEEN_KEY, "1");
    listeners.forEach((l) => l());
  },

  selectedAreaId(): string {
    return selectedAreaId;
  },

  setSelectedArea(id: string): void {
    selectedAreaId = id;
    void writePref(AREA_KEY, id);
    listeners.forEach((l) => l());
  },

  notificationSettings(): Record<NotificationSetting, boolean> {
    return notifications;
  },

  setNotification(key: NotificationSetting, on: boolean): void {
    notifications = { ...notifications, [key]: on };
    void writePref(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    listeners.forEach((l) => l());
  },

  /** dev gallery: show onboarding again without clearing app data */
  resetOnboarding(): void {
    onboardingSeen = false;
    void removePref(ONBOARDING_SEEN_KEY);
    listeners.forEach((l) => l());
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
