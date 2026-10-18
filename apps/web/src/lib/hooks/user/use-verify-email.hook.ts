// تأكيد البريد بالكود — الاستجابة بتحدّث كاش المستخدم
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyEmail } from "@/lib/actions/user/user.action";
import { QK_USER } from "@/lib/data/constants/query-keys.constants";
import type { VerifyEmailDto } from "@/lib/types/auth";

export function useVerifyEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: VerifyEmailDto) => verifyEmail(dto),
    onSuccess: (user) => queryClient.setQueryData(QK_USER, user),
  });
}
