// إعادة إرسال الكود (ممكن مع تغيير القناة) — التحدي الجديد بيستبدل القديم في الكاش
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resendOtp } from "@/lib/actions/auth/auth.action";
import type { ResendOtpDto } from "@/lib/types/auth";
import { rememberOtpChallenge } from "./use-otp-challenge.hook";

export function useResendOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ResendOtpDto) => resendOtp(dto),
    onSuccess: (challenge) => rememberOtpChallenge(queryClient, challenge),
  });
}
