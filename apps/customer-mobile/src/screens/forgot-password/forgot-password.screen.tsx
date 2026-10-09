// نسيت كلمة السر (مش في البورد ولا Flutter — قطع البورد: حقل الموبايل بتاع فريم 05 + الكود فريم 19 + كلمة السر بتاعة فريم 06):
// الرقم → كود (reset_password) → كلمة سر جديدة → جلسة جديدة. العناوين الجديدة في GAPS للمراجعة.
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Button } from "@/components/molecules/button";
import { PhoneField } from "@/components/molecules/text-field";
import { TopBar } from "@/components/molecules/top-bar";
import { AuthTitle, BrandTile, useAuthErrorText } from "@/components/organs/auth-parts";
import { FormScreen, toOtp } from "@/components/organs/form-screen";
import { useForgotPassword } from "@/lib/hooks/auth";
import { isEgyptianMobile, showPhoneError } from "@/lib/utils/auth/phone-field.utils";

export default function ForgotPasswordScreen() {
  const t = useTranslations("mobile.auth");
  const errorText = useAuthErrorText();
  const [phone, setPhone] = useState("");
  const [blurred, setBlurred] = useState(false);
  const forgot = useForgotPassword();

  const submit = () => {
    if (!isEgyptianMobile(phone)) return;
    forgot.mutate({ identifier: phone, channel: "sms" }, { onSuccess: (c) => toOtp({ phone: c.phone ?? phone, purpose: "reset_password" }) });
  };

  return (
    <FormScreen header={<TopBar />}>
      <View style={styles.top}>
        <BrandTile icon="lock" tone="tint" />
        <AuthTitle title={t("forgotPassword")} subtitle={t("forgotSubtitle")} />
      </View>
      <View style={styles.form}>
        <PhoneField
          label={t("phone")}
          value={phone}
          onChangeText={(v) => {
            setPhone(v);
            forgot.reset();
          }}
          onBlur={() => setBlurred(true)}
          error={showPhoneError(phone, blurred) ? t("phoneError") : errorText(forgot.error)}
          returnKeyType="send"
          onSubmitEditing={submit}
        />
        <Button label={t("sendOtp")} onPress={submit} disabled={!isEgyptianMobile(phone)} loading={forgot.isPending} />
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  top: { paddingTop: 18, paddingBottom: 24 },
  form: { gap: 14 },
});
