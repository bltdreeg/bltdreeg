// باك إند الحجز الوهمي — منقول من FakeBookingRemoteDataSource في Flutter.
// المواعيد ماشية على مواعيد الصالون وحلاقينه، والميعاد المتأكد بيتقفل. الدخول "دلوقتي" بيزوّد واحد في طابور الصالون الحي.
// الطابور بيتحرك لوحده: كل ٢٠ ثانية اللي قدام بيخلص. في الأول العميل عنده ٥ دقايق يحضر، وبعدها بيتأجل مرة،
// وبعدها بيفوته. اللي حضر بيخلص بعد ٣ خطوات.
import type { DraftService } from "@/lib/utils/booking-draft";
import type { SalonBarber } from "@/lib/types/salon";
import type { RawBooking, RawDaySchedule } from "@/lib/utils/booking/booking-mappers";
import { isActive, isRunning, quoteBooking, TURN_GRACE_MS } from "../../utils/booking/booking-pricing.ts";
import { dayKey } from "../../utils/day-keys.ts";
import { MockHttpError, route, type MockRequest } from "./router.ts";
import { createSalonDetails } from "./salon-details.mock.ts";
import { catalog as defaultCatalog, type createCatalog } from "./salons.mock.ts";

export const QUEUE_STEP_MS = 20_000;
const SERVICE_STEPS = 3;
const SLOT_STEP = 30;
/** أول ميعاد ممكن بعد دلوقتي بكام — عشان يلحق يوصل */
const LEAD_MS = 20 * 60_000;

/** نفس القيمة كل مرة (زي _stableHash في Flutter) — مين مشغول في ميعاد معيّن */
function stableHash(value: string): number {
  let h = 17;
  for (let i = 0; i < value.length; i++) h = (Math.imul(h, 31) + value.charCodeAt(i)) & 0x7fffffff;
  h ^= h >> 15;
  h = Math.imul(h, 0x2c1b3c6d) & 0x7fffffff;
  h ^= h >> 12;
  h = Math.imul(h, 0x297a2d39) & 0x7fffffff;
  return h ^ (h >> 15);
}


type Catalog = ReturnType<typeof createCatalog>;
type Details = ReturnType<typeof createSalonDetails>;

const rule = (code: string, message: string, data?: Record<string, unknown>) => new MockHttpError(422, `booking.${code}`, message, data);

export function createBookings(catalog: Catalog = defaultCatalog, details: Details = createSalonDetails(catalog), clock: () => number = Date.now) {
  const bookings = new Map<string, RawBooking>();
  const requests = new Map<string, string>();
  /** آخر خطوة اتحسبت لكل حجز */
  const steppedAt = new Map<string, number>();
  const serviceSteps = new Map<string, number>();
  const holds: { bookingId: string; barberId: string; start: number; end: number }[] = [];
  let nextId = 1;

  /** workingDay = يوم بداية الشيفت: ميعاد ١٢:٣٠ ص في صالون بيقفل ١ ص تبع شيفت امبارح */
  function isFree(salonId: string, barber: SalonBarber, workingDay: number, start: number, minutes: number): boolean {
    if (barber.queue === null && barber.returnsOn && workingDay < Date.parse(barber.returnsOn)) return false;
    const end = start + minutes * 60_000;
    if (holds.some((h) => h.barberId === barber.id && start < h.end && h.start < end)) return false;
    // مواعيد زباين تانيين: بالليل أزحم
    const busyOutOf10 = new Date(start).getHours() >= 18 ? 5 : 3;
    return stableHash(`${salonId}|${barber.id}|${new Date(start).toISOString()}`) % 10 >= busyOutOf10;
  }

  function schedule(salonId: string, day: string, minutes: number): RawDaySchedule {
    const page = details.page(salonId);
    const [y, m, d] = day.split("-").map(Number);
    const date = new Date(y, m - 1, d).getTime();
    const hours = page.hours.find((h) => h.weekday === new Date(date).getDay());
    if (!hours || hours.opensAt === null || hours.closesAt === null) return { day, slots: [] };
    const earliest = clock() + LEAD_MS;
    const slots: RawDaySchedule["slots"] = [];
    for (let at = hours.opensAt; at + minutes <= hours.closesAt; at += SLOT_STEP) {
      const start = new Date(y, m - 1, d, 0, at).getTime();
      if (start < earliest) continue;
      slots.push({ start: new Date(start).toISOString(), free_barber_ids: page.barbers.filter((b) => isFree(salonId, b, date, start, minutes)).map((b) => b.id) });
    }
    return { day, slots };
  }

  const postponed = (b: RawBooking): RawBooking => ({ ...b, status: "waiting", people_ahead: 1, wait_minutes: catalog.perPerson(b.salon_id), turn_started_at: null, postpone_used: true });

  function advance(b: RawBooking, at: number): RawBooking {
    switch (b.status) {
      case "waiting": {
        catalog.leave(b.salon_id); // اللي قدام خلص
        const ahead = b.people_ahead - 1;
        if (ahead <= 0) return { ...b, status: "yourTurn", people_ahead: 0, wait_minutes: 0, turn_started_at: new Date(at).toISOString() };
        return { ...b, people_ahead: ahead, wait_minutes: ahead * catalog.perPerson(b.salon_id) };
      }
      case "yourTurn":
        if (at < Date.parse(b.turn_started_at!) + TURN_GRACE_MS) return b;
        return b.postpone_used ? { ...b, status: "missed", turn_started_at: null } : postponed(b);
      case "inService": {
        const steps = (serviceSteps.get(b.id) ?? 0) + 1;
        serviceSteps.set(b.id, steps);
        return steps >= SERVICE_STEPS ? { ...b, status: "completed" } : b;
      }
      default:
        return b;
    }
  }

  /** بيحسب الخطوات اللي عدّت من آخر مرة (زي drift الكتالوج) — الدفع اللحظي الحقيقي مع الباك إند */
  function current(id: string): RawBooking {
    let b = bookings.get(id);
    if (!b) throw new MockHttpError(404, "booking.not_found", `Booking ${id} not found`);
    let at = steppedAt.get(id)!;
    while (isRunning(b) && clock() - at >= QUEUE_STEP_MS) {
      at += QUEUE_STEP_MS;
      b = advance(b, at);
    }
    steppedAt.set(id, at);
    bookings.set(id, b);
    return b;
  }

  function save(b: RawBooking): RawBooking {
    bookings.set(b.id, b);
    return b;
  }

  function requireActive(id: string): RawBooking {
    const b = current(id);
    if (!isActive(b)) throw rule("finished", "Booking finished");
    return b;
  }

  function confirm(body: Record<string, unknown>): RawBooking {
    const requestId = String(body.request_id ?? "");
    const existing = requests.get(requestId);
    if (existing) return current(existing);

    const salonId = String(body.salon_id ?? "");
    const page = details.page(salonId);
    const barberId = (body.barber_id as string | null) ?? null;
    const named = barberId ? page.barbers.find((b) => b.id === barberId) : null;
    if (barberId && !named) throw rule("barber_unavailable", "Barber unavailable");
    const ids = (body.service_ids as string[] | undefined) ?? [];
    const services: DraftService[] = page.serviceGroups.flatMap((g) => g.services).filter((s) => ids.includes(s.id));
    if (!services.length) throw new MockHttpError(422, "validation.failed", "Pick a service", undefined, { service_ids: ["required"] });
    const startAt = typeof body.start_at === "string" ? body.start_at : null;
    const quote = quoteBooking(services, page.offers);
    const now = clock();
    const base = {
      id: `bk${nextId++}`,
      salon_id: salonId,
      salon_name: page.summary.name,
      salon_area: page.summary.area_name,
      lat: page.latitude,
      lng: page.longitude,
      services: services.map((s) => ({ id: s.id, name: s.name, duration: s.durationMinutes, price: s.price })),
      subtotal: quote.subtotal,
      discounts: quote.discounts.map((d) => ({ offer_id: d.offerId, amount: d.amount })),
      created_at: new Date(now).toISOString(),
      barber_id: named?.id ?? null,
      barber_name: named?.name ?? null,
      postpone_used: false,
      rating: null,
      quoted_wait_minutes: null,
      served_at: null,
    };

    if (startAt) {
      const start = Date.parse(startAt);
      const minutes = services.reduce((sum, s) => sum + s.durationMinutes, 0);
      // الميعاد بعد نص الليل ممكن يبقى تبع شيفت امبارح
      const slot = [start, start - 86_400_000].map((d) => schedule(salonId, dayKey(d), minutes).slots.find((x) => Date.parse(x.start) === start)).find(Boolean);
      if (!slot?.free_barber_ids.length) throw rule("slot_taken", "Slot taken");
      const assigned = named?.id ?? slot.free_barber_ids[0];
      if (!slot.free_barber_ids.includes(assigned)) throw named?.queue === null ? rule("barber_unavailable", "Barber unavailable") : rule("slot_taken", "Slot taken");
      holds.push({ bookingId: base.id, barberId: assigned, start, end: start + minutes * 60_000 });
      const b: RawBooking = { ...base, status: "upcoming", start_at: new Date(start).toISOString(), ticket_number: 0, people_ahead: 0, wait_minutes: 0, turn_started_at: null };
      requests.set(requestId, b.id);
      steppedAt.set(b.id, now);
      return save(b);
    }

    if (page.summary.opens_at !== null) throw rule("salon_closed", "Salon closed");
    const active = [...bookings.keys()].map(current).find((x) => x.start_at === null && isActive(x));
    if (active) throw rule("already_in_queue", "Already in a queue", { booking_id: active.id });
    if (named && !named.queue) throw rule("barber_unavailable", "Barber unavailable");
    const before = catalog.join(salonId);
    const load = named?.queue ?? before;
    const b: RawBooking = {
      ...base,
      // مفيش حد قدام: الدور بيبدأ على طول
      status: load.peopleAhead === 0 ? "yourTurn" : "waiting",
      start_at: null,
      ticket_number: load.peopleAhead + 1,
      people_ahead: load.peopleAhead,
      wait_minutes: load.waitMinutes,
      quoted_wait_minutes: load.waitMinutes,
      turn_started_at: load.peopleAhead === 0 ? new Date(now).toISOString() : null,
    };
    requests.set(requestId, b.id);
    steppedAt.set(b.id, now);
    return save(b);
  }

  /** زيارات سابقة عشان "السابقة" مايبقاش فاضي على تثبيت جديد (فريم 10) — زي _seedHistory في Flutter:
   *  واحدة مستنية تقييم، واحدة متقيّمة، وواحدة ما حضرش فيها */
  function seedHistory() {
    const now = clock();
    const past = (id: string, salonId: string, serviceIds: string[], status: "completed" | "missed", agoMs: number, barberName: string | null, rating: number | null) => {
      const page = details.page(salonId);
      const services = page.serviceGroups.flatMap((g) => g.services).filter((s) => serviceIds.includes(s.id));
      const at = new Date(now - agoMs).toISOString();
      // زي Flutter: دخل قبلها بـ ٢٥ دقيقة والتطبيق قال ٢٠
      const joined = new Date(now - agoMs - 25 * 60_000).toISOString();
      bookings.set(id, {
        id,
        salon_id: salonId,
        salon_name: page.summary.name,
        salon_area: page.summary.area_name,
        lat: page.latitude,
        lng: page.longitude,
        services: services.map((s) => ({ id: s.id, name: s.name, duration: s.durationMinutes, price: s.price })),
        status,
        subtotal: services.reduce((sum, s) => sum + s.price, 0),
        discounts: [],
        created_at: joined,
        start_at: null,
        barber_id: barberName ? `${salonId}-b1` : null,
        barber_name: barberName,
        ticket_number: 4,
        people_ahead: 0,
        wait_minutes: 0,
        turn_started_at: null,
        postpone_used: false,
        rating,
        quoted_wait_minutes: 20,
        served_at: status === "completed" ? at : null,
      });
      steppedAt.set(id, now);
    };
    const DAY = 86_400_000;
    past("bk-past-1", "s1", ["s1-haircut", "s1-beard"], "completed", 6 * DAY + 2 * 3_600_000, "أحمد مجدي", null);
    past("bk-past-2", "s3", ["s3-haircut"], "completed", 18 * DAY + 3 * 3_600_000, "محمود السيد", 5);
    past("bk-past-3", "s4", ["s4-beard"], "missed", 29 * DAY + 5 * 3_600_000, null, null);
  }
  seedHistory();

  return {
    schedule,
    mine: () => [...bookings.keys()].map(current),
    confirm,
    get: current,
    checkIn(id: string): RawBooking {
      const b = requireActive(id);
      if (b.status !== "yourTurn") throw rule("not_your_turn", "Not your turn");
      serviceSteps.set(id, 0);
      return save({ ...b, status: "inService", turn_started_at: null, served_at: new Date(clock()).toISOString() });
    },
    postpone(id: string): RawBooking {
      const b = requireActive(id);
      if (b.status !== "yourTurn") throw rule("not_your_turn", "Not your turn");
      if (b.postpone_used) throw rule("postpone_used", "Postpone used");
      return save(postponed(b));
    },
    /** فريم 31: بعد ما الخدمة تخلص بس، ومرة واحدة */
    rate(id: string, body: Record<string, unknown>): RawBooking {
      const b = current(id);
      if (b.status !== "completed") throw rule("not_completed", "Visit not completed");
      if (b.rating !== null) throw rule("already_rated", "Already rated");
      const overall = Number(body.overall);
      if (!Number.isInteger(overall) || overall < 1 || overall > 5) throw new MockHttpError(422, "validation", "overall must be 1..5");
      return save({ ...b, rating: overall });
    },
    leave(id: string): RawBooking {
      const b = requireActive(id);
      if (b.status === "inService") throw rule("finished", "Booking finished");
      // الميعاد بيتفتح لغيره؛ الطابور بيقل واحد
      if (b.status === "upcoming") holds.splice(0, holds.length, ...holds.filter((h) => h.bookingId !== id));
      else catalog.leave(b.salon_id);
      return save({ ...b, status: "cancelled" });
    },
  };
}

/** محتاجة تسجيل دخول */
const authed = (handler: (req: MockRequest) => unknown) => (req: MockRequest) => {
  if (!req.token) throw new MockHttpError(401, "auth.unauthenticated", "Unauthenticated.");
  return handler(req);
};

const store = createBookings();

export const bookingRoutes = [
  route("GET", "/salons/:salonId/slots", (req) => store.schedule(req.params.salonId, req.query.day, Number(req.query.minutes))),
  route("POST", "/bookings", authed((req) => store.confirm(req.body))),
  route("GET", "/me/bookings", authed(() => store.mine())),
  route("GET", "/bookings/:bookingId", authed((req) => store.get(req.params.bookingId))),
  route("POST", "/bookings/:bookingId/check-in", authed((req) => store.checkIn(req.params.bookingId))),
  route("POST", "/bookings/:bookingId/postpone", authed((req) => store.postpone(req.params.bookingId))),
  route("POST", "/bookings/:bookingId/rating", authed((req) => store.rate(req.params.bookingId, req.body))),
  route("POST", "/bookings/:bookingId/leave", authed((req) => store.leave(req.params.bookingId))),
];
