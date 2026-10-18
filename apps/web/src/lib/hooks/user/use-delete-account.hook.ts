// حذف الحساب نهائياً — زي تسجيل الخروج، بيمسح كل الكاش
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAccount } from "@/lib/actions/user/user.action";
import { QK_USER } from "@/lib/data/constants/query-keys.constants";

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteAccount(),
    onSuccess: () => {
      queryClient.clear();
      queryClient.setQueryData(QK_USER, null);
    },
  });
}
