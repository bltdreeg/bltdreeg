// صفحة الصالون — placeholder لحد ما الشاشة تتبني
import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/molecules/screen-placeholder";

export default function SalonScreen() {
  const { salonId } = useLocalSearchParams<{ salonId: string }>();
  return (
    <ScreenPlaceholder
      title="صفحة الصالون"
      frames="21–23"
      links={[
        { label: "معرض الصور", href: `/salon/${salonId}/gallery` },
        { label: "احجز ميعاد", href: `/salon/${salonId}/book/slot` },
      ]}
    />
  );
}
