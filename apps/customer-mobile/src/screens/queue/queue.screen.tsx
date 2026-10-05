// متابعة الدور — placeholder لحد ما الشاشة تتبني
import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/molecules/screen-placeholder";

export default function QueueScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  return (
    <ScreenPlaceholder
      title="متابعة الدور"
      frames="27–30"
      links={[
        { label: "قيّم الزيارة", href: `/booking/${bookingId}/rate` },
      ]}
    />
  );
}
