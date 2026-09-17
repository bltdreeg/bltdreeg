// تأكيد كود OTP
import { verifyOtp } from "@/lib/actions/auth/auth.action";
import type { VerifyOtpDto } from "@/lib/types/auth";

export async function POST(request: Request) {
  const dto = (await request.json()) as VerifyOtpDto;
  try {
    return Response.json(await verifyOtp(dto));
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 501 });
  }
}
