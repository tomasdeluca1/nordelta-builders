import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';
import { defaultPasswordFor, hashPassword } from '@/lib/password';
import { sendWelcomeEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(n => n[0]?.toUpperCase() ?? '').join('') || '?';
}

const ROLE_TITLE: Record<string, string> = {
  'Founder/CEO':        'Founder',
  'Developer/Engineer': 'Dev',
  'Product/Design':     'Product',
  'Marketing/Growth':   'Growth',
  'Inversor':           'Inversor',
  'Otro':               'Builder',
};

const ROLE_TAGS: Record<string, string[]> = {
  'Founder/CEO':        ['Founder'],
  'Developer/Engineer': ['Dev'],
  'Product/Design':     ['Product'],
  'Marketing/Growth':   ['Growth'],
  'Inversor':           ['Inversor'],
  'Otro':               ['Builder'],
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const role = typeof body.role === 'string' ? body.role.trim() : '';

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Name, email, and role are required' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const db = getDb();
    const existing = await db.select({ id: schema.members.id }).from(schema.members).where(eq(schema.members.email, email)).limit(1);
    if (existing.length) {
      return NextResponse.json({ success: true, message: 'Already registered', alreadyMember: true }, { status: 200 });
    }

    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.members);
    const tags = Array.isArray(body.tags) && body.tags.length > 0 ? body.tags.slice(0, 12).map(String) : (ROLE_TAGS[role] ?? ['Builder']);

    const defaultPwd = defaultPasswordFor(name);
    const passwordHash = await hashPassword(defaultPwd);

    const [inserted] = await db.insert(schema.members).values({
      name,
      email,
      passwordHash,
      mustChangePassword: true,
      initials: getInitials(name),
      role,
      jobTitle: ROLE_TITLE[role] ?? role,
      company: body.company?.toString().trim() || null,
      companyUrl: body.companyUrl?.toString().trim() || null,
      tags,
      colorIndex: count % 8,
      status: 'active',
    }).returning({ id: schema.members.id });

    try {
      await sendWelcomeEmail({ to: email, name, defaultPassword: defaultPwd });
    } catch (mailErr) {
      console.error('Welcome email failed:', mailErr);
    }

    return NextResponse.json({ success: true, id: inserted.id, emailSent: true }, { status: 201 });
  } catch (error) {
    console.error('Error inserting member:', error);
    return NextResponse.json({ error: 'Internal server error while saving to database' }, { status: 500 });
  }
}
