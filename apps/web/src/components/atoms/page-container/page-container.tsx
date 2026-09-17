// حاوية الصفحة: أقصى عرض 1312px وهوامش 64px على الديسكتوب (من التصميم 1440)
import { cn } from "@/lib/utils/cn.utils";

function PageContainer({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1312px] px-4 md:px-16", className)} {...props} />;
}

export { PageContainer };
