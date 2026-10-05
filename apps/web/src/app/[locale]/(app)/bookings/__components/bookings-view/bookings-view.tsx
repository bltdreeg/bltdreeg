// عرض حجوزاتي الرئيسي — FRAME 10A و 10B و 10C
"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/atoms/page-container";
import { AppointmentStrip } from "@/components/molecules/appointment-strip";
import { BookingStatus, type Booking } from "@/lib/types/booking";
import { cn } from "@/lib/utils/cn.utils";
import { formatTime, isToday } from "@/lib/utils/format/date.utils";
import {
  ROUTE_BOOKINGS,
  ROUTE_BOOKING_RATE,
} from "@/lib/data/constants/routes.constants";
import { CancelBookingDialog } from "../cancel-booking-dialog";
import { RebookDialog } from "../rebook-dialog";
import { ProfileBreadcrumb } from "@/components/molecules/profile-breadcrumb";
import { UpcomingSection } from "../../__sections/upcoming";
import { PastSection } from "../../__sections/past";

interface BookingsViewProps {
  initialBookings: Booking[];
}

export function BookingsView({ initialBookings }: BookingsViewProps) {
  const t = useTranslations("app.bookings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">(
    currentTabParam === "past" ? "past" : "upcoming"
  );

  const [bookingsList, setBookingsList] = useState<Booking[]>(initialBookings);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [rebookTarget, setRebookTarget] = useState<Booking | null>(null);

  // تصنيف الحجوزات: قادمة وسابقة وحجز اليوم
  const upcomingBookings = useMemo(
    () =>
      bookingsList.filter(
        (b) =>
          b.status !== BookingStatus.DONE && b.status !== BookingStatus.CANCELLED
      ),
    [bookingsList]
  );

  const pastBookings = useMemo(
    () =>
      bookingsList.filter(
        (b) =>
          b.status === BookingStatus.DONE || b.status === BookingStatus.CANCELLED
      ),
    [bookingsList]
  );

  const todayBooking = useMemo(
    () =>
      upcomingBookings.find((b) => isToday(b.startAt)) ?? null,
    [upcomingBookings]
  );


  const handleTabChange = (tab: "upcoming" | "past") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "past") {
      params.set("tab", "past");
    } else {
      params.delete("tab");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const handleBookingCancelled = () => {
    if (!cancelTarget) return;
    setBookingsList((prev) =>
      prev.map((b) =>
        b.id === cancelTarget.id
          ? { ...b, status: BookingStatus.CANCELLED }
          : b
      )
    );
    setCancelTarget(null);
  };

  return (
    <div className="flex flex-col">
      {/* شريط الميعاد الثابت يوم الحجز في حال وجود حجز اليوم (Header Strip) */}
      {todayBooking && (
        <AppointmentStrip
          time={formatTime(todayBooking.startAt)}
          queueNumber={todayBooking.queueNumber}
          statusText={t("onSchedule")}
          bookingId={todayBooking.id}
        />
      )}

      {/* شريط المسار (Breadcrumb) لصفحات الحساب — أسفل الهيدر مباشرة كما في /favorites */}
      <ProfileBreadcrumb items={[{ label: t("title") }]} />

      <PageContainer className="flex flex-col gap-6 py-8 md:py-9">
        {/* عنوان الصفحة والتبويبات */}
        <div className="flex flex-col gap-5">
          <h1 className="text-[26px] font-extrabold text-foreground md:text-[28px]">
            {t("title")}
          </h1>

          {/* شريط التبويبات — العرض الكامل كما في mobile.html */}
          <div className="flex w-full gap-1 rounded-xl bg-muted p-1" role="tablist">
            {/* تبويب الحجوزات الحالية */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "upcoming"}
              onClick={() => handleTabChange("upcoming")}
              className={cn(
                "flex h-10 flex-1 items-center justify-center rounded-[9px] font-bold text-sm transition-all cursor-pointer select-none",
                activeTab === "upcoming"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("tabs.upcoming")}
            </button>

            {/* تبويب الحجوزات السابقة */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "past"}
              onClick={() => handleTabChange("past")}
              className={cn(
                "flex h-10 flex-1 items-center justify-center rounded-[9px] font-bold text-sm transition-all cursor-pointer select-none",
                activeTab === "past"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("tabs.past")}
            </button>
          </div>
        </div>

        {/* محتوى القسم الفعّال */}
        {activeTab === "upcoming" ? (
          <UpcomingSection
            bookings={upcomingBookings}
            onCancel={(b) => setCancelTarget(b)}
          />
        ) : (
          <PastSection
            bookings={pastBookings}
            onRebook={(b) => setRebookTarget(b)}
            onRate={(b) => router.push(ROUTE_BOOKING_RATE(b.id))}
          />
        )}
      </PageContainer>

      {/* حوار إلغاء الحجز */}
      <CancelBookingDialog
        bookingId={cancelTarget?.id ?? ""}
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        onCancelled={handleBookingCancelled}
      />

      {/* حوار إعادة الحجز */}
      <RebookDialog
        booking={rebookTarget}
        open={Boolean(rebookTarget)}
        onOpenChange={(open) => !open && setRebookTarget(null)}
      />
    </div>
  );
}
