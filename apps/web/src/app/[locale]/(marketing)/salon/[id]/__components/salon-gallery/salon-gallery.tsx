"use client";
// معرض صور الصالون — زوايا ناعمة 14px وشبكة ثلاثية أنيقة، مع لايت بوكس لعرض كل الصور
import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, Heart, X } from "lucide-react";
import { useFavorites } from "@/lib/hooks/favorites/use-favorites.hook";
import { useToast } from "@/components/atoms/toast";
import { ROUTE_FAVORITES } from "@/lib/data/constants/routes.constants";
import { cn } from "@/lib/utils/cn.utils";

type SalonGalleryProps = {
  photos: string[];
  name: string;
  salonId?: string;
};

export function SalonGallery({ photos, name, salonId }: SalonGalleryProps) {
  const t = useTranslations("marketing.salon.gallery");
  const tInfo = useTranslations("marketing.salon.info");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const isFav = salonId ? isFavorite(salonId) : false;

  const [main, ...rest] = photos;
  const side = rest.slice(0, 2);
  const total = photos.length;

  const activePhoto = openIndex !== null ? photos[openIndex] : null;

  function showPrev() {
    setOpenIndex((i) => (i === null ? i : (i - 1 + total) % total));
  }
  function showNext() {
    setOpenIndex((i) => (i === null ? i : (i + 1) % total));
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!salonId) return;
    toggleFavorite(salonId);
    if (!isFav) {
      toast.success(
        tInfo("toasts.addedTitle"),
        tInfo("toasts.addedDesc", { name }),
        { label: tInfo("toasts.viewFavorites"), href: ROUTE_FAVORITES }
      );
    } else {
      toast.info(tInfo("toasts.removedTitle"), tInfo("toasts.removedDesc", { name }));
    }
  };

  return (
    <>
      <div className="flex h-[240px] sm:h-[340px] md:h-[380px] w-full gap-2 sm:gap-3">
        {/* الصورة الرئيسية العريضة */}
        <div className="relative flex-1 overflow-hidden rounded-none lg:rounded-[14px] bg-white border-b lg:border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] sm:flex-[2]">
          {main ? (
            <button
              type="button"
              onClick={() => setOpenIndex(0)}
              className="absolute inset-0 cursor-pointer"
              aria-label={t("viewPhotos", { name })}
            >
              <Image
                src={main}
                alt={name}
                fill
                priority
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover"
              />
            </button>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(135deg,#F8FAFC_0_10px,#EDEFF2_10px_20px)]">
              <span className="font-mono text-xs font-medium tracking-widest text-slate-400">
                {name}
              </span>
            </div>
          )}

          {/* كبسولة «كل الصور» الطافية */}
          {total > 0 && (
            <button
              type="button"
              onClick={() => setOpenIndex(0)}
              className="absolute bottom-4 start-4 flex h-8 items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/95 px-3.5 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-xs hover:bg-white transition-all cursor-pointer"
            >
              <span>{t("allPhotos")}</span>
              <span className="text-slate-300">·</span>
              <span className="tabular font-bold">{total}</span>
            </button>
          )}

          {/* زر المفضلة العائم على الصورة — مطابق لتصميم الموبايل */}
          {salonId && (
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={cn(
                "absolute top-3 end-3 z-10 flex size-9 sm:size-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xs transition-all hover:bg-white cursor-pointer active:scale-95",
                isFav ? "text-destructive" : "text-slate-600 hover:text-destructive"
              )}
              aria-label={isFav ? tInfo("removeAria") : tInfo("addAria")}
            >
              <Heart
                className={cn(
                  "size-5 transition-transform",
                  isFav ? "fill-destructive text-destructive" : "text-slate-600"
                )}
              />
            </button>
          )}
        </div>

        {/* العمود الجانبي للصور — يظهر من الشاشات المتوسطة والكبيرة */}
        <div className="hidden sm:flex flex-1 flex-col gap-2 sm:gap-3">
          {/* الصورة العلوية */}
          <div className="relative flex-1 overflow-hidden rounded-[14px] bg-white border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            {side[0] ? (
              <button
                type="button"
                onClick={() => setOpenIndex(1)}
                className="absolute inset-0 cursor-pointer"
                aria-label={t("viewPhotos", { name })}
              >
                <Image
                  src={side[0]}
                  alt={`${name} interior`}
                  fill
                  sizes="(min-width: 1024px) 17vw, 34vw"
                  className="object-cover"
                />
              </button>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(135deg,#F8FAFC_0_10px,#EDEFF2_10px_20px)]">
                <span className="font-mono text-[10px] font-medium tracking-widest text-slate-400">
                  INTERIOR
                </span>
              </div>
            )}
          </div>

          {/* الصورة السفلية */}
          <div className="relative flex-1 overflow-hidden rounded-[14px] bg-white border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            {side[1] ? (
              <button
                type="button"
                onClick={() => setOpenIndex(2)}
                className="absolute inset-0 cursor-pointer"
                aria-label={t("viewPhotos", { name })}
              >
                <Image
                  src={side[1]}
                  alt={`${name} work`}
                  fill
                  sizes="(min-width: 1024px) 17vw, 34vw"
                  className="object-cover"
                />
              </button>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(135deg,#F8FAFC_0_10px,#EDEFF2_10px_20px)]">
                <span className="font-mono text-[10px] font-medium tracking-widest text-slate-400">
                  WORK
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* لايت بوكس — يعرض كل الصور بالتنقل */}
      <Dialog.Root open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/90 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
          <Dialog.Popup
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 outline-none"
          >
            <Dialog.Title className="sr-only">{t("viewPhotos", { name })}</Dialog.Title>

            <Dialog.Close
              aria-label={t("close")}
              className="absolute end-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
            >
              <X className="size-5" />
            </Dialog.Close>

            {total > 1 && (
              <span className="tabular absolute top-4 start-4 text-sm font-semibold text-white/80">
                {(openIndex ?? 0) + 1} / {total}
              </span>
            )}

            {activePhoto && (
              <div className="relative h-full max-h-[80vh] w-full max-w-5xl">
                <Image
                  src={activePhoto}
                  alt={`${name} ${(openIndex ?? 0) + 1}`}
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </div>
            )}

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  aria-label={t("prevPhoto")}
                  className="absolute start-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer sm:start-4"
                >
                  <ChevronRight className="size-6 rtl:rotate-0 ltr:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label={t("nextPhoto")}
                  className="absolute end-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer sm:end-4"
                >
                  <ChevronLeft className="size-6 rtl:rotate-0 ltr:rotate-180" />
                </button>
              </>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
