import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';
import { readProfileToken } from '@/lib/magic-link';
import { parsePresentationFields, normalizeUrl } from '@/lib/presentation';
import { parseHuevsiteUsername } from '@/lib/huevsite';
import { ROLES, ROLE_TITLE } from '@/lib/profile-fields';
import { sendPresentationReceivedEmail, sendAdminPresentationCompletedEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_ROLES = new Set<string>(ROLES);

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(n => n[0]?.toUpperCase() ?? '').join('') || '?';
}

/**
 * Completar la presentación vía link mágico (los pendientes/lapsed que recibieron
 * la campaña). Auth por token firmado, sin contraseña. Setea profile_submitted_at
 * y devuelve el member a la cola de revisión (pending).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const memberId = await readProfileToken(typeof body.token === 'string' ? body.token : null);
  if (!memberId) {
    return NextResponse.json({ error: 'Link inválido o expirado' }, { status: 401 });
  }

  const db = getDb();
  const [member] = await db.select().from(schema.members).where(eq(schema.members.id, memberId)).limit(1);
  if (!member) return NextResponse.json({ error: 'No encontramos tu registro' }, { status: 404 });
  if (member.status === 'active') {
    return NextResponse.json(
      { error: 'Ya sos parte de la comunidad. Entrá con tu cuenta.', alreadyActive: true },
      { status: 409 },
    );
  }

  const presentation = parsePresentationFields(body);
  if (!presentation.linkedinUrl) {
    return NextResponse.json({ error: 'El LinkedIn es requerido' }, { status: 400 });
  }
  const huevsiteUsername = parseHuevsiteUsername(body.huevsiteUsername);

  const set: Record<string, unknown> = {
    ...presentation,
    huevsiteUsername,
    profileSubmittedAt: new Date(),
    status: 'pending', // un lapsed que completa vuelve a la cola de revisión
    updatedAt: new Date(),
  };

  // Identidad editable (precargada desde su registro, pero pueden corregirla).
  if (typeof body.name === 'string' && body.name.trim()) {
    const name = body.name.trim().slice(0, 200);
    set.name = name;
    set.initials = getInitials(name);
  }
  if (typeof body.role === 'string' && ALLOWED_ROLES.has(body.role)) {
    set.role = body.role;
    // El cargo lo escribe el builder; sólo se deriva del rol si viene vacío.
    const jobTitleRaw = typeof body.jobTitle === 'string' ? body.jobTitle.trim().slice(0, 80) : '';
    set.jobTitle = jobTitleRaw || (ROLE_TITLE[body.role] ?? body.role);
  }
  if (typeof body.company === 'string') set.company = body.company.trim().slice(0, 200) || null;
  if ('companyUrl' in body) set.companyUrl = normalizeUrl(body.companyUrl);

  const [updated] = await db.update(schema.members).set(set).where(eq(schema.members.id, memberId)).returning();

  // Emails best-effort: no deben romper el submit.
  try {
    await sendPresentationReceivedEmail({ to: updated.email, name: updated.name });
  } catch (err) {
    console.error('Presentation-received email failed:', err);
  }
  try {
    await sendAdminPresentationCompletedEmail({
      name: updated.name,
      email: updated.email,
      role: updated.role,
      company: updated.company,
    });
  } catch (err) {
    console.error('Admin presentation email failed:', err);
  }

  return NextResponse.json({ success: true });
}
