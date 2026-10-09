// الخدمات المختارة لكل صالون قبل الحجز — زي InMemoryBookingDraftRepository في Flutter. صفحة الصالون بتكتب، الحجز (batch 5) بيقرا.
import { useSyncExternalStore } from "react";
import type { SalonService } from "@/lib/types/salon";

export type DraftService = Pick<SalonService, "id" | "name" | "durationMinutes" | "price">;

const EMPTY: DraftService[] = [];
let drafts: Record<string, DraftService[]> = {};
const listeners = new Set<() => void>();

export const bookingDraft = {
  get: (salonId: string): DraftService[] => drafts[salonId] ?? EMPTY,

  toggle(salonId: string, service: DraftService): void {
    const current = drafts[salonId] ?? EMPTY;
    const next = current.some((s) => s.id === service.id) ? current.filter((s) => s.id !== service.id) : [...current, service];
    drafts = { ...drafts, [salonId]: next };
    listeners.forEach((l) => l());
  },

  /** "احجز تاني بنفس الاختيارات" (فريم 10) */
  set(salonId: string, services: DraftService[]): void {
    drafts = { ...drafts, [salonId]: services };
    listeners.forEach((l) => l());
  },

  clear(salonId: string): void {
    const { [salonId]: _, ...rest } = drafts;
    drafts = rest;
    listeners.forEach((l) => l());
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useBookingDraft(salonId: string): DraftService[] {
  return useSyncExternalStore(bookingDraft.subscribe, () => bookingDraft.get(salonId));
}
