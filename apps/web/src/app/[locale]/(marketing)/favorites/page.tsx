// الصالونات المفضلة — FRAME 12B
import { METADATA_FAVORITES } from "@/lib/data/constants/metadata.constants";
import { FavoritesGrid } from "./__components/favorites-grid";

export const metadata = METADATA_FAVORITES;

export default function FavoritesPage() {
  return <FavoritesGrid />;
}
