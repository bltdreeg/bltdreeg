// مخطط التحقق والأنواع لنموذج إنشاء حساب — بدون JSX
import { z } from "zod";
import {
  checkPasswordCriteria,
  isValidEmail,
  validateEgyptianPhone,
} from "@/lib/utils/auth-validation.utils";

export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  agreeToTerms: boolean;
}

type ErrorKey = "firstNameRequired" | "lastNameRequired" | "emailInvalid" | "passwordInvalid" | "agreeTermsRequired";

// الرسائل بتيجي مترجمة من الفورم (t) عشان المخطط يفضل بدون hooks
export function createRegisterSchema(message: (key: ErrorKey) => string) {
  return z.object({
    firstName: z.string().trim().min(1, message("firstNameRequired")),
    lastName: z.string().trim().min(1, message("lastNameRequired")),
    // البريد اختياري: فاضي مقبول، ولو اتكتب لازم يكون صحيح
    email: z.string().refine((value) => !value.trim() || isValidEmail(value), message("emailInvalid")),
    phone: z.string().superRefine((value, ctx) => {
      const result = validateEgyptianPhone(value);
      if (!result.isValid) ctx.addIssue({ code: "custom", message: result.errorMessage });
    }),
    password: z.string().refine((value) => checkPasswordCriteria(value).isValid, message("passwordInvalid")),
    agreeToTerms: z.boolean().refine((value) => value, message("agreeTermsRequired")),
  });
}
