// صفحة الصالون — تصميم ناعم ومرتفع مستوحى من UX-Pilot مع الحفاظ على كل البيانات
import { notFound } from "next/navigation";
import { barbersByShop } from "@/lib/data/barbers.constants";
import { salonDetailsById } from "@/lib/data/salon-details.constants";
import { reviewsByShop } from "@/lib/data/reviews.constants";
import { servicesByShop } from "@/lib/data/services.constants";
import { offersByShop } from "@/lib/data/offers.constants";
import { SalonGallery } from "./__components/salon-gallery";
import { SalonBooking } from "./__components/salon-booking";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const salon = salonDetailsById(id);
  if (!salon) return {};
  return {
    title: `${salon.name} | بلتدريج`,
    description: `اعرف خدمات ${salon.name} ومواعيده المتاحة واحجز أونلاين`,
  };
}

export default async function SalonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const salon = salonDetailsById(id);
  if (!salon) notFound();

  const services = servicesByShop(id, salon.priceFrom);
  const barbers = barbersByShop(id);
  const offers = offersByShop(id);
  const reviews = reviewsByShop(id);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="w-full max-w-[1440px] mx-auto px-0 lg:px-12 py-0 lg:py-6">
        {/* معرض الصور العلوي */}
        <SalonGallery photos={salon.photos} name={salon.name} salonId={salon.id} />

        {/* جسم الصفحة المقسم لعمودين مع الجزيرة التفاعلية */}
        <SalonBooking
          salon={salon}
          services={services}
          barbers={barbers}
          offers={offers}
          reviews={reviews}
        />
      </div>
    </div>
  );
}
