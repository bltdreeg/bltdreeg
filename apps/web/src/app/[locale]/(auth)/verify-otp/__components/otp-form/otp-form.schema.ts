// مخطط التحقق والأنواع لنموذج كود التأكيد — بدون JSX
import { z } from "zod";
import { isValidOtp } from "@/lib/utils/auth-validation.utils";

export interface OtpFormValues {
  code: string;
}

// طول الكود بييجي من السيرفر (challenge) فالمخطط بيتبني بيه
export function createOtpSchema(codeLength: number, invalidMessage: string) {
  return z.object({
    code: z.string().refine((value) => isValidOtp(value, codeLength), invalidMessage),
  });
}
