"use client";

// تأكيد الموقع — بيكمّل خطوة الـ onboarding ويحدّث كاش المستخدم
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmLocation } from "@/lib/actions/user/user.action";
import { QK_USER } from "@/lib/data/constants/query-keys.constants";
import type { ConfirmLocationDto } from "@/lib/types/geo";

export function useConfirmLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ConfirmLocationDto) => confirmLocation(dto),
    onSuccess: (user) => queryClient.setQueryData(QK_USER, user),
  });
}
