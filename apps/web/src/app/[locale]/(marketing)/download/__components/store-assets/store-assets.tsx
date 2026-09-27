// أصول المتاجر — أيقونات وزراير، مشتركة بين بطاقات الهيرو وشريط الختام

import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/data/constants/app.constants";

type Store = "ios" | "android";

function AppleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.2 12.5c0-2.4 1.95-3.55 2.04-3.61-1.11-1.63-2.84-1.85-3.46-1.88-1.47-.15-2.87.86-3.62.86-.74 0-1.9-.84-3.12-.82-1.6.02-3.08.93-3.9 2.36-1.66 2.88-.42 7.15 1.2 9.49.79 1.14 1.74 2.43 2.98 2.38 1.2-.05 1.65-.77 3.1-.77 1.44 0 1.85.77 3.11.75 1.29-.02 2.1-1.16 2.89-2.31.91-1.33 1.29-2.61 1.31-2.68-.03-.01-2.51-.96-2.53-3.77zM14.1 5.4c.66-.8 1.1-1.9.98-3-.95.04-2.1.63-2.78 1.42-.61.7-1.14 1.83-1 2.9 1.06.08 2.14-.53 2.8-1.32z" />
    </svg>
  );
}

/** أيقونة جوجل بلاي الملوّنة — للزرار التاني وخلفياته الفاتحة */
function GooglePlayIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path d="M3.6 2.3 13.2 12l-9.6 9.7a1.6 1.6 0 0 1-.6-1.3V3.6c0-.5.2-1 .6-1.3Z" fill="#00c4ff" />
      <path d="M16.5 8.7 13.2 12 3.6 2.3c.5-.4 1.2-.4 1.9 0l11 6.4Z" fill="#00e676" />
      <path d="M16.5 15.3 5.5 21.7c-.7.4-1.4.4-1.9 0L13.2 12l3.3 3.3Z" fill="#ff3d47" />
      <path d="m16.5 8.7 4 2.3c1 .6 1 1.5 0 2l-4 2.3L13.2 12l3.3-3.3Z" fill="#ffd400" />
    </svg>
  );
}

/** نفس الشكل بأبيض شفاف — عشان يبان على زرار بلون العلامة */
function GooglePlayIconMono(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M3.6 2.3 13.2 12l-9.6 9.7a1.6 1.6 0 0 1-.6-1.3V3.6c0-.5.2-1 .6-1.3Z" opacity="0.95" />
      <path d="M16.5 8.7 13.2 12 3.6 2.3c.5-.4 1.2-.4 1.9 0l11 6.4Z" opacity="0.8" />
      <path d="M16.5 15.3 5.5 21.7c-.7.4-1.4.4-1.9 0L13.2 12l3.3 3.3Z" opacity="0.7" />
      <path d="m16.5 8.7 4 2.3c1 .6 1 1.5 0 2l-4 2.3L13.2 12l3.3-3.3Z" opacity="0.85" />
    </svg>
  );
}

const STORE_URL: Record<Store, string> = {
  ios: APP_STORE_URL,
  android: GOOGLE_PLAY_URL,
};

const STORE_LABEL: Record<Store, string> = {
  ios: "App Store",
  android: "Google Play",
};

/** أيقونة المتجر حسب المكان اللي هتتحط فيه */
function StoreIcon({ store, tone, className }: { store: Store; tone: "color" | "mono"; className?: string }) {
  if (store === "ios") return <AppleIcon className={className} />;
  return tone === "mono" ? (
    <GooglePlayIconMono className={className} />
  ) : (
    <GooglePlayIcon className={className} />
  );
}

/**
 * زرار متجر بنصنا وخطنا — مش صورة الشارة الرسمية.
 * ponytail: الشارة الرسمية بتتكسر في RTL وما بتكبرش مع النص؛ لو الفريق عايز يلتزم بإرشادات المتاجر تتبدل هنا بس.
 */
function StoreButton({
  store,
  label,
  prefix,
  variant = "primary",
  className = "",
}: {
  store: Store;
  label: string;
  /** «حمّل من» قبل اسم المتجر — بيتساب فاضي في الأماكن الضيقة */
  prefix?: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const base =
    "inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl px-5 text-base font-extrabold no-underline transition-colors";
  const tone =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary-pressed"
      : "border border-border bg-background text-foreground hover:bg-muted";

  return (
    <a
      href={STORE_URL[store]}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${tone} ${className}`}
    >
      <StoreIcon
        store={store}
        tone={variant === "primary" ? "mono" : "color"}
        className="size-5.5 shrink-0"
      />
      {prefix ? `${prefix} ${label}` : label}
    </a>
  );
}

export { AppleIcon, GooglePlayIcon, StoreButton, StoreIcon, STORE_LABEL, STORE_URL };
export type { Store };
