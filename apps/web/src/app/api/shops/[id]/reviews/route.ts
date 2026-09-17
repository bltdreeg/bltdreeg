// تقييمات المحل
import { getShopReviews } from "@/lib/actions/reviews/reviews.action";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return Response.json(await getShopReviews(id));
}
