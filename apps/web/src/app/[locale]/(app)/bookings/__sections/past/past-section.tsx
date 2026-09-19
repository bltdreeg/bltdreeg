// قسم الحجوزات السابقة — FRAME 10B
"use client";

import type { Booking } from "@/lib/types/booking";
import { PastCard } from "./past-card";
import { PastEmpty } from "./past-empty";

interface PastSectionProps {
  bookings: Booking[];
  onRebook: (booking: Booking) => void;
  onRate?: (booking: Booking) => void;
}

export function PastSection({
  bookings,
  onRebook,
  onRate,
}: PastSectionProps) {
  if (bookings.length === 0) {
    return <PastEmpty />;
  }

  return (
    <div className="flex flex-col gap-3.5">
      {bookings.map((booking) => (
        <PastCard
          key={booking.id}
          booking={booking}
          onRebook={onRebook}
          onRate={onRate}
        />
      ))}
    </div>
  );
}

