// إنشاء حساب — placeholder لحد ما الشاشة تتبني
import { ScreenPlaceholder } from "@/components/molecules/screen-placeholder";

export default function RegisterScreen() {
  return (
    <ScreenPlaceholder
      title="إنشاء حساب"
      frames="06"
      links={[
        { label: "تسجيل الدخول", href: "/login" },
      ]}
    />
  );
}
