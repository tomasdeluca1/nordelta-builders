import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/password';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }
    if (newPassword === currentPassword) {
      return NextResponse.json({ error: 'La nueva contraseña debe ser distinta' }, { status: 400 });
    }

    const db = getDb();
    const [user] = await db.select().from(schema.members).where(eq(schema.members.id, session.userId)).limit(1);
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    const ok = await verifyPassword(currentPassword, user.passwordHash);
    if (!ok) return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 401 });

    const newHash = await hashPassword(newPassword);
    await db
      .update(schema.members)
      .set({ passwordHash: newHash, mustChangePassword: false, updatedAt: new Date() })
      .where(eq(schema.members.id, user.id));

    session.mustChangePassword = false;
    await session.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Change password error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
