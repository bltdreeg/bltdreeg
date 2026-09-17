// إنشاء حساب
import { register } from "@/lib/actions/auth/auth.action";
import type { RegisterDto } from "@/lib/types/auth";

export async function POST(request: Request) {
  const dto = (await request.json()) as RegisterDto;
  try {
    return Response.json(await register(dto));
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 501 });
  }
}
