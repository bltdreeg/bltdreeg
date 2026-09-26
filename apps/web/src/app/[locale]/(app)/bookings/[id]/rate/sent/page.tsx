import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getBookingById } from "@/lib/actions/bookings/bookings.action";
import { salonDetailsById } from "@/lib/data/salon-details.constants";
import { METADATA_BOOKING_RATE_SENT } from "@/lib/data/constants/metadata.constants";
import { PageContainer } from "@/components/atoms/page-container";
import { ProfileBreadcrumb } from "@/components/molecules/profile-breadcrumb";
import { RateSentView } from "./__components/rate-sent-view";

export const metadata = METADATA_BOOKING_RATE_SENT;

interface RateSentPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function RateSentPage({ params }: RateSentPageProps) {
  const { id } = await params;
  const t = await getTranslations("app.rate.breadcrumb");
  const booking = await getBookingById(id);

  if (!booking) {
    notFound();
  }

  const salon = salonDetailsById(booking.shopId) ?? null;

  return (
    <div className="flex flex-col min-h-full">
      <ProfileBreadcrumb
        items={[
          { label: t("bookings"), href: "/bookings" },
          { label: t("bookingDetails"), href: `/bookings/${booking.id}` },
          { label: t("rated") },
        ]}
      />

      <PageContainer className="py-6 sm:py-10">
        <RateSentView booking={booking} salon={salon} />
      </PageContainer>
    </div>
  );
}

