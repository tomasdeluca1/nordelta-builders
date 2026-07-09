import { NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// T1: huevsite conectado · T2: web propia o de empresa · T3: resto.
function tierOf(r: { huevsiteUsername: string | null; websiteUrl: string | null; companyUrl: string | null }): 1 | 2 | 3 {
  if (r.huevsiteUsername) return 1;
  if (r.websiteUrl || r.companyUrl) return 2;
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
        huevsiteUsername: schema.members.huevsiteUsername,
        huevsiteApproved: schema.members.huevsiteApproved,
        huevsiteFeatured: schema.members.huevsiteFeatured,
        createdAt: schema.members.createdAt,
      })
      .from(schema.members)
      .where(eq(schema.members.status, 'active'))
      .orderBy(asc(schema.members.name));

    // Escalonado: huevsite → web → resto. Dentro de T1 pesan featured/approved
    // y antigüedad; T2/T3 quedan alfabéticos (ya vienen así de la query).
    const members = rows
      .map((r) => ({ ...r, _id: String(r.id), tier: tierOf(r) }))
      .sort((a, b) => {
        if (a.tier !== b.tier) return a.tier - b.tier;
        if (a.tier === 1) {
          const feat = Number(b.huevsiteFeatured) - Number(a.huevsiteFeatured);
          if (feat) return feat;
          const appr = Number(b.huevsiteApproved) - Number(a.huevsiteApproved);
          if (appr) return appr;
          return a.createdAt.getTime() - b.createdAt.getTime();
        }
        return a.name.localeCompare(b.name, 'es');
      })
      .map(({ createdAt, huevsiteApproved, huevsiteFeatured, ...pub }) => pub);

    return NextResponse.json({ members, total: members.length });
  } catch (error) {
    console.error('Error fetching all members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
