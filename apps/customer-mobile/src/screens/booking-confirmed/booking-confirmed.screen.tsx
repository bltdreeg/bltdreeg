// مسار الحجز ٣ — دخلت الطابور — placeholder لحد ما الشاشة تتبني
import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/molecules/screen-placeholder";

export default function BookingConfirmedScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  return (
    <ScreenPlaceholder
      title="مسار الحجز ٣ — دخلت الطابور"
      frames="26"
      links={[
        { label: "تابع دورك", href: `/queue/${bookingId}` },
      ]}
    />
  );
}
