// طلب كود دخول بالموبايل
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendLoginOtp } from "@/lib/actions/auth/auth.action";
import type { OtpLoginDto } from "@/lib/types/auth";
import { rememberOtpChallenge } from "./use-otp-challenge.hook";

export function useSendLoginOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: OtpLoginDto) => sendLoginOtp(dto),
    onSuccess: (challenge) => rememberOtpChallenge(queryClient, challenge),
  });
}
