// خطوة الحجز 3/3: راجع الحجز
import { redirect } from "@/i18n/navigation";
import { salonDetailsById } from "@/lib/data/salon-details.constants";
import { ROUTE_BOOK_BARBER, ROUTE_BOOK_SLOT, ROUTE_SALON } from "@/lib/data/constants/routes.constants";
import { METADATA_BOOK } from "@/lib/data/constants/metadata.constants";
import { createBooking } from "@/lib/actions/bookings/bookings.action";
import { formatDayLabel, formatTime } from "@/lib/utils/format/date.utils";
import { BookingShell } from "../__components/booking-shell";
import { BookingSummaryPanel } from "../__components/booking-summary-panel";
import { BookingReview } from "../__components/booking-review";
import {
  resolveSelectedBarber,
  resolveSelectedServices,
  type BookingSearchParams,
} from "../__lib/booking-params.utils";

export const metadata = METADATA_BOOK;

export default async function BookingReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; salonId: string }>;
  searchParams: Promise<BookingSearchParams>;
}) {
  const { locale, salonId } = await params;
  const query = await searchParams;

  const salon = salonDetailsById(salonId);
  if (!salon) return redirect({ href: ROUTE_SALON(salonId), locale });

  const services = resolveSelectedServices(salonId, query);
  if (services.length === 0) return redirect({ href: ROUTE_BOOK_SLOT(salonId), locale });
  if (!query.when) return redirect({ href: ROUTE_BOOK_SLOT(salonId), locale });
  if (!query.barber) return redirect({ href: ROUTE_BOOK_BARBER(salonId), locale });

  const barber = resolveSelectedBarber(salonId, query);
  const startAt = query.when === "now" ? new Date().toISOString() : query.when;

  const p = new URLSearchParams();
  for (const s of services) p.append("service", s.id);
  p.set("when", query.when);

  const totalPrice = services.reduce((n, s) => n + s.price, 0);
  const serviceCountText =
    services.length === 1 ? "خدمة واحدة" : services.length === 2 ? "خدمتين" : `${services.length} خدمات`;
  const serviceSummary = `${serviceCountText} · ${totalPrice} ج.م`;
  const slotSummary =
    query.when === "now" ? "دلوقتي" : `${formatDayLabel(query.when)} · ${formatTime(query.when)}`;
  const barberSummary = barber?.name ?? "أي حلاق متاح";

  async function submit(formData: FormData) {
    "use server";
    formData.set("shopId", salonId);
    formData.set("barberId", barber?.id ?? "any");
    for (const s of services) formData.append("serviceId", s.id);
    formData.set("startAt", startAt);
    await createBooking(formData, locale);
  }

  return (
    <BookingShell
      salonId={salonId}
      salonName={salon.name}
      step={4}
      title="راجع الحجز قبل ما تأكّد"
      serviceSummary={serviceSummary}
      slotSummary={slotSummary}
      barberSummary={barberSummary}
      panel={
        <BookingSummaryPanel salon={salon} services={services} cta={null}>
          <div className="flex items-center justify-between border-b border-border px-4.5 py-3">
            <span className="text-[13.5px] font-semibold text-muted-foreground">المعاد</span>
            <span className="text-sm font-bold text-foreground">
              {query.when === "now" ? "دلوقتي" : `${formatDayLabel(query.when)} · ${formatTime(query.when)}`}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border px-4.5 py-3">
            <span className="text-[13.5px] font-semibold text-muted-foreground">الحلاق</span>
            <span className="text-sm font-bold text-foreground">
              {barber?.name ?? "أي حلاق متاح"}
            </span>
          </div>
        </BookingSummaryPanel>
      }
    >
      <BookingReview
        salon={salon}
        services={services}
        barber={barber}
        when={query.when}
        queryString={p.toString()}
        submit={submit}
      />
    </BookingShell>
  );
}
