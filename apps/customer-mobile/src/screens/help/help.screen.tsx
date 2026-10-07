// المساعدة والدعم (فريم 42) — زي HelpPage في Flutter: بحث في الأسئلة، سؤال واحد مفتوح في المرة (@rn-primitives/accordion)،
// أول سؤال "دوري اتلغى وأنا في المحل" لأنه أكتر مشكلة هتتكرر. مفيش "شات مع الدعم" (مفيش شات — GAPS)، الاتصال بس.
import * as Accordion from "@rn-primitives/accordion";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { Notice } from "@/components/molecules/notice";
import { ListGroup, ListRow } from "@/components/molecules/settings-group";
import { SearchField } from "@/components/molecules/text-field";
import { TopBar } from "@/components/molecules/top-bar";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { callPhone } from "@/lib/utils/external-links";
import { normalizeArabic } from "@/lib/utils/salons/arabic-normalize.utils";
import { colors, radius } from "@/styles/tokens";

const SUPPORT_NUMBER = "19245";
const TERMS_URL = "https://beltadreeg.com/terms";
const PRIVACY_URL = "https://beltadreeg.com/privacy";
const FAQ = ["cancelledWhileThere", "wrongEstimate", "noTurnAlert", "leaveQueue", "priceMismatch", "changePhone"] as const;

function FaqTrigger({ question }: { question: string }) {
  const { isExpanded } = Accordion.useItemContext();
  return (
    <Accordion.Trigger asChild>
      <Pressable pressedScale={0.99} style={styles.question}>
        <Text variant="body" style={styles.flex}>
          {question}
        </Text>
        <View style={isExpanded && styles.flip}>
          <Icon name="chevron_down" size={16} color={colors.textDisabled} />
        </View>
      </Pressable>
    </Accordion.Trigger>
  );
}

export default function HelpScreen() {
  const t = useTranslations("mobile");
  const f = useFormat();
  const { gutter, formMaxWidth } = useResponsive();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | undefined>();
  const q = normalizeArabic(query.trim());
  const faqs = FAQ.filter((k) => !q || normalizeArabic(`${t(`help.faq.${k}.q`)} ${t(`help.faq.${k}.a`)}`).includes(q));
  const column = { paddingHorizontal: gutter, maxWidth: formMaxWidth };
  const hours = { from: f.number(10), to: f.number(12) };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={[styles.column, column]}>
        <TopBar title={t("screens.help")} />
      </View>
      <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.column, styles.content, column]}>
        <SearchField
          value={query}
          onChangeText={(v) => {
            setQuery(v);
            setOpen(undefined);
          }}
          placeholder={t("help.searchHint")}
        />
        <View style={styles.live}>
          <Icon name="message" size={22} color={colors.tealDark} />
          <View style={styles.flex}>
            <Text variant="bodyStrong" weight="extrabold" color={colors.tealDark}>
              {t("help.liveTitle")}
            </Text>
            <Text variant="meta" weight="semibold" color={colors.tealDark}>
              {t("help.liveBody", { mins: f.number(5), ...hours })}
            </Text>
          </View>
        </View>

        {faqs.length ? (
          <Accordion.Root type="single" collapsible value={open} onValueChange={(v) => setOpen(v as string | undefined)}>
            <ListGroup label={t("help.faqHeader")}>
              {faqs.map((k) => (
                <Accordion.Item key={k} value={k}>
                  <Accordion.Header>
                    <FaqTrigger question={t(`help.faq.${k}.q`)} />
                  </Accordion.Header>
                  <Accordion.Content>
                    <Text variant="bodySm" color={colors.textSecondary} style={styles.answer}>
                      {t(`help.faq.${k}.a`)}
                    </Text>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </ListGroup>
          </Accordion.Root>
        ) : (
          <View style={styles.noResults}>
            <Notice>{t("help.noResults")}</Notice>
          </View>
        )}

        <ListGroup label={t("help.contactHeader")}>
          <ListRow icon="phone" title={t("help.callUs")} subtitle={t("help.callUsValue", { number: f.digits(SUPPORT_NUMBER), ...hours })} onPress={() => callPhone(SUPPORT_NUMBER)} />
        </ListGroup>
        <ListGroup label={t("help.aboutHeader")}>
          <ListRow title={t("help.terms")} onPress={() => void WebBrowser.openBrowserAsync(TERMS_URL)} />
          <ListRow title={t("help.privacy")} onPress={() => void WebBrowser.openBrowserAsync(PRIVACY_URL)} />
          <ListRow title={t("help.version")} value={f.ltr(Constants.expoConfig?.version ?? "")} />
        </ListGroup>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, minWidth: 0 },
  column: { width: "100%", alignSelf: "center" },
  content: { paddingTop: 20, paddingBottom: 24 },
  live: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.tealTint, borderRadius: radius.card, padding: 16, marginTop: 20, marginBottom: 22 },
  question: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 15, minHeight: 52 },
  flip: { transform: [{ rotate: "180deg" }] },
  answer: { paddingBottom: 14 },
  noResults: { marginBottom: 14 },
});
