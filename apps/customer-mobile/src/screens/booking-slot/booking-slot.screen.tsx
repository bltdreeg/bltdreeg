// مسار الحجز — اختار الميعاد — placeholder لحد ما الشاشة تتبني
import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/molecules/screen-placeholder";

export default function BookingSlotScreen() {
  const { salonId } = useLocalSearchParams<{ salonId: string }>();
  return (
    <ScreenPlaceholder
      title="مسار الحجز — اختار الميعاد"
      frames="Flutter/web slot step"
      links={[
        { label: "التالي: اختار الحلاق", href: `/salon/${salonId}/book/barber` },
      ]}
    />
  );
}
