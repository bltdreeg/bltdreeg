// تسجيل الدخول (فريم 04 بالبريد، 05 بالموبايل) — رحلة Flutter (login_page.dart):
// بالبريد → الجلسة تتفتح وترجع لـ from أو الرئيسية. بالموبايل → كود OTP. "تصفّح من غير حساب" → الرئيسية كضيف.
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, View, type TextInput } from "react-native";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Text } from "@/components/atoms/text";
import { Button, LinkButton } from "@/components/molecules/button";
import { SegmentedTabs } from "@/components/molecules/tabs";
import { FieldError, PhoneField, TextField } from "@/components/molecules/text-field";
import { TopBar } from "@/components/molecules/top-bar";
import { AuthTitle, BrandTile, FooterLink, OrDivider, SocialButtons, useAuthErrorText } from "@/components/organs/auth-parts";
import { FormScreen, toOtp } from "@/components/organs/form-screen";
import { useLogin, useSendLoginOtp, useSocialLogin } from "@/lib/hooks/auth";
import { isValidEmail } from "@/lib/utils/auth-validation.utils";
import { isEgyptianMobile, showPhoneError } from "@/lib/utils/auth/phone-field.utils";
import { safeReturnPath } from "@/lib/utils/route-guards";
import { colors, radius } from "@/styles/tokens";

type Method = "email" | "phone";

export default function LoginScreen() {
  const t = useTranslations("mobile.auth");
  const errorText = useAuthErrorText();
  const params = useLocalSearchParams<{ from?: string; method?: string }>();
  const from = safeReturnPath(params.from);

  const [method, setMethod] = useState<Method>(params.method === "phone" ? "phone" : "email");
  // الشاشة ممكن تكون مفتوحة قبل كده (OTP من غير تحدي → login?method=phone) فـ useState مش هيشوف الباراميتر الجديد
  const [seenMethod, setSeenMethod] = useState(params.method);
  if (params.method !== seenMethod) {
    setSeenMethod(params.method);
    if (params.method === "phone" || params.method === "email") setMethod(params.method);
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneBlurred, setPhoneBlurred] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const login = useLogin();
  const sendOtp = useSendLoginOtp();
  const social = useSocialLogin();

  const done = () => router.replace((from ?? "/home") as never);

  const emailError = emailSubmitted && !isValidEmail(email) ? t("emailError") : null;
  const passwordError = emailSubmitted && !password ? t("required") : null;

  const submitEmail = () => {
    setEmailSubmitted(true);
    if (!isValidEmail(email) || !password) return;
    login.mutate({ identifier: email, password }, { onSuccess: done });
  };

  const submitPhone = () => {
    if (!isEgyptianMobile(phone)) return;
    sendOtp.mutate(
      { phone, channel: "sms" },
      { onSuccess: (c) => toOtp({ phone: c.phone ?? phone, purpose: "login", ...(from && { from }) }) },
    );
  };

  const signInWith = (provider: "google" | "apple") =>
    // ponytail: no native Google/Apple SDK yet; the mock accepts any token. Wire expo-apple-authentication + Google sign-in before the real API.
    social.mutate({ provider, idToken: `mock-${provider}` }, { onSuccess: done });

  const phoneError = showPhoneError(phone, phoneBlurred) ? t("phoneError") : errorText(sendOtp.error);

  return (
    // الحقل → الملاحظة (سطرين على 360) أو "نسيت كلمة السر" → الزرار: الزرار يفضل فوق الكيبورد
    <FormScreen
      keyboardOffset={150}
      header={
        <TopBar trailing={<LinkButton label={t("browseAsGuest")} onPress={() => router.replace("/home")} size={14} />} />
      }
    >
      <View style={styles.top}>
        <BrandTile />
        <AuthTitle title={t("loginTitle")} subtitle={t("loginSubtitle")} />
      </View>

      <SegmentedTabs
        tabs={[
          { key: "email", label: t("tabEmail") },
          { key: "phone", label: t("tabPhone") },
        ]}
        value={method}
        onChange={setMethod}
      />

      {method === "email" ? (
        <View style={styles.form}>
          <TextField
            label={t("email")}
            icon="user"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            ltr
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <TextField
            ref={passwordRef}
            label={t("password")}
            password
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={submitEmail}
          />
          <View style={styles.forgot}>
            <LinkButton label={t("forgotPassword")} onPress={() => router.push("/forgot-password")} />
          </View>
          {login.error && <FieldError message={errorText(login.error)!} />}
          <Button label={t("loginSubmit")} onPress={submitEmail} loading={login.isPending} />
        </View>
      ) : (
        <View style={styles.form}>
          <PhoneField
            label={t("phone")}
            value={phone}
            onChangeText={(v) => {
              setPhone(v);
              sendOtp.reset();
            }}
            onBlur={() => setPhoneBlurred(true)}
            error={phoneError}
            returnKeyType="send"
            onSubmitEditing={submitPhone}
          />
          <View style={styles.notice}>
            <Icon name="check" size={15} color={colors.teal} />
            <Text variant="note" style={styles.flex}>
              {t("otpNotice")}
            </Text>
          </View>
          <Button label={t("sendOtp")} onPress={submitPhone} disabled={!isEgyptianMobile(phone)} loading={sendOtp.isPending} />
        </View>
      )}

      <OrDivider label={t("or")} />
      <SocialButtons onGoogle={() => signInWith("google")} onApple={() => signInWith("apple")} loading={social.isPending} />
      {social.error && <FieldError message={errorText(social.error)!} />}

      <FooterLink text={t("noAccount")} link={t("createOne")} onPress={() => router.push({ pathname: "/register", params: from ? { from } : {} })} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  top: { paddingTop: 18, paddingBottom: 24 },
  form: { gap: 14, marginTop: 18 },
  forgot: { flexDirection: "row", marginTop: -2, marginBottom: 8 },
  notice: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.surf,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.field,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  flex: { flex: 1 },
});
