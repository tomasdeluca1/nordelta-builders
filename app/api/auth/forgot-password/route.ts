import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';
import { generateTempPassword, hashPassword } from '@/lib/password';
import { sendPasswordResetEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Generic response — never reveal whether an email exists.
const OK = { success: true, message: 'Si el email existe, te mandamos las instrucciones.' };

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const db = getDb();
    const [user] = await db.select().from(schema.members).where(eq(schema.members.email, email)).limit(1);

    // Only active members can recover (pending/rejected/inactive can't log in anyway).
    if (user && user.status === 'active') {
      const tempPwd = generateTempPassword();
      const passwordHash = await hashPassword(tempPwd);
      await db
        .update(schema.members)
        .set({ passwordHash, mustChangePassword: true, updatedAt: new Date() })
        .where(eq(schema.members.id, user.id));
      try {
        await sendPasswordResetEmail({ to: user.email, name: user.name, tempPassword: tempPwd });
      } catch (mailErr) {
        console.error('Password reset email failed:', mailErr);
      }
    }

    return NextResponse.json(OK);
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
