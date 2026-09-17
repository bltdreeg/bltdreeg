// يحسب رقمك في الدور وعدد اللي قدامك والالتزام بالمواعيد
import type { Booking } from "../types/booking/booking.interface.ts";
import { Punctuality } from "../types/queue/punctuality.enum.ts";
import type { QueueStatus } from "../types/queue/queue-status.interface.ts";

export const RUNNING_LATE_THRESHOLD_MINUTES = 10;

/** رقمك في الدور = ترتيب ميعادك بين حجوزات نفس اليوم (يبدأ من 1) */
export function computeQueueNumber(startAt: string, sameDayStartTimes: string[]): number {
  const mine = Date.parse(startAt);
  return 1 + sameDayStartTimes.filter((t) => Date.parse(t) < mine).length;
}

/** عدد اللي قدامك = رقمك ناقص اللي خلصوا، بدون العد للسالب */
export function computePeopleAhead(queueNumber: number, completedCount: number): number {
  return Math.max(0, queueNumber - completedCount - 1);
}

export function computePunctuality(
  delayMinutes: number,
  threshold = RUNNING_LATE_THRESHOLD_MINUTES,
): Punctuality {
  return delayMinutes >= threshold ? Punctuality.RUNNING_LATE : Punctuality.ON_TIME;
}

export function computeEstimatedStart(startAt: string, delayMinutes: number): string {
  return new Date(Date.parse(startAt) + delayMinutes * 60_000).toISOString();
}

export function buildQueueStatus(
  booking: Pick<Booking, "id" | "startAt" | "queueNumber">,
  live: { completedCount: number; delayMinutes: number },
): QueueStatus {
  const peopleAhead = computePeopleAhead(booking.queueNumber, live.completedCount);
  return {
    bookingId: booking.id,
    queueNumber: booking.queueNumber,
    peopleAhead,
    estimatedStartAt: computeEstimatedStart(booking.startAt, live.delayMinutes),
    punctuality: computePunctuality(live.delayMinutes),
    delayMinutes: live.delayMinutes,
    isYourTurn: peopleAhead === 0,
  };
}
