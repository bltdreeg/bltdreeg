// تسجيل الخروج
import { logout } from "@/lib/actions/auth/auth.action";

export async function POST() {
  try {
    return Response.json(await logout());
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 501 });
  }
}
