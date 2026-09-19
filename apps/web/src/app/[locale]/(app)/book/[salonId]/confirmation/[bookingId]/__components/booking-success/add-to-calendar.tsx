"use client";

import { useState } from "react";
import { Calendar, Check, Download, ExternalLink } from "lucide-react";
import type { Booking } from "@/lib/types/booking";

interface AddToCalendarProps {
  booking: Booking;
}

export function AddToCalendar({ booking }: AddToCalendarProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const startDate = new Date(booking.startAt);
  const endDate = new Date(startDate.getTime() + (booking.durationMinutes || 45) * 60 * 1000);

  const formatIcsDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const title = `ميعاد حلاقة - ${booking.shopName}`;
  const description = `حجز في ${booking.shopName}\nالخدمات: ${booking.serviceNames.join(" + ")}\nالحلاق: ${booking.barberName}\nرقمك في الدور: ${booking.queueNumber}\nكود الحجز: ${booking.bookingCode || booking.id}`;
  const location = booking.shopName;

  const downloadIcs = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Beltadreeg//Booking//AR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:bk-${booking.id}-${Date.now()}@beltadreeg.com`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
      `LOCATION:${location}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `beltadreeg-${booking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const openGoogleCalendar = () => {
    const formatGoogleDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const gUrl = new URL("https://calendar.google.com/calendar/render");
    gUrl.searchParams.set("action", "TEMPLATE");
    gUrl.searchParams.set("text", title);
    gUrl.searchParams.set("dates", `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`);
    gUrl.searchParams.set("details", description);
    gUrl.searchParams.set("location", location);
    window.open(gUrl.toString(), "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div className="relative w-full sm:flex-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-12 min-h-[48px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#0F766E] px-4 font-bold text-[15px] text-white transition hover:bg-[#0B5A54] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/40"
      >
        <Calendar className="size-4.5" />
        <span className="whitespace-nowrap">أضف للتقويم</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-[calc(100%+8px)] right-0 z-50 w-full min-w-[220px] rounded-xl border border-border bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={openGoogleCalendar}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-right text-sm font-semibold text-[#0E0F11] hover:bg-[#F0FAF8] hover:text-[#0B5A54]"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="size-4 text-muted-foreground" />
                تقويم Google
              </span>
            </button>
            <button
              type="button"
              onClick={downloadIcs}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-right text-sm font-semibold text-[#0E0F11] hover:bg-[#F0FAF8] hover:text-[#0B5A54]"
            >
              <span className="flex items-center gap-2">
                <Download className="size-4 text-muted-foreground" />
                تحميل لـ Apple / Outlook (.ics)
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
