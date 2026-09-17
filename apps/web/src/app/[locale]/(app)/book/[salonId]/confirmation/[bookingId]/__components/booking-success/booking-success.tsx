// تأكيد الحجز: ميعادك + رقمك في الدور
import { QueuePositionBlock } from "@/components/molecules/queue-position-block";
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOKING_DETAILS, ROUTE_HOME } from "@/lib/data/constants/routes.constants";
import type { Booking } from "@/lib/types/booking";
import { formatDate } from "@/lib/utils/format/date.utils";

export function BookingSuccess({ booking }: { booking: Booking }) {
  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">تم تأكيد حجزك</h1>
        <p className="mt-1 text-muted-foreground">
          {booking.shopName} · {booking.barberName} · {formatDate(booking.startAt)}
        </p>
      </div>
      <QueuePositionBlock startAt={booking.startAt} status={{ queueNumber: booking.queueNumber, peopleAhead: booking.queueNumber - 1 }} />
      <p className="text-sm text-muted-foreground">
        {booking.serviceNames.join(" + ")} · {booking.durationMinutes} دقيقة · {booking.totalPrice} ج.م
      </p>
      <div className="flex flex-col gap-2">
        <Link href={ROUTE_BOOKING_DETAILS(booking.id)} className="rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground">
          متابعة الحجز
        </Link>
        <Link href={ROUTE_HOME} className="rounded-lg px-4 py-3 text-sm text-muted-foreground">
          الرجوع للرئيسية
        </Link>
      </div>
    </section>
  );
}
