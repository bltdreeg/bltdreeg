// رسالة الخطأ اللي بتتعرض للمستخدم من ApiError. رسائل Laravel بتيجي مترجمة حسب Accept-Language،
// فبنستخدمها زي ما هي إلا في الحالات اللي محتاجة أرقام (محاولات، دقايق).
import type { ApiError } from "../api/api-error.ts";

const NETWORK_MESSAGE = "مفيش اتصال بالسيرفر، اتأكد من النت وحاول تاني.";
const SERVER_MESSAGE = "حصلت مشكلة عندنا، حاول تاني بعد شوية.";

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** أول رسالة تحقق لكل حقل، بأسماء الحقول زي ما Laravel بيرجعها (snake_case). */
export function apiFieldErrors(error: ApiError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [field, messages] of Object.entries(error.errors)) {
    if (messages[0]) out[field] = messages[0];
  }
  return out;
}

export function authErrorMessage(error: ApiError): string {
  // أخطاء السيرفر (500+) ممكن تحمل تفاصيل داخلية (SQL...) فمبنعرضهاش للمستخدم
  if (error.status >= 500) return SERVER_MESSAGE;

  switch (error.code) {
    case "http.network":
      return NETWORK_MESSAGE;
    case "auth.otp_invalid": {
      const left = num(error.data.attemptsLeft);
      if (left !== null && left > 0) return `الكود غلط، فاضلك ${left} ${left === 1 ? "محاولة" : "محاولات"}.`;
      return error.message;
    }
    case "auth.otp_locked": {
      const minutes = num(error.data.lockMinutes);
      return minutes !== null ? `حاولت كتير. جرّب تاني بعد ${minutes} دقيقة.` : error.message;
    }
    case "auth.otp_resend_too_soon": {
      const seconds = num(error.data.retryAfterSeconds);
      return seconds !== null ? `استنى ${seconds} ثانية قبل ما تطلب كود جديد.` : error.message;
    }
    case "auth.otp_send_limit":
    case "auth.too_many_requests": {
      const seconds = num(error.data.retryAfterSeconds);
      return seconds !== null
        ? `حاولت كتير. جرّب تاني بعد ${Math.max(1, Math.ceil(seconds / 60))} دقيقة.`
        : error.message;
    }
    case "validation.failed":
      return Object.values(apiFieldErrors(error))[0] ?? error.message;
    default:
      return error.message;
  }
}
