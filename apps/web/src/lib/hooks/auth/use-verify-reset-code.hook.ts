// تأكيد كود الاستعادة ← توكن إعادة تعيين لمرة واحدة
import { useMutation } from "@tanstack/react-query";
import { verifyResetCode } from "@/lib/actions/auth/auth.action";
import type { VerifyResetCodeDto } from "@/lib/types/auth";

export function useVerifyResetCode() {
  return useMutation({ mutationFn: (dto: VerifyResetCodeDto) => verifyResetCode(dto) });
}
