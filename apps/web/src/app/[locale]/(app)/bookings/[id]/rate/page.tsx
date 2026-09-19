// صفحة تقييم زيارة الحجز — FRAME 31 في تصميم الموبايل
import { notFound } from "next/navigation";
import { getBookingById } from "@/lib/actions/bookings/bookings.action";
import { salonDetailsById } from "@/lib/data/salon-details.constants";
import { METADATA_BOOKING_RATE } from "@/lib/data/constants/metadata.constants";
import { PageContainer } from "@/components/atoms/page-container";
import { ProfileBreadcrumb } from "@/components/molecules/profile-breadcrumb";
import { RateForm } from "./__components/rate-form";

export const metadata = METADATA_BOOKING_RATE;

interface RateBookingPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function RateBookingPage({ params }: RateBookingPageProps) {
  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) {
    notFound();
  }

  const salon = salonDetailsById(booking.shopId) ?? null;

  return (
    <div className="flex flex-col min-h-full">
      <ProfileBreadcrumb
        items={[
          { label: "حجوزاتي", href: "/bookings" },
          { label: "تفاصيل الحجز", href: `/bookings/${booking.id}` },
          { label: "تقييم الزيارة" },
        ]}
      />

      <PageContainer className="py-6 sm:py-8 max-w-4xl">
        <RateForm booking={booking} salon={salon} />
      </PageContainer>
    </div>
  );
}

