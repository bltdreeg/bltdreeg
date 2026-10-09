// نوع المدينة (منطقة داخل محافظة، مثل المعادي أو مدينة نصر)
export interface City {
  id: string;
  name: string;
  governorate: "القاهرة" | "الجيزة";
  shopCount: number;
}
