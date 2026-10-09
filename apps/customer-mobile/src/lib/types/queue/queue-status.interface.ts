// حالة الدور الحية لحجز معين
import type { Punctuality } from "./punctuality.enum";

export interface QueueStatus {
  bookingId: string;
  queueNumber: number;
  peopleAhead: number;
  estimatedStartAt: string;
  punctuality: Punctuality;
  delayMinutes: number;
  isYourTurn: boolean;
}
