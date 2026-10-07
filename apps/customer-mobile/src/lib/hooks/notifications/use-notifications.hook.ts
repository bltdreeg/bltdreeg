// الإشعارات + عدد غير المقروء (نقطة الجرس في الرئيسية) + علّم كمقروء بشكل متفائل
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationsRead } from "@/lib/actions/notifications/notifications.action";
import { QK_NOTIFICATIONS } from "@/lib/data/constants/query-keys.constants";
import { useSession } from "@/lib/hooks/use-session.hook";
import type { AppNotification } from "@/lib/types/notification";

export function useNotifications() {
  const { hasSession } = useSession();
  return useQuery({ queryKey: QK_NOTIFICATIONS, queryFn: () => getNotifications(), enabled: hasSession, staleTime: 30_000 });
}

export const useUnreadCount = () => useNotifications().data?.filter((n) => !n.isRead).length ?? 0;

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids?: string[]) => markNotificationsRead(ids),
    onMutate: (ids) => {
      queryClient.setQueryData<AppNotification[]>(QK_NOTIFICATIONS, (list) => list?.map((n) => (!ids || ids.includes(n.id) ? { ...n, isRead: true } : n)));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QK_NOTIFICATIONS }),
  });
}
