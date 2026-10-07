// كود التأكيد (فريم 19 عادي، 20 كود غلط) — رحلة Flutter (otp_page.dart):
// من غير تحدي متبعت قبلها → دخول بالموبايل. الكود بيتقري من الرسالة ويتأكد لوحده لما يكمل. بعد التأكيد → from أو الرئيسية.
// استعادة كلمة السر (reset_password): التأكيد بيرجّع توكن → شاشة كلمة السر الجديدة.
import * as Haptics from "expo-haptics";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text as RNText, View } from "react-native";
import { useTranslations } from "use-intl";
import { Text } from "@/components/atoms/text";
import { Button, LinkButton } from "@/components/molecules/button";
import { Notice } from "@/components/molecules/notice";
import { OtpInput } from "@/components/molecules/otp-input";
import { FieldError } from "@/components/molecules/text-field";
import { TopBar } from "@/components/molecules/top-bar";
import { AuthTitle, BrandTile, useAuthErrorText } from "@/components/organs/auth-parts";
import { FormScreen } from "@/components/organs/form-screen";
import { useOtpChallenge, useResendOtp, useVerifyOtp, useVerifyResetCode } from "@/lib/hooks/auth";
import { useFormat } from "@/lib/hooks/use-format.hook";
import type { ApiError } from "@/lib/utils/api/api-error";
import { safeReturnPath } from "@/lib/utils/route-guards";
import { colors } from "@/styles/tokens";
import { duration } from "@/theme/motion";

type Purpose = "login" | "register" | "reset_password";

/** ثواني لحد ما "ابعت تاني" تتفتح — بتعد كل ثانية */
function useSecondsUntil(iso: string | undefined): number {
  const [now, setNow] = useState(() => Date.now());
  const target = iso ? Date.parse(iso) : 0;
  useEffect(() => {
    if (target <= Date.now()) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  return Math.max(0, Math.ceil((target - now) / 1000));
}

export default function OtpScreen() {
  const t = useTranslations("mobile.auth");
  const f = useFormat();
  const errorText = useAuthErrorText();
  const params = useLocalSearchParams<{ phone?: string; purpose?: string; from?: string }>();
  const phone = params.phone ?? "";
  const purpose: Purpose = params.purpose === "register" || params.purpose === "reset_password" ? params.purpose : "login";
  const isReset = purpose === "reset_password";
  const from = safeReturnPath(params.from);

  const challenge = useOtpChallenge(purpose, phone).data;
  const verifyLogin = useVerifyOtp();
  const verifyReset = useVerifyResetCode();
  const verify = isReset ? verifyReset : verifyLogin;
  const resend = useResendOtp();
  const [code, setCode] = useState("");
  const resendIn = useSecondsUntil(challenge?.resendAvailableAt);

  if (!challenge) return <Redirect href={{ pathname: "/login", params: { method: "phone" } }} />;

  const length = challenge.codeLength;
  const wrong = verify.error?.code === "auth.otp_invalid" || verify.error?.code === "auth.otp_locked";

  const submit = (value = code) => {
    if (value.length !== length || verify.isPending || verify.isSuccess) return;
    // زي Flutter: اهتزاز + الخانات خضرا ٦٥٠ms قبل ما نمشي؛ الكود الغلط = اهتزاز أقوى
    const then = (go: () => void) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(go, duration.successHold);
    };
    const onError = (e: ApiError) => {
      if (e.code === "auth.otp_invalid" || e.code === "auth.otp_locked") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    };
    if (isReset) {
      // ponytail: التوكن (١٠ دقايق، مرة واحدة) بيتنقل في باراميتر المسار — في الذاكرة بس، مش بيتخزن
      verifyReset.mutate(
        { identifier: phone, code: value },
        { onSuccess: (r) => then(() => router.replace({ pathname: "/new-password", params: { token: r.resetToken } })), onError },
      );
    } else {
      verifyLogin.mutate({ phone, code: value, purpose }, { onSuccess: () => then(() => router.replace((from ?? "/home") as never)), onError });
    }
  };

  const phoneText = (
    <RNText>
      {" "}
      <Text variant="bodyLong" weight="bold" color={colors.textPrimary}>
        {f.phone(phone)}
      </Text>
    </RNText>
  );

  return (
    // الخلية → سطر العداد (58) → زرار التأكيد (62) لازم يبانوا فوق الكيبورد حتى على 360×640.
    // ponytail: keyboard-controller بيقيس من مؤشر الـ input المخفي (خط 1) مش من تحت الخلايا — الرقم متقاس على 360×640:
    // على ١٤٠٪ فاضل ~٤٧ تحت "تأكيد" والهالة فوق الخلايا ظاهرة (كان ٢٠٥ والهالة بتتقص)
    <FormScreen header={<TopBar />} keyboardOffset={195}>
      <View style={styles.top}>
        <BrandTile icon={wrong ? "alert_circle" : "message"} tone={wrong ? "error" : "tint"} />
        <AuthTitle
          title={wrong ? t("otpWrongTitle") : t("otpTitle")}
          subtitle={
            <Text variant="bodyLong">
              {wrong ? t("otpWrongSubtitle") : t("otpSentTo", { length: f.count(length) })}
              {phoneText}
            </Text>
          }
        />
        {!wrong && (
          <View style={styles.change}>
            <LinkButton label={t("changeNumber")} onPress={() => router.back()} />
          </View>
        )}
      </View>

      <OtpInput
        value={code}
        onChange={(v) => {
          setCode(v);
          if (verify.error) verify.reset();
        }}
        onComplete={submit}
        length={length}
        error={wrong}
        success={verify.isSuccess}
        accessibilityLabel={t("otpCode")}
      />

      <View style={styles.below}>
        {/* كود غلط والعداد لسه شغّال: الوقت يفضل ظاهر تحت الخطأ عشان "ابعتلي كود جديد" المقفولة تبقى مفهومة */}
        {verify.error && <FieldError message={errorText(verify.error)!} />}
        {resendIn > 0 ? (
          <Text variant="note" style={styles.center}>
            {t("resendIn", { time: f.countdown(resendIn) })}
          </Text>
        ) : resend.isSuccess && !verify.error ? (
          <Text variant="note" color={colors.okDark} style={styles.center}>
            {t("resent")}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button label={t("confirm")} onPress={() => submit()} disabled={code.length !== length} loading={verify.isPending || verify.isSuccess} />
        {(wrong || resendIn === 0) && (
          <Button
            label={t("resend")}
            variant="secondary"
            icon="refresh"
            disabled={resendIn > 0 || verify.error?.code === "auth.otp_locked"}
            loading={resend.isPending}
            onPress={() => {
              setCode("");
              verify.reset();
              resend.mutate({ phone, purpose });
            }}
          />
        )}
        {resend.error && <FieldError message={errorText(resend.error)!} />}
        {!wrong && <Notice>{t("otpHelp")}</Notice>}
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  top: { paddingTop: 18, paddingBottom: 26 },
  change: { flexDirection: "row", marginTop: 4 },
  below: { minHeight: 44, justifyContent: "center", gap: 8, marginTop: 14 },
  center: { textAlign: "center" },
  actions: { gap: 12, marginTop: 8 },
});
