// إرسال كود تأكيد للرقم الجديد (أول خطوة في تغيير الموبايل)
import { useMutation } from "@tanstack/react-query";
import { sendPhoneChangeOtp } from "@/lib/actions/user/user.action";
import type { SendPhoneChangeOtpDto } from "@/lib/types/auth";

export function useSendPhoneChangeOtp() {
  return useMutation({
    mutationFn: (dto: SendPhoneChangeOtpDto) => sendPhoneChangeOtp(dto),
  });
}
