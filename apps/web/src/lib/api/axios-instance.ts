// axios instance الوحيد للتطبيق — بيكلم Laravel (/api/v1) مباشرة من المتصفح.
import axios, { AxiosError } from "axios";
import { routing } from "@/i18n/routing";
import { ApiError, toApiError } from "@/lib/utils/api/api-error";
import { tokenStorage } from "@/lib/utils/auth/token-storage";

const DEFAULT_API_URL = "http://localhost:8011/api/v1";

export const axiosInstance = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, ""),
  timeout: 30_000,
  headers: { Accept: "application/json" },
});

/** اللغة من أول جزء في المسار (/ar/... أو /en/...)، والافتراضي لغة التطبيق */
function currentLocale(): string {
  if (typeof window === "undefined") return routing.defaultLocale;
  const first = window.location.pathname.split("/")[1];
  return (routing.locales as readonly string[]).includes(first) ? first : routing.defaultLocale;
}

axiosInstance.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  config.headers.set("Accept-Language", currentLocale());
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
    if (error.response.status === 401 && error.config?.headers?.has("Authorization")) {
      tokenStorage.clear();
    }
    return Promise.reject(toApiError(error.response.status, error.response.data));
  },
);
