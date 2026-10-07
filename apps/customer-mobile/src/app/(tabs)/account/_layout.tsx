// حسابي: البيانات والمفضلة والإشعارات محتاجين حساب — الحماية في LoginRedirect في الجذر (بيرجّعك بعد الدخول)
import { Stack } from "expo-router";

export default function AccountLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
