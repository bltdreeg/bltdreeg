// مسار الحجز ١ — اختار الحلاق — placeholder لحد ما الشاشة تتبني
import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/molecules/screen-placeholder";

export default function BookingBarberScreen() {
  const { salonId } = useLocalSearchParams<{ salonId: string }>();
  return (
    <ScreenPlaceholder
      title="مسار الحجز ١ — اختار الحلاق"
      frames="24"
      links={[
        { label: "التالي: راجع الحجز", href: `/salon/${salonId}/book/review` },
      ]}
    />
  );
}
