// أفعال الملف الشخصي — /me في Laravel عن طريق apiClient
import { apiClient } from "@/lib/api";
import type { Customer, UpdateProfileDto } from "@/lib/types/auth";
import type { ConfirmLocationDto, ResolvedLocation } from "@/lib/types/geo";
import { ApiError } from "@/lib/utils/api/api-error";
import {
  mapCustomer,
  mapResolvedLocation,
  type RawCustomer,
  type RawResolvedLocation,
} from "@/lib/utils/auth/laravel-mappers";
import { tokenStorage } from "@/lib/utils/auth/token-storage";

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
  try {
    const result = await apiClient.get<{ estimate: RawResolvedLocation }>(
      "/me/location/estimate",
    );
    console.log({ result });
    return mapResolvedLocation(result.estimate);
  } catch (error) {
    console.log({ error });
    throw error;
  }
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
