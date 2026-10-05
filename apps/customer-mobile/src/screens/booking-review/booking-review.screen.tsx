// مسار الحجز ٢ — راجع الحجز — placeholder لحد ما الشاشة تتبني
import { ScreenPlaceholder } from "@/components/molecules/screen-placeholder";

export default function BookingReviewScreen() {
  return (
    <ScreenPlaceholder
      title="مسار الحجز ٢ — راجع الحجز"
      frames="25"
      links={[
        { label: "أكّد الحجز", href: "/booking/1/confirmed" },
      ]}
    />
  );
}
