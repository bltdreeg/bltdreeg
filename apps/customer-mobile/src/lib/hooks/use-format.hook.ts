// منسّق الأرقام للغة الحالية — كل الشاشات بتعرض الأرقام من هنا (مفيش toFixed ولا template في الشاشات)
import { getLocale } from "@/i18n/config";
import { fmt } from "@/lib/utils/format/number-format.utils";

export function useFormat() {
  return fmt(getLocale());
}
