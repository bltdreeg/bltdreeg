// تحدي الـ OTP الحالي (طول الكود، وقت إعادة الإرسال، المحاولات). بيتحط في الكاش بعد register / login-otp / resend،
// وصفحة التأكيد بتقراه. لو الصفحة اتفتحت من غير إرسال قبلها (refresh) الكاش بيبقى فاضي وبنرجع للقيم الافتراضية.
import { useQuery, type QueryClient } from "@tanstack/react-query";
import { QK_OTP_CHALLENGE } from "@/lib/data/constants/query-keys.constants";
import type { OtpChallenge } from "@/lib/types/auth";
import { formatLocalEgyptianPhone } from "@/lib/utils/auth-validation.utils";

function challengeKey(challenge: Pick<OtpChallenge, "purpose" | "phone" | "email">) {
  return QK_OTP_CHALLENGE(challenge.purpose, challenge.phone ?? challenge.email ?? "");
}

/** بيتنادى من onSuccess في الـ hooks اللي بتبعت كود. */
export function rememberOtpChallenge(queryClient: QueryClient, challenge: OtpChallenge): void {
  queryClient.setQueryData(challengeKey(challenge), challenge);
}

/** phone بأي صيغة (+20 أو 01)، بنوحّدها لنفس صيغة الـ API (01XXXXXXXXX). */
export function useOtpChallenge(purpose: OtpChallenge["purpose"], phone: string) {
  return useQuery<OtpChallenge | null>({
    queryKey: QK_OTP_CHALLENGE(purpose, formatLocalEgyptianPhone(phone)),
    // الكاش بيتملي من الإرسال بس؛ مفيش endpoint لقراءة التحدي
    queryFn: () => null,
    enabled: false,
    staleTime: Infinity,
  });
}
