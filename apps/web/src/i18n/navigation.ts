// تنقل واعي باللغة: استخدمه بدل next/link و next/navigation
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
