// التقييم — اتبعت — placeholder لحد ما الشاشة تتبني
import { ScreenPlaceholder } from "@/components/molecules/screen-placeholder";

export default function RatingSentScreen() {
  return (
    <ScreenPlaceholder
      title="التقييم — اتبعت"
      frames="41"
      links={[
        { label: "الرئيسية", href: "/home" },
      ]}
    />
  );
}
