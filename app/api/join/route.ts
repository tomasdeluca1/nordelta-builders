import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';
import { defaultPasswordFor, hashPassword } from '@/lib/password';
import { sendWelcomeEmail, sendAdminNewRegistrationEmail } from '@/lib/email';
import { parsePresentationFields, normalizeUrl } from '@/lib/presentation';
import { parseHuevsiteUsername } from '@/lib/huevsite';
import { ROLES, ROLE_TITLE, ROLE_TAGS } from '@/lib/profile-fields';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_ROLES = new Set<string>(ROLES);

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(n => n[0]?.toUpperCase() ?? '').join('') || '?';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const role = typeof body.role === 'string' ? body.role.trim() : '';
    const jobTitleRaw = typeof body.jobTitle === 'string' ? body.jobTitle.trim().slice(0, 80) : '';

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Name, email, and role are required' }, { status: 400 });
    }
    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
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

    // Password is generated now (deterministic) but credentials are only emailed
    // once an admin approves the member.
    const defaultPwd = defaultPasswordFor(name);
    const passwordHash = await hashPassword(defaultPwd);
    const company = body.company?.toString().trim() || null;

    // Presentación rica: el alta nueva la completa de una, así que ya entra a la
    // cola de revisión con profileSubmittedAt seteado.
    const presentation = parsePresentationFields(body);
    if (!presentation.linkedinUrl) {
      return NextResponse.json({ error: 'El LinkedIn es requerido' }, { status: 400 });
    }
    const huevsiteUsername = parseHuevsiteUsername(body.huevsiteUsername);

    const [inserted] = await db.insert(schema.members).values({
      name,
      email,
      passwordHash,
      mustChangePassword: true,
      initials: getInitials(name),
      role,
      jobTitle: jobTitleRaw || (ROLE_TITLE[role] ?? role),
      company,
      companyUrl: normalizeUrl(body.companyUrl),
      tags,
      colorIndex: count % 8,
      status: 'active',
      ...presentation,
      huevsiteUsername,
      profileSubmittedAt: new Date(),
    }).returning({ id: schema.members.id });

    // Auto-acceso: el builder entra solo. Un único mail con acceso + WhatsApp +
    // (si falta) pedido de web, más un aviso informativo al admin. Los fallos de
    // mail no rompen el registro.
    try {
      await sendWelcomeEmail({
        to: email,
        name,
        defaultPassword: defaultPwd,
        needsWebsite: !presentation.websiteUrl,
      });
    } catch (mailErr) {
      console.error('Welcome email failed:', mailErr);
    }
    try {
      await sendAdminNewRegistrationEmail({ name, email, role, company });
    } catch (mailErr) {
      console.error('Admin notification email failed:', mailErr);
    }

    return NextResponse.json({ success: true, id: inserted.id, active: true }, { status: 201 });
  } catch (error) {
    console.error('Error inserting member:', error);
    return NextResponse.json({ error: 'Internal server error while saving to database' }, { status: 500 });
  }
}
