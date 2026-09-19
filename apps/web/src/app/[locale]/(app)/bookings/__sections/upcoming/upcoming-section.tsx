// قسم الحجوزات القادمة — مطابقة للفريم ٠٩ في mobile.html
"use client";

import { Bell } from "lucide-react";
import type { Booking } from "@/lib/types/booking";
import { UpcomingCard } from "./upcoming-card";
import { UpcomingEmpty } from "./upcoming-empty";

interface UpcomingSectionProps {
  bookings: Booking[];
  onCancel: (booking: Booking) => void;
}

export function UpcomingSection({ bookings, onCancel }: UpcomingSectionProps) {
  if (bookings.length === 0) {
    return <UpcomingEmpty />;
  }

  return (
    <div className="flex flex-col gap-4">
      {bookings.map((booking) => (
        <UpcomingCard
          key={booking.id}
          booking={booking}
          onCancel={onCancel}
        />
      ))}

      {/* شريط الإشعار الإرشادي التلقائي كما في الفريم ٠٩ */}
      <div className="flex items-center gap-3 rounded-2xl bg-tint p-4 text-[13px] font-semibold leading-relaxed text-primary-pressed">
        <Bell className="size-4.5 shrink-0 text-primary" />
        <p>هنبعتلك إشعار لما يفضل قدامك اتنين، وبعدين واحد، وبعدين لما يجي دورك.</p>
      </div>
    </div>
  );
}
