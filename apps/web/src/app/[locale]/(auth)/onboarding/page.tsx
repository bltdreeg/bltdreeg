"use client";

// خطوة الـ onboarding الوحيدة المبنية حالياً: تأكيد المحافظة/المدينة/المنطقة (باقي الخطوات في customer-registration task 16)
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { CALLBACK_PARAM } from "@/lib/data/constants/app.constants";
import { ROUTE_HOME } from "@/lib/data/constants/routes.constants";
import { useUser } from "@/lib/hooks/user";
import { safeCallback } from "@/lib/utils/auth/post-auth-redirect";
import { LocationStep } from "./__components/location-step";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const destination = safeCallback(useSearchParams().get(CALLBACK_PARAM)) ?? ROUTE_HOME;

  // اللي أكّد موقعه قبل كده مالوش لازمة هنا
  useEffect(() => {
    if (user?.location.confirmed) router.replace(destination);
  }, [user, destination, router]);

  return <LocationStep onDone={() => router.replace(destination)} />;
}
