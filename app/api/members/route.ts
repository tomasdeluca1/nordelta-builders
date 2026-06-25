import { NextResponse } from 'next/server';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';
import { fetchHuevsiteProfile, getHuevsiteBaseUrl } from '@/lib/huevsite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const [rows, totalResult, huevsiteUrl] = await Promise.all([
      db
        .select({
          id: schema.members.id,
          name: schema.members.name,
          initials: schema.members.initials,
          role: schema.members.role,
          jobTitle: schema.members.jobTitle,
          company: schema.members.company,
          companyUrl: schema.members.companyUrl,
          tags: schema.members.tags,
          colorIndex: schema.members.colorIndex,
          huevsiteUsername: schema.members.huevsiteUsername,
          huevsiteApproved: schema.members.huevsiteApproved,
          huevsiteFeatured: schema.members.huevsiteFeatured,
          createdAt: schema.members.createdAt,
        })
        .from(schema.members)
        .where(eq(schema.members.status, 'active'))
        // Surface every connected huevsite first (featured/approved on top), then by seniority.
        .orderBy(
          desc(sql`${schema.members.huevsiteUsername} IS NOT NULL`),
          desc(schema.members.huevsiteFeatured),
          desc(schema.members.huevsiteApproved),
          asc(schema.members.createdAt),
        )
        .limit(60),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.members)
        .where(eq(schema.members.status, 'active')),
      getHuevsiteBaseUrl(),
    ]);

    // Enrich approved huevsites with their public profile (avatar, accent, score).
    const enriched = await Promise.all(
      rows.map(async (r) => {
        // Mostramos todos los huevsites conectados, sin requerir aprobación.
        const showHuevsite = Boolean(r.huevsiteUsername);
        let huevsite = null;
        if (showHuevsite && r.huevsiteUsername) {
          const p = await fetchHuevsiteProfile(r.huevsiteUsername);
          if (p) {
            huevsite = {
              username: p.username,
              avatar: p.avatar,
              accentColor: p.accentColor,
              builderScore: p.builderScore,
              headline: p.headline,
              url: p.url,
            };
          }
        }
        return {
          ...r,
          _id: String(r.id),
          huevsiteUsername: showHuevsite ? r.huevsiteUsername : null,
          huevsiteFeatured: showHuevsite ? r.huevsiteFeatured : false,
          huevsite,
        };
      }),
    );

    const total = totalResult[0]?.count ?? enriched.length;
    return NextResponse.json({ members: enriched, total, huevsiteUrl });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
