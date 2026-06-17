import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { getAllSettings, setSetting, SETTING_KEYS, SettingKey } from '@/lib/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ settings: await getAllSettings() });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  for (const key of SETTING_KEYS) {
    if (typeof body[key] === 'string') {
      await setSetting(key as SettingKey, body[key].trim());
    }
  }
  return NextResponse.json({ success: true, settings: await getAllSettings() });
}
