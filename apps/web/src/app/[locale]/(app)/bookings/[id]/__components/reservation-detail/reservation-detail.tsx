"use client";

// تفاصيل الحجز ومتابعة الدور (FRAME 11): في الطابور = قدامك كام والانتظار المتوقع (بيتحدث كل 15 ثانية)،
// ميعاد دخول = إمتى هتدخل الطابور، وبعد كده ملخص اللي حصل. الإشعارات والخريطة الحية لسه مش موجودين
import { Clock, Navigation, Phone, RefreshCw, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { PageContainer } from "@/components/atoms/page-container";
import { ProfileBreadcrumb } from "@/components/molecules/profile-breadcrumb";
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOKINGS, ROUTE_SALON } from "@/lib/data/constants/routes.constants";
import { useReservation } from "@/lib/hooks/reservations";
import type { Reservation } from "@/lib/types/reservation";
import { branchDirectionsUrl } from "@/lib/utils/branches/branch-links";
import { cn } from "@/lib/utils/cn.utils";
import { formatPrice } from "@/lib/utils/format/price.utils";
import { isCancellable } from "@/lib/utils/reservations/reservation-mapper";
import { formatInstantClock } from "@/lib/utils/reservations/slot-format";
import { CancelBookingDialog } from "../../../__components/cancel-booking-dialog";
import { useReservationLabels } from "../../../__lib/use-reservation-labels";
import { BookingDetailsSkeleton } from "../booking-details-skeleton";

export function ReservationDetail({ id }: { id: string }) {
  const t = useTranslations("app.reservations");
  const query = useReservation(id);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (query.isPending) return <BookingDetailsSkeleton />;

  if (query.isError) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 px-4 py-24 text-center">
        <p className="text-[15px] font-bold">{query.error.status === 404 ? t("notFound") : t("loadError")}</p>
        <Link href={ROUTE_BOOKINGS} className="font-bold text-primary underline">
          {t("backToList")}
        </Link>
      </div>
    );
  }

  const reservation = query.data;

  return (
    <div className="flex flex-col">
      <ProfileBreadcrumb items={[{ label: t("listTitle"), href: ROUTE_BOOKINGS }, { label: reservation.branch.salon.name }]} />

      <PageContainer className="flex max-w-3xl flex-col gap-5 py-6 sm:py-8">
        <Header reservation={reservation} />
        <StatusCard reservation={reservation} isRefreshing={query.isFetching} />
        <ServicesCard reservation={reservation} />
        <BranchCard reservation={reservation} />

        {isCancellable(reservation.status) && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelOpen(true)}
              className="h-12 rounded-xl border-destructive/30 text-[15px] font-bold text-destructive hover:bg-destructive/10"
            >
              {reservation.status === "queued" ? t("leaveQueue") : t("cancelSlot")}
            </Button>
            <CancelBookingDialog
              reservationId={reservation.id}
              status={reservation.status}
              open={cancelOpen}
              onOpenChange={setCancelOpen}
            />
          </>
        )}
      </PageContainer>
    </div>
  );
}

function Header({ reservation }: { reservation: Reservation }) {
  const t = useTranslations("app.reservations");
  const { statusLabel, statusTone } = useReservationLabels(reservation);

  return (
    <header className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-[26px]">{reservation.branch.salon.name}</h1>
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-[12px] font-bold",
            statusTone === "live" && "bg-success-bg text-success-strong",
            statusTone === "upcoming" && "bg-tint text-primary-pressed",
            statusTone === "done" && "bg-muted text-muted-foreground",
            statusTone === "cancelled" && "bg-destructive/10 text-destructive",
          )}
        >
          {statusLabel}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {reservation.branch.name}
        {reservation.barber && ` · ${t("withBarber", { name: reservation.barber.name })}`}
      </p>
    </header>
  );
}

function StatusCard({ reservation, isRefreshing }: { reservation: Reservation; isRefreshing: boolean }) {
  const t = useTranslations("app.reservations");
  const locale = useLocale();
  const { slotWhen } = useReservationLabels(reservation);
  const position = reservation.position;
  const barberName = reservation.barber?.name ?? t("theBarber");

  if (reservation.status === "queued" && position) {
    return (
      <section
        aria-live="polite"
        className={cn(
          "flex flex-col gap-4 rounded-[18px] border p-5 sm:p-6",
          position.isYourTurn ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
        )}
      >
        {position.isYourTurn ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-[26px] font-black">{t("yourTurn")}</span>
            <span className="text-sm opacity-90">{t("yourTurnDesc", { barber: barberName })}</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground">
                <Users aria-hidden className="size-3.5" />
                {t("aheadLabel")}
              </span>
              <span className="tabular text-[40px] font-black leading-none text-foreground">{position.peopleAhead}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground">
                <Clock aria-hidden className="size-3.5" />
                {t("waitLabel")}
              </span>
              <span className="tabular text-[40px] font-black leading-none text-foreground">
                {t("minutesShort", { count: position.expectedWaitMinutes })}
              </span>
            </div>
          </div>
        )}
        <p
          className={cn(
            "flex items-center gap-1.5 text-[12px]",
            position.isYourTurn ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          <RefreshCw aria-hidden className={cn("size-3", isRefreshing && "animate-spin")} />
          {t("liveHint")}
        </p>
      </section>
    );
  }

  if (reservation.status === "in_service") {
    return (
      <section className="rounded-[18px] border border-primary bg-tint p-5 sm:p-6">
        <p className="text-[20px] font-extrabold text-primary-pressed">{t("inService")}</p>
        {reservation.startedAt && (
          <p className="mt-1 text-sm text-muted-foreground">
            {t("startedAt", { time: formatInstantClock(reservation.startedAt, locale) })}
          </p>
        )}
      </section>
    );
  }

  if (reservation.status === "booked" && slotWhen) {
    return (
      <section className="flex flex-col gap-2 rounded-[18px] border border-border bg-card p-5 sm:p-6">
        <span className="text-[12.5px] font-semibold text-muted-foreground">{t("joinTimeLabel")}</span>
        <span className="text-[24px] font-black text-foreground">{slotWhen}</span>
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">{t("slotExplainer", { barber: barberName })}</p>
      </section>
    );
  }

  return (
    <section className="rounded-[18px] border border-border bg-muted/50 p-5 sm:p-6">
      <p className="text-[16px] font-bold text-foreground">{t(`finished.${reservation.status}`)}</p>
      {reservation.status === "served" && reservation.servedAt && (
        <p className="mt-1 text-sm text-muted-foreground">
          {t("servedAt", { time: formatInstantClock(reservation.servedAt, locale) })}
        </p>
      )}
    </section>
  );
}

function ServicesCard({ reservation }: { reservation: Reservation }) {
  const t = useTranslations("app.reservations");
  const locale = useLocale();

  return (
    <section className="rounded-[14px] border border-border bg-card p-5">
      <h2 className="mb-2 text-[14px] font-bold text-muted-foreground">{t("services")}</h2>
      <ul className="divide-y divide-border/80">
        {reservation.services.map((service, index) => (
          <li key={service.serviceId ?? index} className="flex items-center justify-between gap-3 py-2.5">
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-foreground">{service.name ?? t("removedService")}</span>
              <span className="text-[11.5px] text-muted-foreground">{t("minutesShort", { count: service.durationMinutes })}</span>
            </span>
            <span className="tabular shrink-0 text-sm font-bold">{formatPrice(service.price, locale)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
        <span className="font-bold text-muted-foreground">{t("total")}</span>
        <span className="tabular text-xl font-black text-foreground">{formatPrice(reservation.totalPrice, locale)}</span>
      </div>
    </section>
  );
}

function BranchCard({ reservation }: { reservation: Reservation }) {
  const t = useTranslations("app.reservations");
  const { branch } = reservation;

  return (
    <section className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-5">
      <div className="flex flex-col gap-0.5">
        <Link href={ROUTE_SALON(branch.id)} className="text-[15px] font-bold text-foreground hover:text-primary">
          {branch.salon.name} · {branch.name}
        </Link>
        {branch.address && <span className="text-[13px] text-muted-foreground">{branch.address}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={branchDirectionsUrl(branch)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-border bg-background px-4 text-[13px] font-bold text-foreground transition-colors hover:bg-muted"
        >
          <Navigation aria-hidden className="size-3.5 text-primary" />
          {t("directions")}
        </a>
        {branch.phone && (
          <a
            href={`tel:${branch.phone}`}
            dir="ltr"
            className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-border bg-background px-4 text-[13px] font-bold text-foreground transition-colors hover:bg-muted"
          >
            <Phone aria-hidden className="size-3.5 text-primary" />
            <span className="tabular">{branch.phone}</span>
          </a>
        )}
      </div>
    </section>
  );
}
