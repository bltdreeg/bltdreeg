"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Input } from "@/components/atoms/input";
import { useRouter } from "@/i18n/navigation";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import { cn } from "@/lib/utils/cn.utils";

type SearchBarProps = {
  /** الحقل يتفتح مركّز — الحالة الافتراضية لما مفيش بحث */
  autoFocus?: boolean;
  className?: string;
};

function SearchBar({ autoFocus = false, className }: SearchBarProps) {
  const t = useTranslations("marketing.search.searchBar");
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (q: string) => {
    const next = new URLSearchParams(params);
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    router.push(`${ROUTE_SEARCH}?${next}`);
  };

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        submit(value);
      }}
      className={cn("relative", className)}
    >
      <Search
        aria-hidden
        className="pointer-events-none absolute start-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
      />
      <Input
        ref={inputRef}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("placeholder")}
        aria-label={t("placeholder")}
        className="h-12 ps-11 pe-11"
      />
      {value && (
        <button
          type="button"
          aria-label={t("clear")}
          onClick={() => {
            setValue("");
            inputRef.current?.focus();
            submit("");
          }}
          className="absolute end-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <X className="size-4" />
        </button>
      )}
    </form>
  );
}

export { SearchBar };
