import { NextResponse } from 'next/server';
import { asc, eq, sql } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const [rows, totalResult] = await Promise.all([
      db
        .select({
          id: schema.members.id,
          name: schema.members.name,
          initials: schema.members.initials,
          role: schema.members.role,
          jobTitle: schema.members.jobTitle,
          company: schema.members.company,
          companyUrl: schema.members.companyUrl,
          tags: schema.members.tags,
          colorIndex: schema.members.colorIndex,
          createdAt: schema.members.createdAt,
        })
        .from(schema.members)
        .where(eq(schema.members.status, 'active'))
        .orderBy(asc(schema.members.createdAt))
        .limit(11),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.members)
        .where(eq(schema.members.status, 'active')),
    ]);

    const members = rows.map(r => ({ ...r, _id: String(r.id) }));
    const total = totalResult[0]?.count ?? members.length;
    return NextResponse.json({ members, total });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
