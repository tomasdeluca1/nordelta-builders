import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { parseHuevsiteUsername, fetchHuevsiteProfile } from '@/lib/huevsite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const username = parseHuevsiteUsername(body.huevsiteUsername);

  const db = getDb();

  // Empty input → disconnect
  if (!username) {
    await db
      .update(schema.members)
      .set({ huevsiteUsername: null, huevsiteApproved: false, huevsiteFeatured: false, updatedAt: new Date() })
      .where(eq(schema.members.id, session.userId));
    return NextResponse.json({ success: true, huevsiteUsername: null });
  }

  // Validate the handle actually exists on huevsite before saving.
  const profile = await fetchHuevsiteProfile(username);
  if (!profile) {
    return NextResponse.json(
      { error: `No encontramos el huevsite "@${username}". Revisá el usuario o la URL.` },
      { status: 400 },
    );
  }

  // Connecting (or changing) a huevsite re-enters the moderation queue.
  await db
    .update(schema.members)
    .set({ huevsiteUsername: username, huevsiteApproved: false, huevsiteFeatured: false, updatedAt: new Date() })
    .where(eq(schema.members.id, session.userId));

  return NextResponse.json({ success: true, huevsiteUsername: username, profile });
}
