"use client";

// كارت حجز في "حجوزاتي": الصالون والحلاق + حالة الحجز (قدامك كام / ميعاد الدخول / خلص)
import { ChevronLeft, Scissors } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOKING_DETAILS } from "@/lib/data/constants/routes.constants";
import type { Reservation } from "@/lib/types/reservation";
import { cn } from "@/lib/utils/cn.utils";
import { formatPrice } from "@/lib/utils/format/price.utils";
import { useReservationLabels } from "../../__lib/use-reservation-labels";

export function ReservationCard({ reservation }: { reservation: Reservation }) {
  const t = useTranslations("app.reservations");
  const locale = useLocale();
  const { statusLabel, statusTone, headline } = useReservationLabels(reservation);

  return (
    <Link
      href={ROUTE_BOOKING_DETAILS(reservation.id)}
      className="flex items-center gap-3.5 rounded-[14px] border border-border bg-card p-4 transition-colors hover:border-primary/50"
    >
      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
        {reservation.branch.coverImageUrl ? (
          <Image src={reservation.branch.coverImageUrl} alt={reservation.branch.salon.name} fill sizes="56px" className="object-cover" />
        ) : (
          <Scissors aria-hidden className="absolute inset-0 m-auto size-5 text-muted-foreground" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[15px] font-bold text-foreground">{reservation.branch.salon.name}</span>
          <span
            className={cn(
              "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold",
              statusTone === "live" && "bg-success-bg text-success-strong",
              statusTone === "upcoming" && "bg-tint text-primary-pressed",
              statusTone === "done" && "bg-muted text-muted-foreground",
              statusTone === "cancelled" && "bg-destructive/10 text-destructive",
            )}
          >
            {statusLabel}
          </span>
        </div>
        <span className="truncate text-[12.5px] text-muted-foreground">
          {reservation.branch.name}
          {reservation.barber && ` · ${t("withBarber", { name: reservation.barber.name })}`}
        </span>
        <span className="tabular text-[13px] font-bold text-foreground">
          {headline}
          <span className="font-normal text-muted-foreground"> · {formatPrice(reservation.totalPrice, locale)}</span>
        </span>
      </div>

      <ChevronLeft aria-hidden className="size-4 shrink-0 text-muted-foreground ltr:rotate-180" />
    </Link>
  );
}
