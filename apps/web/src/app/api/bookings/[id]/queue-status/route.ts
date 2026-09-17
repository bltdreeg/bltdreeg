// حالة الدور الحية: اللي قدامك، الالتزام، الوقت المتوقع
import { getQueueStatus } from "@/lib/actions/bookings/bookings.action";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const status = await getQueueStatus(id);
  if (!status) return new Response(null, { status: 404 });
  return Response.json(status);
}
