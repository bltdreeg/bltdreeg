// المستخدم الحالي (GET /me) — الدخول بيملا نفس الكاش، وبعد تشغيل جديد بيتجاب من السيرفر
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/actions/auth/auth.action";
import { QK_USER } from "@/lib/data/constants/query-keys.constants";
import { useSession } from "@/lib/hooks/use-session.hook";

export function useCurrentUser() {
  const { hasSession } = useSession();
  return useQuery({ queryKey: QK_USER, queryFn: () => getMe(), enabled: hasSession, staleTime: 5 * 60_000 });
}
