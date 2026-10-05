'use client';
// زرار نسخ العنوان — مطابق لـ FRAME 04: زر أبيض بإطار ناعم وارتفاع 38px
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function CopyAddressButton({ address }: { address: string }) {
  const t = useTranslations("marketing.salon.hours");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-[38px] items-center gap-1.5 rounded-[9px] border border-border bg-card px-4 text-[13px] font-bold text-foreground transition-colors hover:bg-muted cursor-pointer"
    >
      {copied ? <Check className="size-3.5 text-success-strong" /> : <Copy className="size-3.5 text-muted-foreground" />}
      <span>{copied ? t("copied") : t("copyAddress")}</span>
    </button>
  );
}
