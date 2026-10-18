// الحجز في الطابور الحي — /reservations و /branches/{id}/barbers|chairs/{id}/slots في Laravel
import { apiClient } from "@/lib/api";
import type { Paginated } from "@/lib/types/paginated.interface";
import type {
  BranchBarbers,
  ChairSlot,
  CreateReservationDto,
  Reservation,
  ReservationScope,
} from "@/lib/types/reservation";
import {
  mapBranchBarbers,
  mapChairSlots,
  mapReservation,
  mapReservationsPage,
  toCreateReservationBody,
  type RawBranchBarbers,
  type RawChairSlots,
  type RawReservation,
  type RawReservationsPage,
} from "@/lib/utils/reservations/reservation-mapper";

/** عام (من غير login): الحلاقين اللي شغالين النهارده وطابور كل واحد */
export async function getBranchBarbers(branchId: string): Promise<BranchBarbers> {
  return mapBranchBarbers(await apiClient.get<RawBranchBarbers>(`/branches/${encodeURIComponent(branchId)}/barbers`));
}

/** عام: مواعيد الدخول الجاية اللي فيها مكان على كرسي */
export async function getChairSlots(branchId: string, chairId: string): Promise<ChairSlot[]> {
  return mapChairSlots(
    await apiClient.get<RawChairSlots>(
      `/branches/${encodeURIComponent(branchId)}/chairs/${encodeURIComponent(chairId)}/slots`,
    ),
  );
}

export async function getReservations(scope: ReservationScope, page = 1): Promise<Paginated<Reservation>> {
  return mapReservationsPage(
    await apiClient.get<RawReservationsPage>("/reservations", { params: { scope, page } }),
  );
}

export async function getReservation(id: string): Promise<Reservation> {
  return mapReservation(await apiClient.get<RawReservation>(`/reservations/${encodeURIComponent(id)}`));
}

export async function createReservation(dto: CreateReservationDto): Promise<Reservation> {
  return mapReservation(await apiClient.post<RawReservation>("/reservations", toCreateReservationBody(dto)));
}

export async function cancelReservation(id: string): Promise<Reservation> {
  return mapReservation(await apiClient.post<RawReservation>(`/reservations/${encodeURIComponent(id)}/cancel`));
}
