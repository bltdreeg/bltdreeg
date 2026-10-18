"use client";

// نصوص حالة الحجز المشتركة بين الكارت وصفحة التفاصيل
import { useLocale, useTranslations } from "next-intl";
import type { Reservation } from "@/lib/types/reservation";
import { formatInstantClock, instantCairoDay, slotDayLabel } from "@/lib/utils/reservations/slot-format";

export type ReservationTone = "live" | "upcoming" | "done" | "cancelled";

export function useReservationLabels(reservation: Reservation) {
  const t = useTranslations("app.reservations");
  const locale = useLocale();

  const slotWhen = (() => {
    if (!reservation.slot) return null;
    const label = slotDayLabel(instantCairoDay(reservation.slot.startsAt), locale);
    const day = label.kind === "date" ? label.label : t(label.kind);
    return `${day} · ${formatInstantClock(reservation.slot.startsAt, locale)}`;
  })();

  const position = reservation.position;

  const statusTone: ReservationTone =
    reservation.status === "queued" || reservation.status === "in_service"
      ? "live"
      : reservation.status === "booked"
        ? "upcoming"
        : reservation.status === "served"
          ? "done"
          : "cancelled";

  const statusLabel = t(`status.${reservation.status}`);

  const headline =
    reservation.status === "in_service"
      ? t("inService")
      : reservation.status === "queued" && position
        ? position.isYourTurn
          ? t("yourTurn")
          : t("peopleAhead", { count: position.peopleAhead })
        : reservation.status === "booked" && slotWhen
          ? t("joinsAt", { when: slotWhen })
          : slotWhen ?? statusLabel;

  return { statusLabel, statusTone, headline, slotWhen };
}
