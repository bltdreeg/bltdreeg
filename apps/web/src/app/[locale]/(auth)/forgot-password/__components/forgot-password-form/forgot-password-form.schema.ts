// مخطط التحقق والأنواع لنموذج استعادة كلمة السر — بدون JSX
import { z } from "zod";
import { isValidEmail, validateEgyptianPhone } from "@/lib/utils/auth-validation.utils";

export type ResetIdentifierMode = "email" | "phone";

export interface ForgotPasswordFormValues {
  mode: ResetIdentifierMode;
  email: string;
  phone: string;
}

type ErrorKey = "emailRequired" | "emailInvalid";

// المطلوب حسب الطريقة المختارة: موبايل أو إيميل
export function createForgotPasswordSchema(message: (key: ErrorKey) => string) {
  return z
    .object({
      mode: z.enum(["email", "phone"]),
      email: z.string(),
      phone: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.mode === "email") {
        if (!values.email.trim()) {
          ctx.addIssue({ code: "custom", path: ["email"], message: message("emailRequired") });
        } else if (!isValidEmail(values.email)) {
          ctx.addIssue({ code: "custom", path: ["email"], message: message("emailInvalid") });
        }
        return;
      }
      const result = validateEgyptianPhone(values.phone);
      if (!result.isValid) ctx.addIssue({ code: "custom", path: ["phone"], message: result.errorMessage });
    });
}
