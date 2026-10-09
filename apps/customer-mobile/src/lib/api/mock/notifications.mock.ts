// الإشعارات الوهمية — منقولة من FakeNotificationsRemoteDataSource في Flutter: نفس الستة، والوقت نسبةً للطلب
import { MockHttpError, route, type MockRequest } from "./router.ts";

const MIN = 60_000;
const DAY = 24 * 60 * MIN;
const SEED = [
  { id: "n1", kind: "yourTurn", title: "حان دورك", body: "ادخل على الكرسي في صالون الكابتن حسام. عندك 5 دقايق.", ago: 4 * MIN, booking_id: "bk-past-1", salon_id: "s1" },
  { id: "n2", kind: "almostUp", title: "فاضلك واحد بس — اتحرّك", body: "المشوار 4 دقايق من مكانك لصالون الكابتن حسام.", ago: 14 * MIN, booking_id: "bk-past-1", salon_id: "s1" },
  { id: "n3", kind: "queueMoved", title: "فاضلك اتنين", body: "دورك قرّب في صالون الكابتن حسام.", ago: 22 * MIN, booking_id: "bk-past-1", salon_id: "s1" },
  { id: "n4", kind: "offer", title: "عرض جديد في صالون مفضّل عندك", body: "خصم 20٪ على قصة الشعر في الكابتن حسام، من 12 لـ 4.", ago: 2 * DAY, booking_id: null, salon_id: "s1" },
  { id: "n5", kind: "rateReminder", title: "قيّم زيارتك الأخيرة", body: "رأيك في أحمد مجدي هيساعد ناس تانية تختار.", ago: 5 * DAY, booking_id: "bk-past-1", salon_id: "s1" },
  { id: "n6", kind: "cancelled", title: "دورك اتلغى", body: "ما حضرتش في الوقت المحدد في حلاق الأسطى رجب.", ago: 7 * DAY, booking_id: "bk-past-3", salon_id: "s5" },
];
const read = new Set<string>();

const authed = (req: MockRequest) => {
  if (!req.token) throw new MockHttpError(401, "auth.unauthenticated", "Unauthenticated.");
};

export const notificationRoutes = [
  route("GET", "/me/notifications", (req) => {
    authed(req);
    const now = Date.now();
    return SEED.map(({ ago, ...n }) => ({ ...n, created_at: new Date(now - ago).toISOString(), is_read: read.has(n.id) }));
  }),
  route("POST", "/me/notifications/read", (req) => {
    authed(req);
    for (const id of (req.body.ids as string[] | undefined) ?? SEED.map((n) => n.id)) read.add(id);
    return null;
  }),
];
