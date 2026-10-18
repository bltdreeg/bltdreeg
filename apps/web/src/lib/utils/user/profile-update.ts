// تحويل قيم نموذج بياناتي لطلب PUT /me — بيبعت اللي اتغير بس
import type { Customer, UpdateProfileDto } from "../../types/auth/index.ts";

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  /** YYYY-MM-DD أو "" */
  birthDate: string;
}

export function toProfileValues(user: Customer): ProfileFormValues {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    birthDate: user.birthDate?.slice(0, 10) ?? "",
  };
}

/** email/birthDate الفاضيين معناهم مسح (null) */
export function toUpdateProfileDto(values: ProfileFormValues, initial: ProfileFormValues): UpdateProfileDto {
  const dto: UpdateProfileDto = {};
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const email = values.email.trim().toLowerCase();

  if (firstName !== initial.firstName) dto.firstName = firstName;
  if (lastName !== initial.lastName) dto.lastName = lastName;
  if (email !== initial.email.toLowerCase()) dto.email = email || null;
  if (values.birthDate !== initial.birthDate) dto.birthDate = values.birthDate || null;
  return dto;
}
