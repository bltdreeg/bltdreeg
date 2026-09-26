import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { salonDetailsById } from "@/lib/data/salon-details.constants";
import { ROUTE_BOOK_BARBER, ROUTE_BOOK_SLOT, ROUTE_SALON } from "@/lib/data/constants/routes.constants";
import { METADATA_BOOK } from "@/lib/data/constants/metadata.constants";
import { createBooking } from "@/lib/actions/bookings/bookings.action";
import { formatDayLabel, formatTime } from "@/lib/utils/format/date.utils";
import { formatPrice } from "@/lib/utils/format/price.utils";
import { BookingShell } from "../__components/booking-shell";
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

  const t = await getTranslations("app.book.review");
  const tSummary = await getTranslations("app.book.summary");
  const tBarber = await getTranslations("app.book.barber");

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
  const serviceCountText = tSummary("servicesCount", { count: services.length });
  const serviceSummary = `${serviceCountText} · ${formatPrice(totalPrice)}`;
  const slotSummary =
    query.when === "now" ? tSummary("now") : `${formatDayLabel(query.when)} · ${formatTime(query.when)}`;
  const barberSummary = barber?.name ?? tBarber("anyBarber");

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
      title={t("title")}
      serviceSummary={serviceSummary}
      slotSummary={slotSummary}
      barberSummary={barberSummary}
      panel={null}
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
