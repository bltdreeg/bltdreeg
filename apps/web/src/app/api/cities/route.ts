// قائمة المدن مع عدد المحلات
import { cities } from "@/lib/data/cities.constants";

export async function GET() {
  return Response.json(cities);
}
