import { NextResponse } from 'next/server';
import { fetchHuevsiteProfile, parseHuevsiteUsername } from '@/lib/huevsite';

export const runtime = 'nodejs';

// Proxy liviano del perfil público de huevsite para el directorio (evita CORS
// desde el cliente; fetchHuevsiteProfile ya cachea 300s server-side).
export async function GET(_req: Request, { params }: { params: { username: string } }) {
  const username = parseHuevsiteUsername(params.username);
  if (!username) return NextResponse.json({ profile: null }, { status: 400 });

  const p = await fetchHuevsiteProfile(username);
  const profile = p
    ? { username: p.username, avatar: p.avatar, accentColor: p.accentColor, builderScore: p.builderScore, headline: p.headline, url: p.url }
    : null;

  return NextResponse.json(
    { profile },
    { headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' } },
  );
}
