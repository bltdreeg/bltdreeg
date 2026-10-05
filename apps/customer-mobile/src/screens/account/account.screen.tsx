// حسابي — placeholder (frames 16–17، 43 حالة الضيف)
import { useTranslations } from "use-intl";
import { ScreenPlaceholder, type PlaceholderLink } from "@/components/molecules/screen-placeholder";
import { useLogout } from "@/lib/hooks/auth";
import { useSession } from "@/lib/hooks/use-session.hook";

export default function AccountScreen() {
  const t = useTranslations();
  const { hasSession } = useSession();
  const logout = useLogout();

  const links: PlaceholderLink[] = hasSession
    ? [
        { label: "تعديل البيانات الشخصية", href: "/account/profile" },
        { label: "المفضلة", href: "/account/favorites" },
        { label: "إعدادات الإشعارات", href: "/account/notification-settings" },
      ]
    : [{ label: t("auth.register.login"), href: "/login" }];

  links.push(
    { label: "اللغة", href: "/account/language" },
    { label: "المساعدة والدعم", href: "/account/help" },
  );
  if (hasSession) links.push({ label: t("app.account.logout"), onPress: () => logout.mutate() });
  if (__DEV__) links.push({ label: "Design system", href: "/dev/design-system" });

  return <ScreenPlaceholder title={t("app.account.title")} frames="16–17, 43" links={links} />;
}
