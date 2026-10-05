// المفضلة — placeholder لحد ما الشاشة تتبني
import { ScreenPlaceholder } from "@/components/molecules/screen-placeholder";

export default function FavoritesScreen() {
  return (
    <ScreenPlaceholder
      title="المفضلة"
      frames="34–35"
      links={[
        { label: "صفحة الصالون", href: "/salon/1" },
      ]}
    />
  );
}
