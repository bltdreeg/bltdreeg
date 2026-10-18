// تغيير/إضافة كلمة السر — مفيش تغيير في كاش المستخدم غير hasPassword
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePassword } from "@/lib/actions/user/user.action";
import { QK_USER } from "@/lib/data/constants/query-keys.constants";
import type { Customer, UpdatePasswordDto } from "@/lib/types/auth";

export function useUpdatePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePasswordDto) => updatePassword(dto),
    onSuccess: () =>
      queryClient.setQueryData<Customer | null>(QK_USER, (user) => (user ? { ...user, hasPassword: true } : user)),
  });
}
