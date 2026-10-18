// عرض بيانات العميل في الحساب والهيدر: الاسم والحروف الأولى ووسيلة التواصل
import type { Customer } from "../../types/auth/index.ts";

type NameParts = Pick<Customer, "firstName" | "lastName">;

/** الاسم الكامل، أو "" لو الحساب لسه من غير اسم (دخول اجتماعي ناقص) */
export function customerFullName(customer: NameParts): string {
  return [customer.firstName, customer.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
}

/** أول حرف من الاسم الأول واسم العيلة ("ك م")؛ "" لو مفيش اسم */
export function customerInitials(customer: NameParts): string {
  return [customer.firstName, customer.lastName]
    .map((part) => part?.trim().charAt(0) ?? "")
    .filter(Boolean)
    .join(" ")
    .toUpperCase();
}
