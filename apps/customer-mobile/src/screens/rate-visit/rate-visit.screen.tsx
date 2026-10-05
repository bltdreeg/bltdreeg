// تقييم الخدمة — placeholder لحد ما الشاشة تتبني
import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/molecules/screen-placeholder";

export default function RateVisitScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  return (
    <ScreenPlaceholder
      title="تقييم الخدمة"
      frames="31"
      links={[
        { label: "ابعت التقييم", href: `/booking/${bookingId}/rate/sent` },
      ]}
    />
  );
}
