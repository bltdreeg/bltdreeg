// خطوة الحجز 1/3: امتى تحب تيجي؟
import { redirect } from "@/i18n/navigation";
import { salonDetailsById } from "@/lib/data/salon-details.constants";
import { ROUTE_SALON } from "@/lib/data/constants/routes.constants";
import { METADATA_BOOK } from "@/lib/data/constants/metadata.constants";
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

  const salon = salonDetailsById(salonId);
  if (!salon) return redirect({ href: ROUTE_SALON(salonId), locale });

  const services = resolveSelectedServices(salonId, query);
  if (services.length === 0) return redirect({ href: ROUTE_SALON(salonId), locale });

  const totalMinutes = services.reduce((n, s) => n + s.durationMinutes, 0);
  const totalPrice = services.reduce((n, s) => n + s.price, 0);
  const queryString = new URLSearchParams(
    services.map((s) => ["service", s.id] as [string, string]),
  ).toString();

  const serviceCountText =
    services.length === 1 ? "خدمة واحدة" : services.length === 2 ? "خدمتين" : `${services.length} خدمات`;
  const serviceSummary = `${serviceCountText} · ${totalPrice} ج.م`;

  const barber = resolveSelectedBarber(salonId, query);
  const barberSummary = barber?.name ?? "كريم مصطفى";

  return (
    <BookingShell
      salonId={salonId}
      salonName={salon.name}
      step={2}
      title="اختار الميعاد"
      subtitle={`المواعيد المعروضة بتكفي مدة خدمتك (${totalMinutes} دقيقة).`}
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
