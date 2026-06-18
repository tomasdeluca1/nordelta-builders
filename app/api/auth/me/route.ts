import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { isOwner } from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  const db = getDb();
  const [user] = await db
    .select({
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
      mustChangePassword: schema.members.mustChangePassword,
      isAdmin: schema.members.isAdmin,
      huevsiteUsername: schema.members.huevsiteUsername,
      huevsiteApproved: schema.members.huevsiteApproved,
      createdAt: schema.members.createdAt,
    })
    .from(schema.members)
    .where(eq(schema.members.id, session.userId))
    .limit(1);

  if (!user) {
    session.destroy();
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user: { ...user, isOwner: isOwner(user) } });
}
