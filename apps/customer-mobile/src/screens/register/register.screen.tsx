// إنشاء حساب (فريم 06) — زي Flutter (register_cubit.dart): شروط كلمة السر بتتحقق لحظياً، والزرار شغّال؛
// بعد الضغط أخطاء الحقول بتظهر والشروط الناقصة بتبقى حمرا. النجاح → كود OTP على الرقم → بعد التأكيد from أو الرئيسية.
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, View, type TextInput } from "react-native";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Checkbox } from "@/components/atoms/selection-controls";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/molecules/button";
import { FieldError, PhoneField, TextField } from "@/components/molecules/text-field";
import { TopBar } from "@/components/molecules/top-bar";
import { AuthTitle, FooterLink, OrDivider, SocialButtons, useAuthErrorText } from "@/components/organs/auth-parts";
import { FormScreen, toOtp } from "@/components/organs/form-screen";
import { useRegister, useSocialLogin } from "@/lib/hooks/auth";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { checkPasswordCriteria, isValidEmail } from "@/lib/utils/auth-validation.utils";
import { isEgyptianMobile } from "@/lib/utils/auth/phone-field.utils";
import { safeReturnPath } from "@/lib/utils/route-guards";
import { colors } from "@/styles/tokens";

const MIN_NAME = 2;
const NEXT = { returnKeyType: "next", submitBehavior: "submit" } as const;

export default function RegisterScreen() {
  const t = useTranslations("mobile.auth");
  const f = useFormat();
  const errorText = useAuthErrorText();
  const from = safeReturnPath(useLocalSearchParams<{ from?: string }>().from);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // "التالي" في الكيبورد بينقل للحقل اللي بعده
  const lastRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);


  const registerMutation = useRegister();
  const social = useSocialLogin();
  const rules = checkPasswordCriteria(password);

  const errors = {
    firstName: firstName.trim().length < MIN_NAME ? t("nameShort") : null,
    lastName: lastName.trim().length < MIN_NAME ? t("nameShort") : null,
    phone: !isEgyptianMobile(phone) ? t("phoneError") : null,
    email: email && !isValidEmail(email) ? t("emailError") : null,
    // زي Flutter: القاعدة اللي واقعة بس
    password: !rules.min8 ? t("passwordShort", { n: f.number(8) }) : !rules.hasNumber ? t("passwordDigit") : null,
    terms: !terms ? t("termsRequired") : null,
  };
  const show = (k: keyof typeof errors) => (submitted ? errors[k] : null);
  const serverPhoneError = registerMutation.error?.code === "auth.phone_taken" ? errorText(registerMutation.error) : null;

  const submit = () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    registerMutation.mutate(
      { firstName: firstName.trim(), lastName: lastName.trim(), phone, email: email.trim() || undefined, password, acceptedTerms: true, channel: "sms" },
      { onSuccess: (c) => toOtp({ phone: c.phone ?? phone, purpose: "register", ...(from && { from }) }) },
    );
  };

  const signInWith = (provider: "google" | "apple") =>
    social.mutate({ provider, idToken: `mock-${provider}` }, { onSuccess: () => router.replace((from ?? "/home") as never) });

  return (
    // كلمة السر → الشروط → الموافقة (سطرين) → الزرار: الزرار يفضل فوق الكيبورد
    <FormScreen header={<TopBar />} keyboardOffset={170}>
      <View style={styles.top}>
        <AuthTitle title={t("registerTitle")} subtitle={t("registerSubtitle")} />
      </View>

      <View style={styles.form}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <TextField label={t("firstName")} value={firstName} onChangeText={setFirstName} error={show("firstName")} autoComplete="given-name" textContentType="givenName" {...NEXT} onSubmitEditing={() => lastRef.current?.focus()} />
          </View>
          <View style={styles.flex}>
            <TextField ref={lastRef} label={t("lastName")} value={lastName} onChangeText={setLastName} error={show("lastName")} autoComplete="family-name" textContentType="familyName" {...NEXT} onSubmitEditing={() => phoneRef.current?.focus()} />
          </View>
        </View>
        <PhoneField
          ref={phoneRef}
          {...NEXT} onSubmitEditing={() => emailRef.current?.focus()}
          label={t("phone")}
          value={phone}
          onChangeText={(v) => {
            setPhone(v);
            registerMutation.reset();
          }}
          error={show("phone") ?? serverPhoneError}
        />
        <TextField
          ref={emailRef}
          {...NEXT} onSubmitEditing={() => passwordRef.current?.focus()}
          label={t("email")}
          optional
          placeholder={t("emailPlaceholder")}
          value={email}
          onChangeText={setEmail}
          error={show("email")}
          ltr
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextField ref={passwordRef} label={t("password")} password value={password} onChangeText={setPassword} autoComplete="new-password" textContentType="newPassword" returnKeyType="done" />

        <View style={styles.rules} accessibilityLiveRegion="polite">
          <Rule ok={rules.min8} label={t("ruleLength", { count: f.count(8) })} highlight={submitted} />
          <Rule ok={rules.hasNumber} label={t("ruleDigit")} highlight={submitted} />
        </View>

        <View style={styles.terms}>
          <Checkbox checked={terms} onPress={() => setTerms((v) => !v)} accessibilityLabel={`${t("termsPrefix")}${t("terms")}${t("and")}${t("privacy")}`} />
          <Pressable onPress={() => setTerms((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked: terms }} pressedScale={1} style={styles.flex}>
            <Text variant="note">
              {t("termsPrefix")}
              <Text variant="note" weight="bold" color={colors.primary}>
                {t("terms")}
              </Text>
              {t("and")}
              <Text variant="note" weight="bold" color={colors.primary}>
                {t("privacy")}
              </Text>
              {t("termsSuffix")}
            </Text>
          </Pressable>
        </View>
        {show("terms") && <FieldError message={t("termsRequired")} />}
        {registerMutation.error && !serverPhoneError && <FieldError message={errorText(registerMutation.error)!} />}

        <Button label={t("registerSubmit")} onPress={submit} loading={registerMutation.isPending} />
      </View>

      <OrDivider label={t("orSignUpWith")} />
      <SocialButtons compact onGoogle={() => signInWith("google")} onApple={() => signInWith("apple")} loading={social.isPending} />

      <FooterLink
        text={t("haveAccount")}
        link={t("signIn")}
        onPress={() => (router.canGoBack() ? router.back() : router.replace({ pathname: "/login", params: from ? { from } : {} }))}
      />
    </FormScreen>
  );
}

/** شرط كلمة السر: ✓ أخضر لما يتحقق، ✕ رمادي — وأحمر لو ناقص بعد الضغط */
function Rule({ ok, label, highlight }: { ok: boolean; label: string; highlight: boolean }) {
  const color = ok ? colors.okDark : highlight ? colors.error : colors.textSecondary;
  return (
    <View style={styles.rule} accessible accessibilityLabel={label} accessibilityState={{ checked: ok }}>
      <Icon name={ok ? "check_bold" : "close"} size={15} color={color} />
      <Text dense variant="metaStrong" weight="semibold" color={color}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { paddingTop: 12, paddingBottom: 22 },
  form: { gap: 14 },
  row: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
  rules: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginHorizontal: 2, marginTop: -6 },
  rule: { flexDirection: "row", alignItems: "center", gap: 5 },
  terms: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 6 },
});
