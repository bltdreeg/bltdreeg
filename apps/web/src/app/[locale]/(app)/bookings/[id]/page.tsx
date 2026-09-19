// تفاصيل الحجز ومتابعة الدور — يدعم FRAME 11A و FRAME 11B و FRAME 11C
import { notFound } from "next/navigation";
import { getBookingById, getQueueStatus } from "@/lib/actions/bookings/bookings.action";
import { barbersByShop } from "@/lib/data/barbers.constants";
import { METADATA_BOOKING_DETAILS } from "@/lib/data/constants/metadata.constants";
import { salonDetailsById } from "@/lib/data/salon-details.constants";
import { servicesByShop } from "@/lib/data/services.constants";
import { BookingStatus, type Booking } from "@/lib/types/booking";
import { isToday } from "@/lib/utils/format/date.utils";
import { buildQueueStatus } from "@/lib/utils/queue.utils";
import { BookingDetailView } from "./__components/booking-detail-view";
import { LiveTrackingView } from "./__components/live-tracking-view";
import { YourTurnState } from "./__components/your-turn-state";

export const metadata = METADATA_BOOKING_DETAILS;

interface BookingDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BookingDetailPage({
  params,
  searchParams,
}: BookingDetailPageProps) {
  const { id } = await params;
  const search = (await searchParams) || {};
  const viewOverride = typeof search.view === "string" ? search.view.toLowerCase() : null;

  let booking = await getBookingById(id);

  // Fallback demo booking for direct frame reviews (e.g. /bookings/11a, /bookings/11b, /bookings/11c)
  if (!booking) {
    if (id === "11a" || id === "11b" || id === "11c" || id.startsWith("bk-")) {
      const isTodayMock = id === "11b" || id === "11c" || id.includes("today");
      const targetDate = new Date();
      if (!isTodayMock) {
        targetDate.setDate(targetDate.getDate() + 2);
      }
      targetDate.setHours(18, 30, 0, 0);

      booking = {
        id,
        shopId: "shop-2",
        shopName: isTodayMock ? "بربر لاونج المعادي" : "صالون الكابتن حسام",
        barberId: "barber-3",
        barberName: isTodayMock ? "كريم مصطفى" : "محمود عبد العال",
        serviceIds: ["svc-2-1", "svc-2-4"],
        serviceNames: ["قص شعر بالمقص", "تحديد دقن"],
        durationMinutes: 50,
        totalPrice: 180,
        startAt: targetDate.toISOString(),
        queueNumber: 3,
        status: BookingStatus.CONFIRMED,
        bookingCode: "8C2-406",
      };
    } else {
      notFound();
    }
  }

  // Load associated salon, barbers, and services
  const salonRaw = salonDetailsById(booking.shopId);
  const salon = salonRaw
    ? {
        ...salonRaw,
        name: booking.shopName || salonRaw.name,
      }
    : null;

  const shopBarbers = barbersByShop(booking.shopId);
  const barber =
    shopBarbers.find((b) => b.id === booking.barberId) ||
    shopBarbers.find((b) => b.name === booking.barberName) ||
    null;

  const allShopServices = servicesByShop(booking.shopId);
  let services = allShopServices.filter((s) => booking.serviceIds.includes(s.id));

  if (services.length === 0 && booking.serviceNames && booking.serviceNames.length > 0) {
    services = booking.serviceNames.map((name, idx) => ({
      id: `svc-${idx}`,
      shopId: booking.shopId,
      name,
      durationMinutes: idx === 0 ? 30 : 20,
      price: idx === 0 ? 120 : 60,
      category: "قص وتصفيف",
    }));
  }

  // Live queue status calculation
  let queueStatus = await getQueueStatus(booking.id);
  if (!queueStatus) {
    queueStatus = buildQueueStatus(booking, { completedCount: 1, delayMinutes: 0 });
  }

  // 1. FRAME 11C: دورك دلوقتي — الحالة المقلوبة (Turn is active)
  if (viewOverride === "11c" || (!viewOverride && (id === "11c" || queueStatus.isYourTurn))) {
    return (
      <YourTurnState
        booking={booking}
        salon={salon}
        barber={barber}
      />
    );
  }

  // 2. FRAME 11B: تفاصيل الحجز — يوم الميعاد، الحالة الحيّة (Today / Live Tracking)
  if (viewOverride === "11b" || (!viewOverride && (id === "11b" || isToday(booking.startAt)))) {
    return (
      <LiveTrackingView
        booking={booking}
        salon={salon}
        barber={barber}
        services={services}
        queueStatus={queueStatus}
      />
    );
  }

  // 3. FRAME 11A: تفاصيل الحجز — قبل يوم الميعاد (Pre-appointment day)
  return (
    <BookingDetailView
      booking={booking}
      salon={salon}
      barber={barber}
      services={services}
    />
  );
}
