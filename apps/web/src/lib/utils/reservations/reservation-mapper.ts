// تحويل ردود الحجز من Laravel (snake_case) لأنواع الواجهة
import type {
  BranchBarbers,
  ChairSlot,
  CreateReservationDto,
  Reservation,
  ReservationStatus,
  ReservationType,
} from "../../types/reservation/index.ts";
import type { Paginated } from "../../types/paginated.interface.ts";

type Id = number | string;
type RawRef = { id: Id; name: string };

export interface RawReservation {
  id: Id;
  type: ReservationType;
  status: ReservationStatus;
  join_time: string | null;
  slot: { id: Id; starts_at: string } | null;
  branch: {
    id: Id;
    name: string;
    address: string | null;
    phone: string | null;
    maps_url: string | null;
    lat: number;
    lng: number;
    cover_image_url: string | null;
    salon: RawRef;
  };
  chair_id: Id;
  barber: { id: Id; name: string; photo_url: string | null } | null;
  services: Array<{ service_id: Id | null; name: string | null; price: number; duration_minutes: number }>;
  total_price: number;
  total_duration_minutes: number;
  currency: string;
  position: { people_ahead: number; expected_wait_minutes: number; is_your_turn: boolean; in_service: boolean } | null;
  created_at: string | null;
  cancel_at: string | null;
  started_at: string | null;
  served_at: string | null;
}

export interface RawReservationsPage {
  data: RawReservation[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface RawBranchBarbers {
  branch: { id: Id; name: string; is_open: boolean };
  data: Array<{
    chair_id: Id;
    barber: { id: Id; name: string; photo_url: string | null };
    can_join_now: boolean;
    queue: { people_in_queue: number; expected_wait_minutes: number };
  }>;
}

export interface RawChairSlots {
  data: Array<{ id: Id; starts_at: string; day: string; time: string; remaining: number }>;
}

const str = (id: Id) => String(id);

export function mapReservation(raw: RawReservation): Reservation {
  return {
    id: str(raw.id),
    type: raw.type,
    status: raw.status,
    joinTime: raw.join_time,
    slot: raw.slot ? { id: str(raw.slot.id), startsAt: raw.slot.starts_at } : null,
    branch: {
      id: str(raw.branch.id),
      name: raw.branch.name,
      address: raw.branch.address,
      phone: raw.branch.phone,
      mapsUrl: raw.branch.maps_url,
      lat: raw.branch.lat,
      lng: raw.branch.lng,
      coverImageUrl: raw.branch.cover_image_url,
      salon: { id: str(raw.branch.salon.id), name: raw.branch.salon.name },
    },
    chairId: str(raw.chair_id),
    barber: raw.barber ? { id: str(raw.barber.id), name: raw.barber.name, photoUrl: raw.barber.photo_url } : null,
    services: raw.services.map((service) => ({
      serviceId: service.service_id === null ? null : str(service.service_id),
      name: service.name,
      price: service.price,
      durationMinutes: service.duration_minutes,
    })),
    totalPrice: raw.total_price,
    totalDurationMinutes: raw.total_duration_minutes,
    currency: raw.currency,
    position: raw.position
      ? {
          peopleAhead: raw.position.people_ahead,
          expectedWaitMinutes: raw.position.expected_wait_minutes,
          isYourTurn: raw.position.is_your_turn,
          inService: raw.position.in_service,
        }
      : null,
    createdAt: raw.created_at,
    cancelAt: raw.cancel_at,
    startedAt: raw.started_at,
    servedAt: raw.served_at,
  };
}

export function mapReservationsPage(raw: RawReservationsPage): Paginated<Reservation> {
  return {
    items: raw.data.map(mapReservation),
    page: raw.meta.current_page,
    lastPage: raw.meta.last_page,
    perPage: raw.meta.per_page,
    total: raw.meta.total,
  };
}

export function mapBranchBarbers(raw: RawBranchBarbers): BranchBarbers {
  return {
    branch: { id: str(raw.branch.id), name: raw.branch.name, isOpen: raw.branch.is_open },
    barbers: raw.data.map((row) => ({
      chairId: str(row.chair_id),
      barber: { id: str(row.barber.id), name: row.barber.name, photoUrl: row.barber.photo_url },
      canJoinNow: row.can_join_now,
      queue: { peopleInQueue: row.queue.people_in_queue, expectedWaitMinutes: row.queue.expected_wait_minutes },
    })),
  };
}

export function mapChairSlots(raw: RawChairSlots): ChairSlot[] {
  return raw.data.map((slot) => ({
    id: str(slot.id),
    startsAt: slot.starts_at,
    day: slot.day,
    time: slot.time,
    remaining: slot.remaining,
  }));
}

/** طلب POST /reservations — الأرقام بتتبعت أرقام زي ما Laravel متوقع */
export function toCreateReservationBody(dto: CreateReservationDto): Record<string, unknown> {
  return {
    type: dto.type,
    ...(dto.type === "join_now" ? { chair_id: Number(dto.chairId) } : { slot_id: Number(dto.slotId) }),
    service_ids: dto.serviceIds.map(Number),
  };
}

/** حجز لسه شغال (يتعرض في "القادمة" ويتعمله polling) */
export function isActiveReservation(status: ReservationStatus): boolean {
  return status === "booked" || status === "queued" || status === "in_service";
}

/** ممكن يتلغي — قبل ما الخدمة تبدأ */
export function isCancellable(status: ReservationStatus): boolean {
  return status === "booked" || status === "queued";
}

/** تجميع الـ slots بالأيام بترتيبها — لخطوة "اختار الميعاد" */
export function groupSlotsByDay(slots: ChairSlot[]): Array<{ day: string; slots: ChairSlot[] }> {
  const groups = new Map<string, ChairSlot[]>();
  for (const slot of slots) groups.set(slot.day, [...(groups.get(slot.day) ?? []), slot]);
  return [...groups.entries()].map(([day, daySlots]) => ({ day, slots: daySlots }));
}
