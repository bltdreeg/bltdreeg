// مخطط التحقق لنموذج بياناتي — بدون JSX
import { z } from "zod";
import { isValidEmail } from "@/lib/utils/auth-validation.utils";

type ErrorKey = "firstNameRequired" | "lastNameRequired" | "emailInvalid" | "birthDateInvalid";

export function createProfileSchema(message: (key: ErrorKey) => string) {
  return z.object({
    firstName: z.string().trim().min(1, message("firstNameRequired")),
    lastName: z.string().trim().min(1, message("lastNameRequired")),
    email: z.string().refine((value) => !value.trim() || isValidEmail(value), message("emailInvalid")),
    // السيرفر بيرفض أي تاريخ مش قبل النهارده
    birthDate: z
      .string()
      .refine((value) => !value || value < new Date().toISOString().slice(0, 10), message("birthDateInvalid")),
  });
}
