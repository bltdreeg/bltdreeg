// إنشاء حساب — بيرجّع تحدي OTP، ومفيش حساب بيتعمل قبل تأكيد الكود
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { register } from "@/lib/actions/auth/auth.action";
import type { RegisterDto } from "@/lib/types/auth";
import { rememberOtpChallenge } from "./use-otp-challenge.hook";

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RegisterDto) => register(dto),
    onSuccess: (challenge) => rememberOtpChallenge(queryClient, challenge),
  });
}
