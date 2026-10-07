// كل مكونات المكتبة بحالاتها — عشان نراجعها على كل مقاس ولغة قبل ما الشاشات تتبني عليها
import { useState, useSyncExternalStore } from "react";
import { PixelRatio, StyleSheet, View } from "react-native";
import { getLocale, switchLocale } from "@/i18n/config";
import { appPreferences } from "@/lib/utils/app-preferences";
import { Avatar } from "@/components/atoms/avatar";
import { Checkbox, Radio, RadioGroup, Toggle } from "@/components/atoms/selection-controls";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { Button, LinkButton } from "@/components/molecules/button";
import { Chip, ChipRail } from "@/components/molecules/chip";
import { EmptyState } from "@/components/molecules/empty-state";
import { IconButton } from "@/components/molecules/icon-button";
import { Notice, OfflineBar } from "@/components/molecules/notice";
import { OtpInput } from "@/components/molecules/otp-input";
import { QueueProgress, StepProgress } from "@/components/molecules/progress";
import { Rating, RatingBar, StarInput, Stars } from "@/components/molecules/rating";
import { ListGroup, ListRow } from "@/components/molecules/settings-group";
import { Badge, LiveIndicator, StatusPin, WaitBadge } from "@/components/molecules/status-badges";
import { SegmentedTabs, UnderlineTabs } from "@/components/molecules/tabs";
import { PhoneField, SearchField, TextField } from "@/components/molecules/text-field";
import { SectionHeader, TopBar } from "@/components/molecules/top-bar";
import { useOnline } from "@/lib/hooks/use-online.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { connectivity } from "@/lib/utils/connectivity";
import { colors, spacing } from "@/styles/tokens";

export function ComponentsGallery() {
  const m = useResponsive();
  const online = useOnline();
  const simulated = useSyncExternalStore(connectivity.subscribe, connectivity.isSimulatedOffline);
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [under, setUnder] = useState<"services" | "barbers" | "offers" | "reviews" | "hours">("services");
  const [otp, setOtp] = useState("73");
  const [phone, setPhone] = useState("010234567");
  const [query, setQuery] = useState("بربر");
  const [stars, setStars] = useState(4);
  const [on, setOn] = useState(true);
  const [radio, setRadio] = useState("a");
  const [sel, setSel] = useState("wait");

  return (
    <View style={styles.root}>
      <Block title="Device">
        <Text variant="caption">
          {`${Math.round(m.width)}×${Math.round(m.height)} · ${m.breakpoint}${m.isShort ? " · short" : ""} · gutter ${m.gutter} · fontScale ${PixelRatio.getFontScale().toFixed(2)} · ${online ? "online" : "offline"}`}
        </Text>
        <ListGroup>
          <ListRow title={getLocale() === "ar" ? "Switch to English (LTR)" : "التحويل للعربي (RTL)"} onPress={() => switchLocale(getLocale() === "ar" ? "en" : "ar")} />
          <ListRow title="Show onboarding again" onPress={appPreferences.resetOnboarding} />
          <ListRow title="Simulate offline" subtitle="NetInfo + mock API" trailing={<Toggle value={simulated} onValueChange={connectivity.setSimulatedOffline} accessibilityLabel="Simulate offline" />} />
        </ListGroup>
      </Block>

      <Block title="TopBar / SectionHeader">
        <TopBar title="الصالونات المفضّلة" subtitle="3 صالونات · مرتّبة بأقل انتظار" onBack={() => {}} trailing={<IconButton icon="heart_filled" iconColor={colors.err} accessibilityLabel="favorite" onPress={() => {}} />} />
        <SectionHeader title="تقدر تدخل دلوقتي" action="شوف الكل" onAction={() => {}} />
      </Block>

      <Block title="Buttons">
        <Button label="يلا نبدأ" onPress={() => {}} />
        <Button label="أكّد ودخّلني الطابور" size="xl" onPress={() => {}} />
        <Button label="عندي حساب — تسجيل الدخول" variant="secondary" size="md" onPress={() => {}} />
        <Button label="احجز تاني بنفس الاختيارات" variant="ghost" icon="repeat" size="sm" onPress={() => {}} />
        <Button label="اخرج من الحساب" variant="danger" size="md" onPress={() => {}} />
        <Button label="اطلع من الطابور" variant="dangerOutline" size="sm" onPress={() => {}} />
        <Button label="أنا في المحل" variant="success" size="xl" onPress={() => {}} />
        <Button label="ابعت كود التأكيد" />
        <Button label="دخول" loading onPress={() => {}} />
        <View style={styles.row}>
          <Button label="عدّل" variant="secondary" size="xs" expand={false} onPress={() => {}} />
          <LinkButton label="نسيت كلمة السر؟" onPress={() => {}} />
        </View>
        <View style={styles.row}>
          <IconButton icon="chevron_left" mirror accessibilityLabel="back" onPress={() => {}} />
          <IconButton icon="bell" size={42} dot accessibilityLabel="notifications" onPress={() => {}} />
          <IconButton icon="filter" size={48} variant="active" count={2} accessibilityLabel="filters" onPress={() => {}} />
          <IconButton icon="close" variant="filled" accessibilityLabel="close" onPress={() => {}} />
        </View>
      </Block>

      <Block title="Fields">
        <SegmentedTabs tabs={[{ key: "email", label: "بالبريد الإلكتروني" }, { key: "phone", label: "برقم الموبايل" }]} value={tab} onChange={setTab} />
        <TextField label="البريد الإلكتروني" value="karim.abdelrahman@gmail.com" ltr keyboardType="email-address" />
        <TextField label="كلمة السر" password value="barber2026" />
        <TextField label="البريد الإلكتروني" optional placeholder="karim@example.com" />
        <PhoneField label="رقم الموبايل" value={phone} onChangeText={setPhone} error={phone.length !== 11 ? "الرقم لازم يكون 11 رقم ويبدأ بـ 010 أو 011 أو 012 أو 015" : null} />
        <PhoneField label="رقم الموبايل" value="01023456789" locked />
        <SearchField value={query} onChangeText={setQuery} placeholder="دوّر باسم الصالون أو الخدمة" />
        <TextField label="تحب تضيف كلمة؟" optional multiline placeholder="اكتب رأيك عشان تساعد اللي بعدك…" />
        <OtpInput value={otp} onChange={setOtp} length={4} accessibilityLabel="OTP" autoFocus={false} />
        <OtpInput value="7319" onChange={() => {}} length={4} error accessibilityLabel="OTP error" autoFocus={false} />
      </Block>

      <Block title="Chips" bleed>
        <ChipRail>
          {[["wait", "أقل انتظار دلوقتي"], ["near", "الأقرب ليك"], ["rate", "الأعلى تقييماً"], ["price", "أرخص سعر"]].map(([k, l]) => (
            <Chip key={k} label={l} icon={k === "wait" ? "clock" : undefined} kind={sel === k ? "selected" : "default"} onPress={() => setSel(k)} />
          ))}
        </ChipRail>
        <ChipRail>
          <Chip label="أقل انتظار دلوقتي" kind="lead" onRemove={() => {}} />
          <Chip label="قصة شعر" kind="lead" onRemove={() => {}} />
          <Chip label="بربر لاونج" height={34} onPress={() => {}} onRemove={() => {}} />
          <Chip label="5 نجوم" height={32} onPress={() => {}} />
        </ChipRail>
        <UnderlineTabs
          tabs={[{ key: "services", label: "الخدمات" }, { key: "barbers", label: "الحلاقين" }, { key: "offers", label: "العروض" }, { key: "reviews", label: "التقييمات" }, { key: "hours", label: "المواعيد" }]}
          value={under}
          onChange={setUnder}
        />
      </Block>

      <Block title="Status">
        <WaitBadge status="free" label="فاضي دلوقتي — ادخل على طول" />
        <WaitBadge status="short" label="فاضل 1 — استنى ~10 د" />
        <WaitBadge status="mid" label="فاضل 2 أنفار — استنى ~15 د" />
        <WaitBadge status="busy" label="فاضل 5 أنفار — استنى ~45 د" />
        <WaitBadge status="closed" label="بيفتح الساعة 12 م" />
        <WaitBadge status="stale" label="الانتظار مش متحدّث" />
        <View style={[styles.row, styles.pinBg]}>
          <StatusPin status="free" label="فاضي دلوقتي" />
          <StatusPin status="mid" label="فاضل 2" />
          <StatusPin status="busy" label="فاضل 5" />
        </View>
        <View style={styles.row}>
          <Badge label="مستني تأكيد الصالون" kind="soon" />
          <Badge label="خدمة تمّت" kind="done" icon="check" />
          <Badge label="اتلغى — ما حضرتش" kind="missed" />
          <Badge label="✓ متأكّد" kind="success" />
          <LiveIndicator />
        </View>
      </Block>

      <Block title="Rating">
        <Rating value={4.8} count={214} />
        <Stars value={4} />
        <StarInput value={stars} onChange={setStars} />
        <StarInput value={3} onChange={() => {}} size={18} />
        <RatingBar label="جودة القصة" value={4.9} />
        <RatingBar label="دقة الوقت" value={4.2} warn />
      </Block>

      <Block title="Progress">
        <StepProgress step={2} />
        <QueueProgress stage="waiting" />
        <QueueProgress stage="almost" />
        <QueueProgress stage="your_turn" />
      </Block>

      <Block title="Notices" bleed>
        <OfflineBar updatedAt="9:32" onRetry={() => {}} />
        <View style={[styles.gap, { paddingHorizontal: m.gutter }]}>
          <Notice>مش هينفع تدخل الطابور وانت من غير نت — استنى ما الشبكة ترجع.</Notice>
          <Notice tone="primary" icon="bell">هنبعتلك إشعار لما يفضل قدامك اتنين، وبعدين واحد، وبعدين لما يجي دورك.</Notice>
          <Notice tone="warning" title="لما يجي دورك عندك 5 دقايق تحضر.">لو ما حضرتش، دورك بيتأخر مركز واحد وبعدها بيتلغى.</Notice>
          <Notice tone="success" icon="check" title="فاضي دلوقتي — مفيش دور">3 كراسي شغّالة · 2 حلاقين في الشيفت</Notice>
        </View>
      </Block>

      <Block title="Lists & controls">
        <ListGroup label="التطبيق">
          <ListRow icon="globe" title="اللغة" value="العربية" onPress={() => {}} />
          <ListRow icon="bell" title="تحديثات الطابور" subtitle="فاضلك اتنين · فاضلك واحد · حان دورك" trailing={<Toggle value locked accessibilityLabel="تحديثات الطابور" />} />
          <ListRow title="عروض صالونات جديدة قريبة مني" trailing={<Toggle value={on} onValueChange={setOn} accessibilityLabel="عروض" />} />
          <ListRow icon="logout" title="تسجيل الخروج" danger onPress={() => {}} />
        </ListGroup>
        <View style={styles.row}>
          <RadioGroup value={radio} onValueChange={setRadio} style={styles.row}>
            <Radio value="a" accessibilityLabel="radio a" />
            <Radio value="b" accessibilityLabel="radio b" />
          </RadioGroup>
          <Checkbox checked onPress={() => {}} accessibilityLabel="check on" />
          <Checkbox checked={false} onPress={() => {}} accessibilityLabel="check off" />
          {([84, 64, 52, 42, 36] as const).map((s) => (
            <Avatar key={s} name="كريم عبد الرحمن" size={s} />
          ))}
        </View>
        <Skeleton height={86} radius={12} />
        <Skeleton height={14} width="60%" strong />
      </Block>

      <Block title="Empty state">
        <EmptyState illustration="empty_bookings" title="لسه ما حجزتش أي حاجة" message="أول ما تدخل طابور صالون، هتلاقي دورك ورقمك والوقت المتوقع هنا على طول.">
          <Button label="دوّر على صالون قريب منك" expand={false} onPress={() => {}} />
        </EmptyState>
      </Block>
    </View>
  );
}

function Block({ title, bleed, children }: { title: string; bleed?: boolean; children: React.ReactNode }) {
  const { gutter } = useResponsive();
  return (
    <View style={[styles.gap, bleed && { marginHorizontal: -gutter }]}>
      <Text variant="sectionTitle" style={bleed && { paddingHorizontal: gutter }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.xxxl },
  gap: { gap: spacing.md },
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.md },
  pinBg: { backgroundColor: colors.surf, padding: spacing.md, borderRadius: 12 },
});
