// أفعال الملف الشخصي — /me في Laravel عن طريق apiClient
import { apiClient } from "@/lib/api";
import type {
  Customer,
  OtpChallenge,
  SendPhoneChangeOtpDto,
  UpdatePasswordDto,
  UpdateProfileDto,
  VerifyEmailDto,
  VerifyPhoneChangeDto,
} from "@/lib/types/auth";
import type { ConfirmLocationDto, ResolvedLocation } from "@/lib/types/geo";
import { ApiError } from "@/lib/utils/api/api-error";
import {
  mapCustomer,
  mapOtpChallenge,
  mapResolvedLocation,
  type RawAuthSession,
  type RawCustomer,
  type RawOtpChallenge,
  type RawResolvedLocation,
} from "@/lib/utils/auth/laravel-mappers";
import { tokenStorage } from "@/lib/utils/auth/token-storage";

const DEVICE_NAME = "web";

function syncOnboarding(raw: RawCustomer): Customer {
  const user = mapCustomer(raw);
  // كوكي الـ onboarding ممكن تبوظ عن الحقيقة، فنزامنها مع كل قراءة
  tokenStorage.setOnboarding(user.onboarding.complete);
  return user;
}

/** بيرجّع null لو مفيش جلسة (مش خطأ). الـ axios interceptor بيمسح التوكن المنتهي لوحده. */
export async function getMe(): Promise<Customer | null> {
  if (!tokenStorage.getAccessToken()) return null;
  try {
    return syncOnboarding(await apiClient.get<RawCustomer>("/me"));
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export async function updateMe(dto: UpdateProfileDto): Promise<Customer> {
  return syncOnboarding(
    await apiClient.put<RawCustomer>("/me", {
      first_name: dto.firstName,
      last_name: dto.lastName,
      email: dto.email,
      birth_date: dto.birthDate,
      accepted_terms: dto.acceptedTerms,
    }),
  );
}

/** تقدير الموقع من الـ IP (أو القاهرة الافتراضية) — قراءة بس، مبتكتبش حاجة */
export async function getLocationEstimate(): Promise<ResolvedLocation> {
  const result = await apiClient.get<{ estimate: RawResolvedLocation }>("/me/location/estimate");
  return mapResolvedLocation(result.estimate);
}

/** السيرفر بيلغي كل الأجهزة التانية؛ الجهاز ده بيفضل داخل بنفس التوكن */
export async function updatePassword(dto: UpdatePasswordDto): Promise<void> {
  await apiClient.put<void>("/me/password", {
    current_password: dto.currentPassword,
    password: dto.password,
    password_confirmation: dto.passwordConfirmation,
  });
}

/** بيبعت كود على الرقم الجديد؛ الرقم مبيتغيرش غير بعد verifyPhoneChange */
export async function sendPhoneChangeOtp(dto: SendPhoneChangeOtpDto): Promise<OtpChallenge> {
  return mapOtpChallenge(await apiClient.post<RawOtpChallenge>("/me/phone", dto));
}

/** السيرفر بيرجّع توكن جديد (وممكن يدمج حساب اجتماعي ناقص في حساب تاني)، فبنفتح الجلسة من الأول */
export async function verifyPhoneChange(dto: VerifyPhoneChangeDto): Promise<Customer> {
  const raw = await apiClient.post<RawAuthSession>("/me/phone/verify", {
    phone: dto.phone,
    code: dto.code,
    device_name: DEVICE_NAME,
  });
  tokenStorage.setSession(raw.access_token, raw.user.onboarding.complete);
  return mapCustomer(raw.user);
}

export async function resendEmailCode(): Promise<OtpChallenge> {
  return mapOtpChallenge(await apiClient.post<RawOtpChallenge>("/me/email/resend"));
}

export async function verifyEmail(dto: VerifyEmailDto): Promise<Customer> {
  return syncOnboarding(await apiClient.post<RawCustomer>("/me/email/verify", { code: dto.code }));
}

/** حذف نهائي (السيرفر بيجهّل البيانات ويلغي كل التوكنات) — بنمسح الجلسة محلياً بعده */
export async function deleteAccount(): Promise<void> {
  await apiClient.delete<void>("/me");
  tokenStorage.clear();
}

/** تأكيد المحافظة/المدينة/المنطقة — بيكمّل خطوة الموقع في الـ onboarding */
export async function confirmLocation(
  dto: ConfirmLocationDto,
): Promise<Customer> {
  return syncOnboarding(
    await apiClient.put<RawCustomer>("/me/location", {
      city_id: dto.cityId,
      lat: dto.lat,
      lng: dto.lng,
      source: dto.source,
    }),
  );
}
