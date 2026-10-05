// أونبوردنج — placeholder لحد ما الشاشة تتبني
import { ScreenPlaceholder } from "@/components/molecules/screen-placeholder";
import { appPreferences } from "@/lib/utils/app-preferences";

export default function OnboardingScreen() {
  return (
    <ScreenPlaceholder title="أونبوردنج" frames="01–03" links={[{ label: "يلا نبدأ", onPress: appPreferences.markOnboardingSeen }]} />
  );
}
