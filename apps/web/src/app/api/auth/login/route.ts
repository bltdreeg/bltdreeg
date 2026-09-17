// تسجيل الدخول
import { login } from "@/lib/actions/auth/auth.action";
import type { LoginDto } from "@/lib/types/auth";

export async function POST(request: Request) {
  const dto = (await request.json()) as LoginDto;
  try {
    return Response.json(await login(dto));
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 501 });
  }
}
