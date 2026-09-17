// تجديد الجلسة
import { refreshSession } from "@/lib/actions/auth/auth.action";

export async function POST() {
  try {
    return Response.json(await refreshSession());
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 501 });
  }
}
