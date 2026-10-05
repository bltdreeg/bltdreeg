// معرض صور الصالون — placeholder لحد ما الشاشة تتبني
import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/molecules/screen-placeholder";

export default function SalonGalleryScreen() {
  const { salonId } = useLocalSearchParams<{ salonId: string }>();
  return (
    <ScreenPlaceholder
      title="معرض صور الصالون"
      frames="39"
      links={[
        { label: "عرض صورة", href: `/salon/${salonId}/gallery/photo?index=0` },
      ]}
    />
  );
}
