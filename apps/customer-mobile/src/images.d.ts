// Metro بيرجّع رقم الـ asset لأي صورة بـ import
declare module "*.jpg" {
  const asset: number;
  export default asset;
}
