// دورك دلوقتي — شاشة كاملة لما يوصل دورك
import type { QueueStatus } from "@/lib/types/queue";

export function YourTurnState({ status }: { status: Pick<QueueStatus, "queueNumber" | "isYourTurn"> }) {
  if (!status.isYourTurn) return null;
  return (
    <section role="status" aria-live="assertive" className="flex min-h-[60vh] flex-col items-center justify-center gap-3 rounded-2xl bg-primary p-8 text-center text-primary-foreground">
      <p className="text-5xl font-extrabold tabular-nums">{status.queueNumber}</p>
      <h2 className="text-2xl font-bold">دورك دلوقتي</h2>
      <p className="text-sm opacity-90">اتفضل ادخل للحلاق</p>
    </section>
  );
}
