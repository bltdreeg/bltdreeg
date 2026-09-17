// قائمة الحجوزات / إنشاء حجز
import { getBookings } from "@/lib/actions/bookings/bookings.action";

export async function GET() {
  return Response.json(await getBookings());
}

export async function POST() {
  return new Response(null, { status: 501 });
}
