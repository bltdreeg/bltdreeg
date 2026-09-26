import { Calendar } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { salonDetailsById } from "@/lib/data/salon-details.constants";
import { barbersByShop } from "@/lib/data/barbers.constants";
import { ROUTE_BOOK_SLOT, ROUTE_SALON } from "@/lib/data/constants/routes.constants";
import { METADATA_BOOK } from "@/lib/data/constants/metadata.constants";
import { formatDayLabel, formatTime } from "@/lib/utils/format/date.utils";
import { formatPrice } from "@/lib/utils/format/price.utils";
import { BookingShell } from "../__components/booking-shell";
import { BookingSummaryPanel } from "../__components/booking-summary-panel";
import { StepBarber } from "../__sections/step-barber";
import { resolveSelectedServices, type BookingSearchParams } from "../__lib/booking-params.utils";

export const metadata = METADATA_BOOK;

export default async function BookingBarberPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; salonId: string }>;
  searchParams: Promise<BookingSearchParams>;
}) {
  const { locale, salonId } = await params;
  const query = await searchParams;

  const t = await getTranslations("app.book.barber");
  const tSummary = await getTranslations("app.book.summary");

  const salon = salonDetailsById(salonId);
  if (!salon) return redirect({ href: ROUTE_SALON(salonId), locale });

  const services = resolveSelectedServices(salonId, query);
  if (services.length === 0 || !query.when) {
    return redirect({ href: ROUTE_BOOK_SLOT(salonId), locale });
  }

  const barbers = barbersByShop(salonId);
  const p = new URLSearchParams();
  for (const s of services) p.append("service", s.id);
  p.set("when", query.when);

  const totalPrice = services.reduce((n, s) => n + s.price, 0);
  const serviceCountText = tSummary("servicesCount", { count: services.length });
  const serviceSummary = `${serviceCountText} · ${formatPrice(totalPrice)}`;
  const slotSummary =
    query.when === "now" ? tSummary("now") : `${formatDayLabel(query.when)} · ${formatTime(query.when)}`;

  return (
    <BookingShell
      salonId={salonId}
      salonName={salon.name}
      step={3}
      title={t("title")}
      subtitle={t("subtitle")}
      serviceSummary={serviceSummary}
      slotSummary={slotSummary}
      panel={
        <BookingSummaryPanel salon={salon} services={services} cta={null}>
          <div className="flex items-center justify-between border-b border-border px-4.5 py-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span className="text-[13.5px] font-semibold text-muted-foreground">{tSummary("time")}</span>
            </div>
            <span className="text-sm font-bold text-foreground">
              {query.when === "now" ? tSummary("now") : `${formatDayLabel(query.when)} · ${formatTime(query.when)}`}
            </span>
          </div>
        </BookingSummaryPanel>
      }
    >
      <StepBarber salonId={salonId} barbers={barbers} queryString={p.toString()} />
    </BookingShell>
  );
}
