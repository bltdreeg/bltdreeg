// إعادة إرسال كود تأكيد البريد
import { useMutation } from "@tanstack/react-query";
import { resendEmailCode } from "@/lib/actions/user/user.action";

export function useResendEmailCode() {
  return useMutation({ mutationFn: () => resendEmailCode() });
}
