import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SELECT = {
  id: schema.members.id,
  name: schema.members.name,
  email: schema.members.email,
  initials: schema.members.initials,
  role: schema.members.role,
  jobTitle: schema.members.jobTitle,
  company: schema.members.company,
  companyUrl: schema.members.companyUrl,
  tags: schema.members.tags,
  colorIndex: schema.members.colorIndex,
  status: schema.members.status,
  isAdmin: schema.members.isAdmin,
  huevsiteUsername: schema.members.huevsiteUsername,
  huevsiteApproved: schema.members.huevsiteApproved,
  huevsiteFeatured: schema.members.huevsiteFeatured,
  neighborhood: schema.members.neighborhood,
  bio: schema.members.bio,
  building: schema.members.building,
  linkedinUrl: schema.members.linkedinUrl,
  twitterUrl: schema.members.twitterUrl,
  instagramUrl: schema.members.instagramUrl,
  websiteUrl: schema.members.websiteUrl,
  lookingFor: schema.members.lookingFor,
  canHelpWith: schema.members.canHelpWith,
  profileSubmittedAt: schema.members.profileSubmittedAt,
  reengagedAt: schema.members.reengagedAt,
  createdAt: schema.members.createdAt,
  updatedAt: schema.members.updatedAt,
};

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const status = new URL(request.url).searchParams.get('status');
  const db = getDb();
  const base = db.select(SELECT).from(schema.members);
  const rows = status
    ? await base.where(eq(schema.members.status, status)).orderBy(desc(schema.members.createdAt))
    : await base.orderBy(desc(schema.members.createdAt));

  const counts: Record<string, number> = {};
  for (const r of await db.select({ status: schema.members.status }).from(schema.members)) {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  }

  return NextResponse.json({ members: rows, counts });
}
