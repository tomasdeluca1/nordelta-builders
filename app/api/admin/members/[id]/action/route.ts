import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
import { defaultPasswordFor, hashPassword } from '@/lib/password';
import { sendAcceptedEmail, sendRejectedEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Action = 'accept' | 'reject' | 'deactivate' | 'reactivate' | 'resend';
const ACTIONS: Action[] = ['accept', 'reject', 'deactivate', 'reactivate', 'resend'];

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = Number.parseInt(params.id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const action = body.action as Action;
  if (!ACTIONS.includes(action)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  const db = getDb();
  const [member] = await db.select().from(schema.members).where(eq(schema.members.id, id)).limit(1);
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  let emailSent = false;

  if (action === 'accept' || action === 'resend') {
    // Reset to the deterministic temp password so the emailed credentials work
    // even if the member's name was edited after registration.
    const tempPwd = defaultPasswordFor(member.name);
    const passwordHash = await hashPassword(tempPwd);
    await db
      .update(schema.members)
      .set({ status: 'active', passwordHash, mustChangePassword: true, updatedAt: new Date() })
      .where(eq(schema.members.id, id));
    try {
      await sendAcceptedEmail({ to: member.email, name: member.name, defaultPassword: tempPwd });
      emailSent = true;
    } catch (err) {
      console.error('Accepted email failed:', err);
    }
  } else if (action === 'reject') {
    await db.update(schema.members).set({ status: 'rejected', updatedAt: new Date() }).where(eq(schema.members.id, id));
    try {
      await sendRejectedEmail({ to: member.email, name: member.name });
      emailSent = true;
    } catch (err) {
      console.error('Rejected email failed:', err);
    }
  } else if (action === 'deactivate') {
    await db.update(schema.members).set({ status: 'inactive', updatedAt: new Date() }).where(eq(schema.members.id, id));
  } else if (action === 'reactivate') {
    await db.update(schema.members).set({ status: 'active', updatedAt: new Date() }).where(eq(schema.members.id, id));
  }

  return NextResponse.json({ success: true, action, emailSent });
}
