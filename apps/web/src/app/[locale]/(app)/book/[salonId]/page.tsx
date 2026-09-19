// نقطة دخول مسار الحجز — بتوجّه لخطوة الميعاد أول حاجة
import { redirect } from "@/i18n/navigation";
import { ROUTE_BOOK_SLOT } from "@/lib/data/constants/routes.constants";
import type { BookingSearchParams } from "./__lib/booking-params.utils";

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; salonId: string }>;
  searchParams: Promise<BookingSearchParams>;
}) {
  const { locale, salonId } = await params;
  const query = await searchParams;

  const p = new URLSearchParams();
  const ids = query.service ? (Array.isArray(query.service) ? query.service : [query.service]) : [];
  for (const id of ids) p.append("service", id);

  const href = `${ROUTE_BOOK_SLOT(salonId)}${p.toString() ? `?${p.toString()}` : ""}`;
  redirect({ href, locale });
}
