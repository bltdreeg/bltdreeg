"use client";

import { useState } from "react";
import {
  Search,
  MessageSquare,
  Phone,
  ChevronDown,
  FileText,
  Shield,
  Info,
  Clock,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils/cn.utils";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: "cancelled-at-salon",
    question: "دوري اتلغى وأنا في المحل — أعمل إيه؟",
    answer:
      "لو وصلت المحل ولقيت دورك اتلغى من غير ما تطلب، اطلب من الكابتن أو الريسيبشن يثبّت ميعادك يدوي، أو اضغط على شات الدعم الفوري تحت وهنرجعلك دورك ونكلّم الصالون في دقيقتين.",
  },
  {
    id: "wrong-time",
    question: "الوقت المتوقع طلع غلط والانتظار طول",
    answer:
      "وقت الطابور بيتحسب تلقائياً حسب متوسط مدة الحلاقة لكل عميل قدامك. في أوقات الذروة أو لو عميل طلب خدمة إضافية ممكن يحصل تأخير 10-15 دقيقة. بنحدث وقتك الحي تلقائياً.",
  },
  {
    id: "no-notification",
    question: "ما وصلنيش إشعار «حان دورك»",
    answer:
      "اتأكد إنك مفعل إشعارات المتصفح لـ بالتدريج، ورقم موبايلك عليه واتساب نشط، لأننا بنبعت الإشعار عبر التطبيق وواتساب في نفس اللحظة لما يتبقى قدامك عميل واحد.",
  },
  {
    id: "leave-queue",
    question: "إزاي أطلع من الطابور أو ألغي الحجز؟",
    answer:
      "تقدر تلغي حجزك مجاناً لحد ساعتين قبل الميعاد من صفحة تفاصيل الحجز، أو من صفحة متابعة الطابور بالضغط على «الخروج من الطابور».",
  },
  {
    id: "price-difference",
    question: "الصالون حاسبني بسعر غير المكتوب في التطبيق",
    answer:
      "الأسعار في بالتدريج ملزمة للصالون. لو اتحاسبت بأكتر من المعروض، احتفظ بالفاتورة وكلمنا فوراً في الشات، وبنردلك فرق السعر رصيد في حسابك بعد التأكد مع الإدارة.",
  },
  {
    id: "change-phone",
    question: "إزاي أغيّر رقم موبايلي المسجل؟",
    answer:
      "تقدر تغيّر رقمك من صفحة «بياناتي الشخصية» بالضغط على «غيّر الرقم»، وهنبعتلك كود تأكيد OTP على الرقم الجديد لتأمينه.",
  },
];

export function HelpView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("cancelled-at-salon");

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* العمود الرئيسي: البحث والأسئلة الشائعة */}
        <main className="flex flex-col gap-5 lg:col-span-8">
          {/* 1 — شريط الطوارئ لمشاكل الطابور (Frame 42) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl bg-tint/80 border border-tint-border/80 p-5 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-card text-primary-pressed shadow-xs">
                <MessageSquare className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] font-extrabold text-primary-pressed">
                  عندك مشكلة في دور دلوقتي؟
                </span>
                <span className="text-xs text-muted-foreground">
                  فريق الدعم بيرد خلال 5 دقائق يومياً من 10 ص حتى 12 منتصف الليل.
                </span>
              </div>
            </div>
            <a
              href="https://wa.me/201023456789"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-xs font-extrabold text-white shadow-xs hover:bg-primary-hover transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <span>كلمنا واتساب</span>
              <ExternalLink className="size-3.5" />
            </a>
          </div>

          {/* 2 — شريط البحث */}
          <div className="relative">
            <Search className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="دوّر على مشكلتك أو سؤالك…"
              className="h-12 w-full rounded-2xl border border-border bg-card ps-11 pe-4 text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 shadow-xs"
            />
          </div>

          {/* 3 — قائمة الأسئلة الشائعة الأكورديون */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-foreground">
              أكتر أسئلة بتتسأل
            </h2>

            <div className="flex flex-col gap-2.5">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => {
                  const isExpanded = expandedId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                        className="flex w-full items-center justify-between gap-3 p-4 text-start font-bold text-[14.5px] text-foreground hover:bg-muted/40 cursor-pointer"
                        aria-expanded={isExpanded}
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                            isExpanded && "rotate-180 text-primary"
                          )}
                        />
                      </button>

                      {isExpanded && (
                        <div className="border-t border-border/60 bg-muted/20 px-4 py-3.5 text-xs sm:text-[13px] leading-relaxed text-muted-foreground">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                  <p className="text-sm font-semibold">مفيش نتائج مطابقة لبحثك</p>
                  <p className="mt-1 text-xs">جرب تبحث بكلمات تانية أو كلمنا مباشرة على الدعم.</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* العمود الجانبي: قنوات التواصل ومعلومات التطبيق */}
        <aside className="flex flex-col gap-5 lg:col-span-4">
          {/* كارت قنوات التواصل */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col gap-4">
            <h2 className="text-sm font-extrabold text-foreground border-b border-border pb-3">
              كلّمنا مباشرة
            </h2>

            {/* شات الدعم */}
            <a
              href="https://wa.me/201023456789"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 hover:bg-muted/60 transition-colors cursor-pointer"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-tint text-primary-pressed">
                <MessageSquare className="size-5" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-bold text-foreground">شات مع الدعم</span>
                <span className="text-xs text-muted-foreground">متصل الآن عبر واتساب</span>
              </div>
              <span className="size-2.5 rounded-full bg-[#16A34A] animate-pulse" />
            </a>

            {/* الاتصال الهاتفي */}
            <a
              href="tel:19245"
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 hover:bg-muted/60 transition-colors cursor-pointer"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-tint text-primary-pressed">
                <Phone className="size-5" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-bold text-foreground">اتصل بينا</span>
                <span className="text-xs font-mono font-bold text-primary-pressed">19245</span>
              </div>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="size-3" />
                <span>10ص - 12ص</span>
              </span>
            </a>
          </div>

          {/* كارت عن التطبيق والشروط */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col gap-3">
            <h2 className="text-sm font-extrabold text-foreground border-b border-border pb-2.5">
              عن بالتدريج
            </h2>

            <div className="flex flex-col divide-y divide-border/60 text-xs">
              <div className="flex items-center justify-between py-2.5 text-muted-foreground hover:text-foreground cursor-pointer">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="font-semibold">شروط الاستخدام</span>
                </div>
                <span className="text-xs">←</span>
              </div>

              <div className="flex items-center justify-between py-2.5 text-muted-foreground hover:text-foreground cursor-pointer">
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-muted-foreground" />
                  <span className="font-semibold">سياسة الخصوصية</span>
                </div>
                <span className="text-xs">←</span>
              </div>

              <div className="flex items-center justify-between pt-2.5 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Info className="size-4 text-muted-foreground" />
                  <span className="font-semibold">نسخة التطبيق</span>
                </div>
                <span className="font-mono text-xs tabular font-bold text-foreground">
                  2.4.1 (build 318)
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

