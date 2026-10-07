// هل فيه نت دلوقتي (NetInfo أو قطع تجريبي) — للشريط العلوي وإخفاء أرقام الانتظار الحية (فريم 08)
import { useSyncExternalStore } from "react";
import { connectivity } from "@/lib/utils/connectivity";

export function useOnline(): boolean {
  return useSyncExternalStore(connectivity.subscribe, connectivity.isOnline);
}
