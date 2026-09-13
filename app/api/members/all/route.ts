import { NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// T1: sitio propio · T2: web de empresa · T3: resto.
function tierOf(r: { websiteUrl: string | null; companyUrl: string | null }): 1 | 2 | 3 {
  if (r.websiteUrl) return 1;
  if (r.companyUrl) return 2;
  return 3;
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: schema.members.id,
        name: schema.members.name,
        initials: schema.members.initials,
        role: schema.members.role,
        jobTitle: schema.members.jobTitle,
        company: schema.members.company,
        companyUrl: schema.members.companyUrl,
        websiteUrl: schema.members.websiteUrl,
        tags: schema.members.tags,
        colorIndex: schema.members.colorIndex,
        createdAt: schema.members.createdAt,
      })
      .from(schema.members)
      .where(eq(schema.members.status, 'active'))
      .orderBy(asc(schema.members.name));

    // Escalonado: sitio propio → web de empresa → resto, con desempate alfabético
    // explícito en español dentro de cada tier. El ORDER BY name de Postgres ya
    // ordena alfabéticamente, pero su resultado depende del collation de la base
    // (con collation C/POSIX, Á/Ñ caen después de la Z) y la estabilidad del sort
    // no alcanza sola para garantizar ese orden tras reordenar por tier.
    const members = rows
      .map((r) => ({ ...r, _id: String(r.id), tier: tierOf(r) }))
      .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name, 'es'))
      .map(({ createdAt, ...pub }) => pub);

    return NextResponse.json({ members, total: members.length });
  } catch (error) {
    console.error('Error fetching all members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
