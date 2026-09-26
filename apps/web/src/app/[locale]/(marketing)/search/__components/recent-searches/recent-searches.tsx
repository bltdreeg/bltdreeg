// آخر ما بحثت عنه — صف بصورة مصغرة واسم وسبب، وزر مسح لكل واحد
"use client";

import { Clock, Scissors, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";

export type RecentSearch = {
  id: string;
  /** النص اللي بحث عنه */
  query: string;
  /** بحثت عنه امبارح · حجزت هنا مرتين */
  note: string;
  thumbnail?: string;
};

function RecentSearches({ items }: { items: RecentSearch[] }) {
  const t = useTranslations("marketing.search.recentSearches");
  const [rows, setRows] = useState(items);

  if (rows.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-bold">{t("title")}</h2>
        <button
          type="button"
          onClick={() => setRows([])}
          className="rounded-lg px-1 text-[13px] font-semibold text-primary transition-colors hover:text-primary-pressed focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {t("clearAll")}
        </button>
      </div>

      <ul className="overflow-hidden rounded-[14px] border border-border">
        {rows.map((row, i) => (
          <li
            key={row.id}
            className="relative flex items-center gap-3 bg-card px-3.5 py-3 transition-colors hover:bg-muted"
            style={i > 0 ? { borderTop: "1px solid var(--border)" } : undefined}
          >
            <span className="relative size-11 shrink-0 overflow-hidden rounded-[10px] bg-muted">
              {row.thumbnail ? (
                <Image src={row.thumbnail} alt="" fill sizes="44px" className="object-cover" />
              ) : (
                <Scissors
                  aria-hidden
                  className="absolute start-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 text-[#C6CBD2] rtl:translate-x-1/2"
                />
              )}
            </span>

            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Link
                href={`${ROUTE_SEARCH}?q=${encodeURIComponent(row.query)}`}
                className="truncate text-[15px] font-semibold after:absolute after:inset-0 focus-visible:outline-none"
              >
                {row.query}
              </Link>
              <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <Clock aria-hidden className="size-3" />
                {row.note}
              </span>
            </span>

            <button
              type="button"
              aria-label={t("clearItem", { query: row.query })}
              onClick={() => setRows((r) => r.filter((x) => x.id !== row.id))}
              className="relative z-[1] flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { RecentSearches };
