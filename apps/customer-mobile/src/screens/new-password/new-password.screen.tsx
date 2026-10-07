// كلمة سر جديدة (آخر خطوة في "نسيت كلمة السر") — حقل وشروط فريم 06. الحفظ بيفتح جلسة جديدة (السيرفر بيقفل الأجهزة التانية) → الرئيسية.
import * as Haptics from "expo-haptics";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Button } from "@/components/molecules/button";
import { FieldError, TextField } from "@/components/molecules/text-field";
import { TopBar } from "@/components/molecules/top-bar";
import { AuthTitle, BrandTile, PasswordRules, useAuthErrorText } from "@/components/organs/auth-parts";
import { FormScreen } from "@/components/organs/form-screen";
import { useResetPassword } from "@/lib/hooks/auth";
import { checkPasswordCriteria } from "@/lib/utils/auth-validation.utils";
import { showToast } from "@/lib/utils/toast-bus";

export default function NewPasswordScreen() {
  const t = useTranslations("mobile.auth");
  const errorText = useAuthErrorText();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const reset = useResetPassword();

  if (!token) return <Redirect href="/forgot-password" />;

  const submit = () => {
    setSubmitted(true);
    const rules = checkPasswordCriteria(password);
    if (!rules.min8 || !rules.hasNumber) return;
    reset.mutate(
      { resetToken: token, password, passwordConfirmation: password },
      {
        onSuccess: () => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          showToast("auth.passwordChanged");
          router.replace("/home");
        },
      },
    );
  };

  return (
    <FormScreen header={<TopBar />}>
      <View style={styles.top}>
        <BrandTile icon="lock" tone="tint" />
        <AuthTitle title={t("newPasswordTitle")} subtitle={t("newPasswordSubtitle")} />
      </View>
      <View style={styles.form}>
        <TextField
          label={t("newPassword")}
          password
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            reset.reset();
          }}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        <PasswordRules password={password} highlight={submitted} />
        {reset.error && <FieldError message={errorText(reset.error)!} />}
        <Button label={t("savePassword")} onPress={submit} loading={reset.isPending} />
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  top: { paddingTop: 18, paddingBottom: 24 },
  form: { gap: 14 },
});
