"use client";

// خطاف حالة المستخدم: الجلسة = توكن في كوكي، وgetMe بيجيب المستخدم من Laravel (null = مش مسجل).
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useSyncExternalStore } from "react";
import { usePathname } from "@/i18n/navigation";
import { getMe } from "@/lib/actions/user/user.action";
import { GUEST_COOKIE } from "@/lib/data/constants/app.constants";
import { QK_USER } from "@/lib/data/constants/query-keys.constants";
import type { Customer } from "@/lib/types/auth";

export interface UseUserReturn {
  user: Customer | null;
  isAuthenticated: boolean;
  /** اختار "تصفح كزائر" — تفضيل متذكر، مش صلاحية؛ المسارات المحمية لسه بتحوّله لتسجيل الدخول */
  isGuest: boolean;
  isLoading: boolean;
  refresh: () => void;
}

function hasCookie(name: string): boolean {
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${name}=`));
}

// الكوكي بتتغير من برا React، والتنقل بيعيد الريندر فالقراءة بتتحدث معاه
const subscribeNoop = () => () => {};

export function useUser(): UseUserReturn {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: QK_USER, queryFn: getMe, retry: false, staleTime: 60_000 });
  // الهيدر بيفضل مركّب بين الصفحات، فبنعيد قراءة كوكي "زائر" مع كل تنقل
  usePathname();
  const isGuest = useSyncExternalStore(subscribeNoop, () => hasCookie(GUEST_COOKIE), () => false);

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: QK_USER });
  }, [queryClient]);

  const user = query.data ?? null;
  return { user, isAuthenticated: user !== null, isGuest, isLoading: query.isLoading, refresh };
}
