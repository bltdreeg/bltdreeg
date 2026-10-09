// قراءة تفضيل من الـ kv-store، ولو مش موجود: ننقل القيمة القديمة من SecureStore مرة واحدة (الإصدارات اللي قبل batch 10)
export interface PrefStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export async function readMigrated(key: string, kv: PrefStore, legacy: PrefStore): Promise<string | null> {
  const value = await kv.get(key);
  if (value !== null) return value;
  const old = await legacy.get(key).catch(() => null);
  if (old === null) return null;
  await kv.set(key, old);
  await legacy.remove(key).catch(() => {});
  return old;
}
