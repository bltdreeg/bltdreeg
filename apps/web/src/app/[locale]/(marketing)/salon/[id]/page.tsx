import { METADATA_SALON } from "@/lib/data/constants/metadata.constants";
import { SalonView } from "./__components/salon-view";

// البيانات بتتجاب من المتصفح (Component → hook → action → Laravel)، فالـ metadata عامة لحد ما يبقى فيه SSR للصفحة
export const metadata = METADATA_SALON;

export default async function SalonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SalonView id={id} />;
}
