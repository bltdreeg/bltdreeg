// تعديل الملف الشخصي — الاستجابة بتحدّث كاش المستخدم
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMe } from "@/lib/actions/user/user.action";
import { QK_USER } from "@/lib/data/constants/query-keys.constants";
import type { UpdateProfileDto } from "@/lib/types/auth";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => updateMe(dto),
    onSuccess: (user) => queryClient.setQueryData(QK_USER, user),
  });
}
