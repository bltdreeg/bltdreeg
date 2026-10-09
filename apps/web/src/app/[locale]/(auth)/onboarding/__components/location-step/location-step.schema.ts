// مخطط التحقق والأنواع لخطوة تأكيد الموقع — بدون JSX
import { z } from "zod";

export interface LocationStepValues {
  governorateId: string;
  cityId: string;
}

// المنطقة مش حقل في الفورم: بتتحدد من المدينة (شوف location-step.tsx)
export const locationStepSchema = z.object({
  governorateId: z.string().min(1),
  cityId: z.string().min(1),
});
