// الحجز في الطابور الحي (feature 1) — /reservations في Laravel.
// الـ slot مش ميعاد خدمة: صاحبه بيدخل طابور الكرسي لما الوقت ييجي، ورا اللي في الطابور ساعتها.
import type { NamedRef } from "@/lib/types/geo";

export type ReservationType = "join_now" | "slot";

/** booked = slot لسه ميعاده مجاش · queued = مستني في الطابور · in_service = بيتخدم */
export type ReservationStatus = "booked" | "queued" | "in_service" | "served" | "cancelled" | "removed";

export interface ReservationPosition {
  peopleAhead: number;
  expectedWaitMinutes: number;
  isYourTurn: boolean;
  inService: boolean;
}

export interface ReservationService {
  serviceId: string | null;
  name: string | null;
  price: number;
  durationMinutes: number;
}

export interface BarberRef {
  id: string;
  name: string;
  photoUrl: string | null;
}

export interface Reservation {
  id: string;
  type: ReservationType;
  status: ReservationStatus;
  joinTime: string | null;
  slot: { id: string; startsAt: string } | null;
  branch: {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    mapsUrl: string | null;
    lat: number;
    lng: number;
    coverImageUrl: string | null;
    salon: NamedRef;
  };
  chairId: string;
  barber: BarberRef | null;
  services: ReservationService[];
  totalPrice: number;
  totalDurationMinutes: number;
  currency: string;
  /** null لو مش في الطابور الحي (slot لسه مجاش، أو الحجز خلص) */
  position: ReservationPosition | null;
  createdAt: string | null;
  cancelAt: string | null;
  startedAt: string | null;
  servedAt: string | null;
}

export type ReservationScope = "active" | "past";

export interface CreateReservationDto {
  type: ReservationType;
  chairId?: string;
  slotId?: string;
  serviceIds: string[];
}

/** كرسي في خطوة "اختار الحلاق" بطابوره دلوقتي */
export interface BranchBarber {
  chairId: string;
  barber: BarberRef;
  canJoinNow: boolean;
  queue: { peopleInQueue: number; expectedWaitMinutes: number };
}

export interface BranchBarbers {
  branch: { id: string; name: string; isOpen: boolean };
  barbers: BranchBarber[];
}

/** ميعاد دخول متاح على كرسي */
export interface ChairSlot {
  id: string;
  startsAt: string;
  /** YYYY-MM-DD بتوقيت مصر */
  day: string;
  /** HH:mm بتوقيت مصر */
  time: string;
  remaining: number;
}
