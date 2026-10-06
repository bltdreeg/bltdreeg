// مخطط التحقق والأنواع لنموذج تسجيل الدخول — بدون JSX
import { z } from "zod";
import { isValidEmail, validateEgyptianPhone } from "@/lib/utils/auth-validation.utils";

export type LoginTab = "email" | "phone";

export interface LoginFormValues {
  tab: LoginTab;
  email: string;
  phone: string;
  password: string;
}

type ErrorKey = "emailRequired" | "emailInvalid" | "passwordRequired";

// المطلوب بيختلف حسب التبويب: إيميل + كلمة سر، أو موبايل بس (الدخول بكود)
export function createLoginSchema(message: (key: ErrorKey) => string) {
  return z
    .object({
      tab: z.enum(["email", "phone"]),
      email: z.string(),
      phone: z.string(),
      password: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.tab === "email") {
        if (!values.email.trim()) {
          ctx.addIssue({ code: "custom", path: ["email"], message: message("emailRequired") });
        } else if (!isValidEmail(values.email)) {
          ctx.addIssue({ code: "custom", path: ["email"], message: message("emailInvalid") });
        }
        if (!values.password) {
          ctx.addIssue({ code: "custom", path: ["password"], message: message("passwordRequired") });
        }
        return;
      }
      const result = validateEgyptianPhone(values.phone);
      if (!result.isValid) ctx.addIssue({ code: "custom", path: ["phone"], message: result.errorMessage });
    });
}
