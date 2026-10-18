// تسجيل الخروج — بيمسح كل الكاش عشان مفيش بيانات مستخدم سابق تفضل.
// onSettled مش onSuccess: logout() بيمسح التوكن محلياً حتى لو الطلب فشل، فالكاش لازم يتمسح برضه
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/lib/actions/auth/auth.action";
import { QK_USER } from "@/lib/data/constants/query-keys.constants";

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      queryClient.clear();
      queryClient.setQueryData(QK_USER, null);
    },
  });
}
