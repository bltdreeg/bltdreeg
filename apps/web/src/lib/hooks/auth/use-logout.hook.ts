// تسجيل الخروج — بيمسح كل الكاش عشان مفيش بيانات مستخدم سابق تفضل
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/lib/actions/auth/auth.action";
import { QK_USER } from "@/lib/data/constants/query-keys.constants";

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.clear();
      queryClient.setQueryData(QK_USER, null);
    },
  });
}
