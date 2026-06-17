import { getDb, schema } from './db';

export type SettingKey = 'whatsapp_group_url' | 'admin_notification_email' | 'huevsite_url';

export const SETTING_DEFAULTS: Record<SettingKey, string> = {
  whatsapp_group_url: 'https://chat.whatsapp.com/BCjkNIAfX5k157xVl28NCT',
  admin_notification_email: 'huevsite.studio@gmail.com',
  huevsite_url: 'https://huevsite.io',
};

export const SETTING_KEYS = Object.keys(SETTING_DEFAULTS) as SettingKey[];

const TTL_MS = 30_000;
let cache: { at: number; map: Record<string, string> } | null = null;

async function loadAll(): Promise<Record<string, string>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.map;
  const rows = await getDb().select().from(schema.appSettings);
  const map: Record<string, string> = {};
  for (const r of rows) if (r.value != null) map[r.key] = r.value;
  cache = { at: Date.now(), map };
  return map;
}

export async function getSetting(key: SettingKey): Promise<string> {
  const map = await loadAll();
  return map[key] ?? SETTING_DEFAULTS[key] ?? '';
}

export async function getAllSettings(): Promise<Record<SettingKey, string>> {
  const map = await loadAll();
  const out = {} as Record<SettingKey, string>;
  for (const k of SETTING_KEYS) out[k] = map[k] ?? SETTING_DEFAULTS[k];
  return out;
}

export async function setSetting(key: SettingKey, value: string): Promise<void> {
  await getDb()
    .insert(schema.appSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: schema.appSettings.key, set: { value, updatedAt: new Date() } });
  cache = null;
}
