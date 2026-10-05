// حمل الطابور الحالي — لصالون كامل أو لدور حلاق بعينه
export interface QueueLoad {
  peopleAhead: number;
  waitMinutes: number;
}
