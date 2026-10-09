// تأكيد كود الـ OTP (تسجيل جديد أو دخول بالكود) — بيفتح الجلسة
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyOtp } from "@/lib/actions/auth/auth.action";
import { QK_USER } from "@/lib/data/constants/query-keys.constants";
import type { VerifyOtpDto } from "@/lib/types/auth";

export function useVerifyOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: VerifyOtpDto) => verifyOtp(dto),
    onSuccess: (session) => queryClient.setQueryData(QK_USER, session.user),
  });
}
