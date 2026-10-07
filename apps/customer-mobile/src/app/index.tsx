// "/" — أول مرة على الأونبوردنج، بعد كده على الرئيسية (الرئيسية محمية بـ onboardingSeen، فالتحويل الأعمى ليها بيعلّق على شاشة فاضية)
import { Redirect } from "expo-router";
import { useSyncExternalStore } from "react";
import { appPreferences } from "@/lib/utils/app-preferences";

export default function Index() {
  const onboardingSeen = useSyncExternalStore(appPreferences.subscribe, appPreferences.onboardingSeen);
  return <Redirect href={onboardingSeen ? "/home" : "/onboarding"} />;
}
