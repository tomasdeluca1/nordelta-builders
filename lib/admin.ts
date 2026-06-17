import { eq } from 'drizzle-orm';
import { getDb, schema } from './db';
import { getSession } from './auth';
import type { Member } from './db/schema';

/** Returns the logged-in member row, or null if no valid session. */
export async function getCurrentMember(): Promise<Member | null> {
  const session = await getSession();
  if (!session.userId) return null;
  const [m] = await getDb()
    .select()
    .from(schema.members)
    .where(eq(schema.members.id, session.userId))
    .limit(1);
  return m ?? null;
}

/** Returns the member only if it is an active admin, otherwise null. */
export async function requireAdmin(): Promise<Member | null> {
  const m = await getCurrentMember();
  if (!m || !m.isAdmin || m.status !== 'active') return null;
  return m;
}
