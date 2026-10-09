// حالة التزام الصالون بالمواعيد — القيم اللي بتعرضها punctuality-badge
export const Punctuality = {
  ON_TIME: "ON_TIME",
  RUNNING_LATE: "RUNNING_LATE",
} as const;

export type Punctuality = (typeof Punctuality)[keyof typeof Punctuality];
