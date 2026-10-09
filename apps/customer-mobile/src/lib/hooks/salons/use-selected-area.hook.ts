// المنطقة المختارة (محفوظة على الجهاز) — الرئيسية والبحث بيعرضوا صالوناتها
import { useSyncExternalStore } from "react";
import { appPreferences } from "@/lib/utils/app-preferences";

export function useSelectedArea(): string {
  return useSyncExternalStore(appPreferences.subscribe, appPreferences.selectedAreaId);
}
