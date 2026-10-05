// دخول بحساب اجتماعي: الـ ID token بيروح للسيرفر مباشرة ويتبدّل بجلسة
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { socialLogin } from "@/lib/actions/auth/auth.action";
import { QK_USER } from "@/lib/data/constants/query-keys.constants";
import type { SocialLoginDto } from "@/lib/types/auth";

export function useSocialLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provider, ...dto }: SocialLoginDto & { provider: "google" | "apple" }) => socialLogin(provider, dto),
    onSuccess: (session) => queryClient.setQueryData(QK_USER, session.user),
  });
}
