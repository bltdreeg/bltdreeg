// axios instance الوحيد للتطبيق — بيكلم Laravel (/api/v1) مباشرة.
import axios, { AxiosError } from "axios";
import { Platform } from "react-native";
import { showToast } from "@/lib/utils/toast-bus";
import { getLocale } from "@/i18n/config";
import { ApiError, toApiError } from "@/lib/utils/api/api-error";
import { tokenStorage } from "@/lib/utils/auth/token-storage";
import { mockAdapter } from "./mock/adapter";

const DEFAULT_API_URL = "http://localhost:8011/api/v1";
/** مفيش باك إند للصالونات/الحجز/الطابور لسه — الـ mock شغال افتراضياً. EXPO_PUBLIC_API_MOCK=0 = Laravel الحقيقي */
const USE_MOCK = process.env.EXPO_PUBLIC_API_MOCK !== "0";

export const axiosInstance = axios.create({
  baseURL: (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, ""),
  timeout: 30_000,
  // السيرفر بيسجّل منصة التوكن من X-Platform (الافتراضي web)
  headers: { Accept: "application/json", "X-Platform": Platform.OS },
  adapter: USE_MOCK ? mockAdapter : undefined,
});

axiosInstance.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  config.headers.set("Accept-Language", getLocale());
  return config;
});

// بيحوّل أي فشل لـ ApiError (نفس envelope بتاع Laravel) عشان الـ hooks والمكونات تقرا error.code/data/errors.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      return Promise.reject(new ApiError(0, "http.network", error.message));
    }
    // 401 على طلب مبعوت معاه توكن = التوكن منتهي أو مسحوب (مفيش refresh، التوكن بيتجدد لوحده من السيرفر)
    // زي Flutter "جلستك انتهت" — مرة واحدة: بعد أول clear التوكن بيبقى null للطلبات التانية
    if (error.response.status === 401 && error.config?.headers?.has("Authorization")) {
      if (tokenStorage.getAccessToken()) showToast("common.sessionExpired");
      tokenStorage.clear();
    }
    return Promise.reject(toApiError(error.response.status, error.response.data));
  },
);
