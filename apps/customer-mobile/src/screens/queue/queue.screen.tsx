// دورك (فريم 27–30): بتفضل مفتوحة وبتتحدّث لايف (كل ٥ ثواني والطابور شغّال)، والشاشة مابتطفيش. اهتزاز مع تغيّر المرحلة،
// وتنبيه للتأجيل والأخطاء. الخروج دايماً بتأكيد بيقول الأثر الحقيقي (فريم 30). الميعاد الجاي: "الغي الحجز" (Flutter).
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Button, LinkButton } from "@/components/molecules/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { LiveIndicator } from "@/components/molecules/status-badges";
import { useToast } from "@/components/molecules/toast";
import { TopBar } from "@/components/molecules/top-bar";
import { ConfirmDialog } from "@/components/organs/confirm-dialog";
import { NoConnection } from "@/components/organs/no-connection";
import { useBooking, useBookingLabels, useQueueAction } from "@/lib/hooks/booking";
import { useSalonPage } from "@/lib/hooks/salons";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useOnline } from "@/lib/hooks/use-online.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import type { QueueAction } from "@/lib/actions/booking/booking.action";
import type { QueueBooking, QueueStage } from "@/lib/types/booking";
import type { ApiError } from "@/lib/utils/api/api-error";
import { isRunning, queueStage } from "@/lib/utils/booking/booking-pricing";
import { colors } from "@/styles/tokens";
import { duration } from "@/theme/motion";
import { Ended, goHome, InService, Upcoming } from "./__sections/after-turn";
import { Tracking } from "./__sections/tracking";
import { YourTurn } from "./__sections/your-turn";

function KeepAwake() {
  useKeepAwake();
  return null;
}

/** ساعة بتدق كل ثانية — للعدّاد بس (وقفت = آخر قيمة) */
function useNow(ticking: boolean) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!ticking) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [ticking]);
  return now;
}

function Live({ booking, live, updatedAt }: { booking: QueueBooking; live: boolean; updatedAt: number }) {
  const t = useTranslations("mobile");
  const f = useFormat();
  const labels = useBookingLabels();
  const { gutter } = useResponsive();
  const page = useSalonPage(booking.salonId).data;
  const action = useQueueAction(booking.id);
  const { toast, show } = useToast();
  const [leaving, setLeaving] = useState(false);
  const stage = queueStage(booking);
  const now = useNow(stage === "yourTurn");

  // اهتزاز مع تغيّر المرحلة؛ الرجوع من "حان دورك" لطابور بعد التأجيل = تنبيه
  const prev = useRef<QueueStage>(stage);
  useEffect(() => {
    const from = prev.current;
    prev.current = stage;
    if (from === stage) return;
    if (from === "yourTurn" && (stage === "waiting" || stage === "approaching") && booking.postponeUsed) show(t("queue.postponedToast"));
    else if (stage === "yourTurn") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    else if (stage === "approaching" || stage === "completed") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [stage, booking.postponeUsed, show, t]);

  const errorText = (e: ApiError) => {
    switch (e.code) {
      case "http.network":
        return t("queue.errors.offline");
      case "booking.not_your_turn":
        return t("queue.errors.notYourTurn");
      case "booking.postpone_used":
        return t("queue.errors.postponeUsed");
      case "booking.finished":
        return t("queue.errors.finished");
      default:
        return t("booking.errors.generic");
    }
  };
  const run = (a: QueueAction) => action.mutate(a, { onError: (e) => show(errorText(e)) });
  const pending = action.isPending ? action.variables : null;

  const yourTurn = stage === "yourTurn";
  const ongoing = isRunning(booking);
  const upcoming = stage === "upcoming";
  const leaveLabel = upcoming ? t("queue.cancel") : t("queue.leave");
  const openLeave = () => setLeaving(true);
  const leave = yourTurn ? (
    <LinkButton label={leaveLabel} color={colors.err} onPress={pending ? undefined : openLeave} />
  ) : (
    <Button label={leaveLabel} variant="dangerOutline" size="sm" loading={pending === "leave"} disabled={pending !== null} onPress={openLeave} />
  );

  let body;
  if (stage === "waiting" || stage === "approaching") body = <Tracking booking={booking} page={page} approaching={stage === "approaching"} now={updatedAt} leave={leave} />;
  else if (yourTurn) body = <YourTurn booking={booking} now={now} pending={pending} onCheckIn={() => run("check-in")} onPostpone={() => run("postpone")} leave={leave} />;
  else if (upcoming) body = <Upcoming booking={booking} page={page} leave={leave} />;
  else if (stage === "inService") body = <InService booking={booking} page={page} />;
  else body = <Ended booking={booking} />;

  return (
    <>
      {ongoing && <KeepAwake />}
      <View style={{ paddingHorizontal: gutter }}>
        {/* عند "حان دورك" المفروض يتحرك مش يتفرج — من غير رجوع ولا عنوان (زي Flutter) */}
        <TopBar title={yourTurn ? undefined : t("screens.queue")} onBack={yourTurn ? null : undefined} trailing={ongoing ? <LiveIndicator active={live} /> : undefined} />
      </View>
      {/* waiting و approaching نفس الشكل بيتلوّن في مكانه */}
      <Animated.View key={stage === "approaching" ? "waiting" : stage} entering={FadeIn.duration(duration.medium)} style={styles.flex}>
        {body}
      </Animated.View>
      <ConfirmDialog
        open={leaving}
        onOpenChange={setLeaving}
        {...(upcoming
          ? {
              icon: "calendar" as const,
              title: t("queue.cancelDialog.title"),
              message: t("queue.cancelDialog.body", { time: labels.timing(booking.startAt) }),
              confirmLabel: t("queue.cancelDialog.confirm"),
              cancelLabel: t("queue.cancelDialog.keep"),
            }
          : {
              icon: "logout" as const,
              title: t("queue.leaveDialog.title"),
              message: t("queue.leaveDialog.body", { n: f.number(booking.ticketNumber) }),
              note: t("queue.leaveDialog.note"),
              confirmLabel: t("queue.leaveDialog.confirm"),
              cancelLabel: t("queue.leaveDialog.stay"),
            })}
        onConfirm={() => {
          setLeaving(false);
          run("leave");
        }}
      />
      {toast}
    </>
  );
}

export default function QueueScreen() {
  const t = useTranslations("mobile");
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const online = useOnline();
  const q = useBooking(bookingId);

  let content;
  if (q.data) content = <Live booking={q.data} live={online && !q.isRefetchError} updatedAt={q.dataUpdatedAt} />;
  else if (!q.isError && online) content = <ActivityIndicator style={styles.flex} color={colors.teal} />;
  else if (!online) content = <NoConnection onRetry={() => void q.refetch()} retrying={q.isFetching} />;
  else
    content = (
      <View style={styles.center}>
        <EmptyState illustration="empty_bookings" illustrationWidth={170} title={t("booking.errors.loadFailed")} message={t("booking.errors.generic")}>
          <Button label={t("booking.retry")} icon="refresh" onPress={() => void q.refetch()} />
          <Button label={t("booking.backHome")} variant="secondary" onPress={goHome} />
        </EmptyState>
      </View>
    );

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: "center" },
});
