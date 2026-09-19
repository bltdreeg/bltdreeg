// مفيش اتصال بالنت — شاشة كاملة (Frame 18)
import { METADATA_OFFLINE } from "@/lib/data/constants/metadata.constants";
import { OfflinePage } from "@/components/molecules/offline-page";

export const metadata = METADATA_OFFLINE;

export default function OfflineRoutePage() {
  return (
    <main className="flex min-h-[calc(100vh-140px)] items-center justify-center py-10">
      <OfflinePage />
    </main>
  );
}

