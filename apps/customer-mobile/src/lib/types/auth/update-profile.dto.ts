// تعديل الملف الشخصي — الحقول اللي مش مبعوتة مش بتتغير؛ email: null بيمسح البريد
export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  birthDate?: string | null;
  acceptedTerms?: boolean;
}
