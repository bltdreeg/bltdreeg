// المفضلة: الـ ids (لما فيه جلسة بس) + تبديل متفائل بيرجع لو السيرفر رفض
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFavoriteIds, setFavorite } from "@/lib/actions/favorites/favorites.action";
import { getSalonsByIds } from "@/lib/actions/salons/salons.action";
import { QK_FAVORITES } from "@/lib/data/constants/query-keys.constants";
import { useSession } from "@/lib/hooks/use-session.hook";

export function useFavoriteIds() {
  const { hasSession } = useSession();
  return useQuery({ queryKey: QK_FAVORITES, queryFn: () => getFavoriteIds(), enabled: hasSession, staleTime: 60_000 });
}

/** صالونات المفضلة بالطابور الحي (كل ١٥ ثانية زي الكتالوج) — الشيل بيخلّي الصف يختفي من غير ما القايمة تفضى */
export function useFavoriteSalons() {
  const ids = useFavoriteIds().data;
  return useQuery({
    queryKey: [...QK_FAVORITES, "salons", ids],
    queryFn: () => getSalonsByIds(ids!),
    enabled: !!ids?.length,
    refetchInterval: 15_000,
    placeholderData: (previous) => previous,
    select: (salons) => salons.filter((s) => ids?.includes(s.id)),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ salonId, favorite }: { salonId: string; favorite: boolean }) => setFavorite(salonId, favorite),
    onMutate: async ({ salonId, favorite }) => {
      await queryClient.cancelQueries({ queryKey: QK_FAVORITES });
      const before = queryClient.getQueryData<string[]>(QK_FAVORITES);
      queryClient.setQueryData<string[]>(QK_FAVORITES, (ids = []) => (favorite ? [...new Set([...ids, salonId])] : ids.filter((id) => id !== salonId)));
      return { before };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(QK_FAVORITES, ctx?.before),
    onSettled: () => queryClient.invalidateQueries({ queryKey: QK_FAVORITES }),
  });
}
