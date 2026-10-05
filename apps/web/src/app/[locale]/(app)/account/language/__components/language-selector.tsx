"use client";

import { useState } from "react";
import { Globe, Check, AlertCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils/cn.utils";

const LANGUAGES_META = [
  {
    code: "ar",
    name: "العربية",
    nativeName: "العربية",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
  },
];

export function LanguageSelector() {
  const t = useTranslations("app.account.language");
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedLang, setSelectedLang] = useState(currentLocale);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [targetLocale, setTargetLocale] = useState<string | null>(null);

  const handleSelect = (code: string) => {
    if (code === currentLocale) return;
    setTargetLocale(code);
    setConfirmModalOpen(true);
  };

  const handleConfirmSwitch = () => {
    if (!targetLocale) return;
    setConfirmModalOpen(false);
    setSelectedLang(targetLocale);
    router.replace(pathname, { locale: targetLocale as "ar" | "en" });
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="grid grid-cols-1 gap-3.5">
        {LANGUAGES_META.map((lang) => {
          const isCurrent = lang.code === currentLocale;
          const dirText = lang.code === "ar" ? t("arDir") : t("enDir");
          const descText = lang.code === "ar" ? t("arDesc") : t("enDesc");

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              className={cn(
                "flex items-start gap-4 rounded-2xl border p-5 text-start transition-all cursor-pointer shadow-xs",
                isCurrent
                  ? "border-primary bg-tint/30 ring-2 ring-primary/20"
                  : "border-border bg-card hover:bg-muted/40"
              )}
            >
              {/* الراديو الدائري المخصص */}
              <div
                className={cn(
                  "mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-full border transition-all",
                  isCurrent
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card"
                )}
              >
                {isCurrent && <Check className="size-3.5 stroke-[3]" />}
              </div>

              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-foreground">
                      {lang.nativeName}
                    </span>
                    {lang.code !== "ar" && (
                      <span className="text-xs text-muted-foreground">({lang.name})</span>
                    )}
                  </div>
                  {isCurrent && (
                    <span className="rounded-md bg-tint px-2 py-0.5 text-xs font-bold text-primary-pressed border border-tint-border">
                      {t("currentBadge")}
                    </span>
                  )}
                </div>

                <span className="text-xs font-semibold text-muted-foreground">
                  {dirText}
                </span>
                <p className="mt-1 text-xs text-muted-foreground/90 leading-relaxed">
                  {descText}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* حوار التأكيد عند تغيير اللغة — مطابق لـ FRAME 38 */}
      <Dialog.Root open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl text-start">
            <div className="flex size-12 items-center justify-center rounded-xl bg-tint text-primary-pressed mb-4">
              <Globe className="size-6" />
            </div>

            <Dialog.Title className="text-lg font-extrabold text-foreground">
              {targetLocale === "en" ? t("modal.titleEn") : t("modal.titleAr")}
            </Dialog.Title>

            <Dialog.Description className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {targetLocale === "en" ? t("modal.descEn") : t("modal.descAr")}
            </Dialog.Description>

            <div className="mt-6 flex flex-col gap-2.5">
              <Button
                type="button"
                onClick={handleConfirmSwitch}
                className="h-11 w-full text-xs font-extrabold shadow-xs"
              >
                {targetLocale === "en" ? t("modal.confirmEn") : t("modal.confirmAr")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmModalOpen(false)}
                className="h-11 w-full text-xs font-bold border-border bg-card text-foreground hover:bg-muted"
              >
                {currentLocale === "ar" ? t("modal.cancelKeepAr") : t("modal.cancelKeepEn")}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

