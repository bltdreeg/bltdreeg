"use client";

// حجوزاتي (FRAME 10): الحالية (الطابور الحي + مواعيد الدخول الجاية) والسابقة — من /reservations
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { PageContainer } from "@/components/atoms/page-container";
import { ProfileBreadcrumb } from "@/components/molecules/profile-breadcrumb";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useReservations } from "@/lib/hooks/reservations";
import type { ReservationScope } from "@/lib/types/reservation";
import { cn } from "@/lib/utils/cn.utils";
import { PastEmpty } from "../../__sections/past/past-empty";
import { UpcomingEmpty } from "../../__sections/upcoming/upcoming-empty";
import { BookingsSkeleton } from "../bookings-skeleton";
import { ReservationCard } from "../reservation-card";

export function BookingsView() {
  const t = useTranslations("app.bookings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scope: ReservationScope = searchParams.get("tab") === "past" ? "past" : "active";
  const reservations = useReservations(scope);

  const setScope = (next: ReservationScope) => {
    router.replace(next === "past" ? `${pathname}?tab=past` : pathname, { scroll: false });
  };

  const items = reservations.data?.items ?? [];

  return (
    <div className="flex flex-col">
      <ProfileBreadcrumb items={[{ label: t("title") }]} />

      <PageContainer className="flex max-w-3xl flex-col gap-5 py-6 sm:py-8">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-[28px]">{t("title")}</h1>

        <div role="tablist" aria-label={t("title")} className="flex gap-1 rounded-xl bg-muted p-1">
          {(["active", "past"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={scope === tab}
              onClick={() => setScope(tab)}
              className={cn(
                "h-10 flex-1 rounded-[10px] text-sm font-bold transition-colors cursor-pointer",
                scope === tab ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab === "active" ? t("tabs.upcoming") : t("tabs.past")}
            </button>
          ))}
        </div>

        {reservations.isPending ? (
          <BookingsSkeleton />
        ) : reservations.isError ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-[15px] font-bold">{t("loadError")}</p>
            <Button type="button" onClick={() => void reservations.refetch()} className="h-10 rounded-xl px-6 font-bold">
              {t("retry")}
            </Button>
          </div>
        ) : items.length === 0 ? (
          scope === "active" ? <UpcomingEmpty /> : <PastEmpty />
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((reservation) => (
              <li key={reservation.id}>
                <ReservationCard reservation={reservation} />
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </div>
  );
}
