import { getSetting } from './settings';

export interface HuevsiteProfile {
  username: string;
  name: string | null;
  headline: string | null;
  avatar: string | null;
  accentColor: string | null;
  builderScore: number | null;
  url: string;
}

function sanitize(s: string): string | null {
  const clean = s.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return clean || null;
}

/**
 * Accepts a huevsite URL (`https://huevsite.io/ada`, `ada.huevsite.io`) or a
 * bare handle (`@ada`, `ada`) and returns the normalized username, or null.
 */
export function parseHuevsiteUsername(input: string | null | undefined): string | null {
  if (!input) return null;
  const v = input.trim();
  if (!v) return null;
  try {
    if (/^https?:\/\//i.test(v) || v.includes('.')) {
      const url = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
      const host = url.hostname.toLowerCase();
      if (host.endsWith('huevsite.io') && host !== 'huevsite.io' && host !== 'www.huevsite.io') {
        return sanitize(host.replace(/\.huevsite\.io$/, ''));
      }
      const seg = url.pathname.split('/').filter(Boolean)[0];
      if (seg) return sanitize(seg);
    }
  } catch {
    /* fall through to bare handle */
  }
  return sanitize(v.replace(/^@/, ''));
}

export async function getHuevsiteBaseUrl(): Promise<string> {
  return (await getSetting('huevsite_url')) || 'https://huevsite.io';
}

/** Fetches a public huevsite profile via the public API. Returns null on any failure. */
export async function fetchHuevsiteProfile(username: string): Promise<HuevsiteProfile | null> {
  const base = await getHuevsiteBaseUrl();
  try {
    const res = await fetch(`${base}/api/public/profile/${encodeURIComponent(username)}`, {
      headers: { accept: 'application/json' },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.username) return null;
    return data as HuevsiteProfile;
  } catch {
    return null;
  }
}

export function huevsiteProfileUrl(base: string, username: string, embed = false): string {
  const root = base.replace(/\/$/, '');
  return `${root}/${encodeURIComponent(username)}${embed ? '?embed=1' : ''}`;
}
