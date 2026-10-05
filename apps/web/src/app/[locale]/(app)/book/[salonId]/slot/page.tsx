import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { salonDetailsById } from "@/lib/data/salon-details.constants";
import { ROUTE_SALON } from "@/lib/data/constants/routes.constants";
import { METADATA_BOOK } from "@/lib/data/constants/metadata.constants";
import { formatPrice } from "@/lib/utils/format/price.utils";
import { BookingShell } from "../__components/booking-shell";
import { BookingSummaryPanel } from "../__components/booking-summary-panel";
import { StepSlot } from "../__sections/step-slot";
import { resolveSelectedBarber, resolveSelectedServices, type BookingSearchParams } from "../__lib/booking-params.utils";

export const metadata = METADATA_BOOK;

export default async function BookingSlotPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; salonId: string }>;
  searchParams: Promise<BookingSearchParams>;
}) {
  const { locale, salonId } = await params;
  const query = await searchParams;

  const t = await getTranslations("app.book.slot");
  const tSummary = await getTranslations("app.book.summary");

  const salon = salonDetailsById(salonId);
  if (!salon) return redirect({ href: ROUTE_SALON(salonId), locale });

  const services = resolveSelectedServices(salonId, query);
  if (services.length === 0) return redirect({ href: ROUTE_SALON(salonId), locale });

  const totalMinutes = services.reduce((n, s) => n + s.durationMinutes, 0);
  const totalPrice = services.reduce((n, s) => n + s.price, 0);
  const queryString = new URLSearchParams(
    services.map((s) => ["service", s.id] as [string, string]),
  ).toString();

  const serviceCountText = tSummary("servicesCount", { count: services.length });
  const serviceSummary = `${serviceCountText} · ${formatPrice(totalPrice)}`;

  const barber = resolveSelectedBarber(salonId, query);
  const barberSummary = barber?.name ?? "كريم مصطفى";

  return (
    <BookingShell
      salonId={salonId}
      salonName={salon.name}
      step={2}
      title={t("title")}
      subtitle={t("subtitle", { minutes: totalMinutes })}
      serviceSummary={serviceSummary}
      panel={<BookingSummaryPanel salon={salon} services={services} cta={null} />}
    >
      <StepSlot
        salon={salon}
        totalMinutes={totalMinutes}
        queryString={queryString}
        barberName={barberSummary}
      />
    </BookingShell>
  );
}
