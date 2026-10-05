// طلب كود استعادة كلمة السر
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/lib/actions/auth/auth.action";
import type { ForgotPasswordDto } from "@/lib/types/auth";

export function useForgotPassword() {
  return useMutation({ mutationFn: (dto: ForgotPasswordDto) => forgotPassword(dto) });
}
