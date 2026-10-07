// طلب كود استعادة كلمة السر — التحدي بيتحفظ عشان شاشة الكود تقراه
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { forgotPassword } from "@/lib/actions/auth/auth.action";
import type { ForgotPasswordDto } from "@/lib/types/auth";
import { rememberOtpChallenge } from "./use-otp-challenge.hook";

export function useForgotPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ForgotPasswordDto) => forgotPassword(dto),
    onSuccess: (challenge) => rememberOtpChallenge(queryClient, challenge),
  });
}
