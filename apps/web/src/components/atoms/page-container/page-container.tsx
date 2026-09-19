// حاوية الصفحة: أقصى عرض 1312px وهوامش 64px على الديسكتوب (من التصميم 1440)
import { cn } from "@/lib/utils/cn.utils";

type PageContainerProps<T extends React.ElementType> = {
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, "as">;

function PageContainer<T extends React.ElementType = "div">({
  as,
  className,
  ...props
}: PageContainerProps<T>) {
  const Component = as ?? "div";
  return <Component className={cn("mx-auto w-full max-w-[1312px] px-4 md:px-16", className)} {...props} />;
}

export { PageContainer };
