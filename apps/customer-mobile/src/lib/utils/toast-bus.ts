// توست من برّه أي شاشة (روابط، الـ API): key من mobile.* — ToastHost في app/_layout بيترجمه ويعرضه
export type ToastValues = Record<string, string | number>;
type Listener = (key: string, values?: ToastValues) => void;

let listener: Listener | null = null;

export const showToast = (key: string, values?: ToastValues) => listener?.(key, values);

/** بيرجّع دالة الإلغاء — للـ host بس */
export function onToast(l: Listener): () => void {
  listener = l;
  return () => {
    if (listener === l) listener = null;
  };
}
