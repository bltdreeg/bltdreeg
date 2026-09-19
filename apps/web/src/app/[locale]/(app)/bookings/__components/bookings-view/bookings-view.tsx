// عرض حجوزاتي الرئيسي — FRAME 10A و 10B و 10C
"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import { PageContainer } from "@/components/atoms/page-container";
import { AppointmentStrip } from "@/components/molecules/appointment-strip";
import { BookingStatus, type Booking } from "@/lib/types/booking";
import { cn } from "@/lib/utils/cn.utils";
import { formatTime, isToday } from "@/lib/utils/format/date.utils";
import { CancelBookingDialog } from "../cancel-booking-dialog";
import { RebookDialog } from "../rebook-dialog";
import { UpcomingSection } from "../../__sections/upcoming";
import { PastSection } from "../../__sections/past";

interface BookingsViewProps {
  initialBookings: Booking[];
}

export function BookingsView({ initialBookings }: BookingsViewProps) {
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
      {/* شريط الميعاد الثابت يوم الحجز في حال وجود حجز اليوم */}
      {todayBooking && (
        <AppointmentStrip
          time={formatTime(todayBooking.startAt)}
          queueNumber={todayBooking.queueNumber}
          statusText="الصالون في ميعاده"
          bookingId={todayBooking.id}
        />
      )}

      <PageContainer className="flex flex-col gap-6 py-8 md:py-9">
        {/* عنوان الصفحة والتبويبات */}
        <div className="flex flex-col gap-5">
          <h1 className="text-[26px] font-extrabold text-foreground md:text-[28px]">
            حجوزاتي
          </h1>

          {/* شريط التبويبات */}
          <div className="flex gap-2 border-b border-border">
            {/* تبويب الحجوزات القادمة */}
            <button
              type="button"
              onClick={() => handleTabChange("upcoming")}
              className={cn(
                "relative flex items-center gap-2 pb-3.5 pe-3 ps-1 font-bold text-[15px] transition-colors cursor-pointer",
                activeTab === "upcoming"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>الحجوزات القادمة</span>
              {upcomingBookings.length > 0 && (
                <span className="tabular text-xs font-bold text-muted-foreground">
                  {upcomingBookings.length}
                </span>
              )}
            </button>

            {/* تبويب الحجوزات السابقة */}
            <button
              type="button"
              onClick={() => handleTabChange("past")}
              className={cn(
                "relative flex items-center gap-2 pb-3.5 px-4 font-bold text-[15px] transition-colors cursor-pointer",
                activeTab === "past"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>حجوزات سابقة</span>
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
