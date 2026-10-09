// تعديل بياناتي (فريم 36): الحفظ بيحدّث كاش المستخدم، والمسح بيقفل الجلسة ويمسح الكاش كله زي تسجيل الخروج
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMe, updateMe } from "@/lib/actions/auth/auth.action";
import { QK_USER } from "@/lib/data/constants/query-keys.constants";
import type { UpdateProfileDto } from "@/lib/types/auth";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => updateMe(dto),
    onSuccess: (user) => queryClient.setQueryData(QK_USER, user),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteMe(),
    onSuccess: () => {
      queryClient.clear();
      queryClient.setQueryData(QK_USER, null);
    },
  });
}
