// تأكيد الرقم الجديد — بيفتح جلسة جديدة وبيكتب المستخدم في الكاش
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyPhoneChange } from "@/lib/actions/user/user.action";
import { QK_USER } from "@/lib/data/constants/query-keys.constants";
import type { VerifyPhoneChangeDto } from "@/lib/types/auth";

export function useVerifyPhoneChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: VerifyPhoneChangeDto) => verifyPhoneChange(dto),
    onSuccess: (user) => queryClient.setQueryData(QK_USER, user),
  });
}
