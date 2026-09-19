"use client";

// كارت "حان دورك" — مطابق لتصميم مرحلة استدعاء الكرسي
import { Scissors } from "lucide-react";

interface YourTurnQueueCardProps {
  queueNumber?: number;
  barberName?: string;
  timeLeftSeconds?: number;
  onCheckIn: () => void;
  onPostpone: () => void;
  onLeaveQueue: () => void;
}

export function YourTurnQueueCard({
  queueNumber = 2,
  barberName = "كريم مصطفى",
  timeLeftSeconds = 294,
  onCheckIn,
  onPostpone,
  onLeaveQueue,
}: YourTurnQueueCardProps) {
  const mins = Math.floor(timeLeftSeconds / 60);
  const secs = timeLeftSeconds % 60;
  const timeFormatted = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="flex w-full flex-col items-center text-center gap-4 py-2">
      {/* 1. أيقونة المقص داخل دائرة خضراء مضيئة */}
      <div className="relative flex size-20 sm:size-24 items-center justify-center rounded-full bg-[#E7F4EA]">
        <div className="flex size-14 sm:size-16 items-center justify-center rounded-full bg-[#16A34A] shadow-md">
          <Scissors className="size-7 sm:size-8 text-white -rotate-45" />
        </div>
      </div>

      {/* 2. العنوان ونصوص التوجيه */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl sm:text-3xl font-black text-[#15803D]">
          حان دورك
        </h2>
        <p className="text-sm sm:text-base font-semibold text-muted-foreground">
          ادخل على الكرسي — {barberName} مستنيك
        </p>
      </div>

      {/* 3. بوكس العداد ورقم الدور */}
      <div className="w-full rounded-2xl bg-[#E7F4EA]/85 border border-[#D1EBD6] p-5 shadow-xs">
        <div className="grid grid-cols-2 divide-x divide-[#C1E2C8] rtl:divide-x-reverse text-center">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-[#15803D]">رقمك</span>
            <span className="mt-1 text-3xl sm:text-4xl font-black text-[#15803D] tabular font-mono">
              {queueNumber}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-[#15803D]">فاضلك</span>
            <span className="mt-1 text-3xl sm:text-4xl font-black text-[#15803D] tabular font-mono">
              {timeFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* 4. التنبيه التحذيري */}
      <p className="text-xs font-medium text-muted-foreground leading-relaxed px-2">
        لو ما حضرتش خلال 5 دقايق، دورك هيتأخر مركز واحد
      </p>

      {/* 5. أزرار الإجراءات */}
      <div className="flex w-full flex-col gap-2.5 pt-2">
        {/* زر أنا في المحل */}
        <button
          type="button"
          onClick={onCheckIn}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-[#16A34A] text-sm sm:text-base font-extrabold text-white shadow-md hover:bg-[#15803D] active:scale-98 transition-all cursor-pointer"
        >
          أنا في المحل
        </button>

        {/* زر أنا جاي — أجلني واحد */}
        <button
          type="button"
          onClick={onPostpone}
          className="flex h-12 w-full items-center justify-center rounded-xl border border-border bg-card text-sm font-extrabold text-foreground hover:bg-muted active:scale-98 transition-all cursor-pointer"
        >
          أنا جاي — أجّلني واحد
        </button>

        {/* زر اطلع من الطابور */}
        <button
          type="button"
          onClick={onLeaveQueue}
          className="pt-1 text-xs font-extrabold text-[#EF4444] hover:underline cursor-pointer"
        >
          اطلع من الطابور
        </button>
      </div>
    </div>
  );
}

