// خيارات المصادقة المتاحة (قنوات الكود + الدخول الاجتماعي) — بتتغير من لوحة الأدمن فبنقراها من السيرفر
import { useQuery } from "@tanstack/react-query";
import { getAuthOptions } from "@/lib/actions/auth/auth.action";
import { QK_AUTH_OPTIONS } from "@/lib/data/constants/query-keys.constants";

export function useAuthOptions() {
  return useQuery({
    queryKey: QK_AUTH_OPTIONS,
    queryFn: () => getAuthOptions(),
    staleTime: 5 * 60_000,
  });
}
