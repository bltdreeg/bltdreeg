// تسجيل الدخول بكلمة السر — بعد النجاح الجلسة بتتحط في كاش المستخدم
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "@/lib/actions/auth/auth.action";
import { QK_USER } from "@/lib/data/constants/query-keys.constants";
import type { LoginDto } from "@/lib/types/auth";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: LoginDto) => login(dto),
    onSuccess: (session) => queryClient.setQueryData(QK_USER, session.user),
  });
}
