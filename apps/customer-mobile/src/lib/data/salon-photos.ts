// صور الصالونات التجريبية — نفس صور الويب (apps/web/public/dummy_salon، 5.png نسخة من 4.png فاتشالت)، مضغوطة 800px.
// الـ URL الحقيقي من الـ API بيكسب دايماً؛ الصورة التجريبية بتتختار ثابتة من الـ id عشان نفس الصالون يبان بنفس الصورة في كل مكان.
// ponytail: امسح الصور دي والـ fallback لما الـ API يرجّع image_url وصور المعرض.
import type { GalleryItem } from "@/lib/types/salon";
import exterior from "@/assets/salons/salon-1.jpg";
import industrial from "@/assets/salons/salon-2.jpg";
import luxury from "@/assets/salons/salon-3.jpg";
import bright from "@/assets/salons/salon-4.jpg";
import beard from "@/assets/salons/salon-5.jpg";
import fade from "@/assets/salons/salon-6.jpg";
import teal from "@/assets/salons/salon-7.jpg";
import chair from "@/assets/salons/salon-8.jpg";
import shelf from "@/assets/salons/salon-9.jpg";

/** صورة محلية (رقم asset) أو URL */
export type SalonPhotoSource = number | { uri: string };

const COVERS = [industrial, luxury, bright, chair, teal, exterior];
/** المعرض من الـ ٩ كلهم: ids المعرض متتالية (s1-w1، s1-w2…) فمفيش صورة بتتكرر جنب أختها */
const ALL = [fade, beard, ...COVERS, shelf];

/** رقم ثابت من النص (djb2) — ids متتالية (s1، s2…) بتاخد صور مختلفة */
function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
}
const pick = (list: number[], key: string) => list[hash(key) % list.length];

export const salonCover = (salonId: string, url?: string | null): SalonPhotoSource => (url ? { uri: url } : pick(COVERS, salonId));

export const galleryPhoto = (item: Pick<GalleryItem, "id" | "url">): SalonPhotoSource =>
  item.url ? { uri: item.url } : pick(ALL, item.id);
