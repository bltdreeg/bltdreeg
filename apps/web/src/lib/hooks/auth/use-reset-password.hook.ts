// تعيين كلمة سر جديدة — بيفتح جلسة جديدة
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resetPassword } from "@/lib/actions/auth/auth.action";
import { QK_USER } from "@/lib/data/constants/query-keys.constants";
import type { ResetPasswordDto } from "@/lib/types/auth";

export function useResetPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ResetPasswordDto) => resetPassword(dto),
    onSuccess: (session) => queryClient.setQueryData(QK_USER, session.user),
  });
}
