// قائمة حسابي: الحساب / التطبيق / المساعدة — كل عنصر بيفتح شيت في نفس الصفحة
"use client";

import { ChevronLeftIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/atoms/sheet";

type MenuItem = { id: string; label: string; body: React.ReactNode };
type MenuGroup = { title: string; items: MenuItem[] };

const COMING_SOON = <p className="text-sm text-muted-foreground">قريباً</p>;

const GROUPS: MenuGroup[] = [
  {
    title: "الحساب",
    items: [
      { id: "profile", label: "بياناتي", body: COMING_SOON },
      { id: "phone", label: "رقم الموبايل", body: COMING_SOON },
      { id: "password", label: "كلمة السر", body: COMING_SOON },
    ],
  },
  {
    title: "التطبيق",
    items: [
      { id: "area", label: "منطقتي", body: COMING_SOON },
      { id: "notifications", label: "الإشعارات", body: COMING_SOON },
    ],
  },
  {
    title: "المساعدة",
    items: [
      { id: "support", label: "تواصل معانا", body: COMING_SOON },
      { id: "terms", label: "الشروط والخصوصية", body: COMING_SOON },
    ],
  },
];

export function AccountMenu() {
  return (
    <nav aria-label="قائمة الحساب" className="flex flex-col gap-6">
      {GROUPS.map((group) => (
        <section key={group.title}>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{group.title}</h2>
          <ul className="divide-y rounded-2xl border bg-card">
            {group.items.map((item) => (
              <li key={item.id}>
                <Sheet>
                  <SheetTrigger className="flex w-full items-center justify-between px-4 py-3 text-start hover:bg-muted">
                    <span>{item.label}</span>
                    <ChevronLeftIcon className="size-4 text-muted-foreground rtl:rotate-0 ltr:rotate-180" aria-hidden />
                  </SheetTrigger>
                  <SheetContent title={item.label}>{item.body}</SheetContent>
                </Sheet>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}
