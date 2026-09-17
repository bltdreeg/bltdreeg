// قائمة المناطق مع عدد المحلات
import { areas } from "@/lib/data/areas.constants";

export async function GET() {
  return Response.json(areas);
}
