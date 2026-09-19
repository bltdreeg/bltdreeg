// قسم الحجوزات القادمة — FRAME 10A
"use client";

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
    </div>
  );
}

