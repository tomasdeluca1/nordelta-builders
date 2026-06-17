import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
import { parseHuevsiteUsername } from '@/lib/huevsite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_ROLES = new Set([
  'Founder/CEO', 'Developer/Engineer', 'Product/Design', 'Marketing/Growth', 'Inversor', 'Otro',
]);

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(n => n[0]?.toUpperCase() ?? '').join('') || '?';
}

function normalizeUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const v = raw.trim();
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = Number.parseInt(params.id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const set: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.name === 'string' && body.name.trim()) {
    const name = body.name.trim().slice(0, 200);
    set.name = name;
    set.initials = getInitials(name);
  }
  if (typeof body.role === 'string') {
    if (!ALLOWED_ROLES.has(body.role)) return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
    set.role = body.role;
  }
  if (typeof body.jobTitle === 'string') set.jobTitle = body.jobTitle.trim().slice(0, 80) || null;
  if (typeof body.company === 'string') set.company = body.company.trim().slice(0, 200) || null;
  if ('companyUrl' in body) set.companyUrl = normalizeUrl(body.companyUrl);
  if (Array.isArray(body.tags)) {
    set.tags = Array.from(new Set(body.tags.map((t: unknown) => String(t).trim()).filter(Boolean))).slice(0, 12);
  }
  if ('huevsiteUsername' in body) set.huevsiteUsername = parseHuevsiteUsername(body.huevsiteUsername);
  if (typeof body.huevsiteApproved === 'boolean') set.huevsiteApproved = body.huevsiteApproved;
  if (typeof body.huevsiteFeatured === 'boolean') set.huevsiteFeatured = body.huevsiteFeatured;
  if (typeof body.isAdmin === 'boolean') set.isAdmin = body.isAdmin;

  const db = getDb();
  const [updated] = await db.update(schema.members).set(set).where(eq(schema.members.id, id)).returning();
  if (!updated) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  return NextResponse.json({ success: true, member: updated });
}
