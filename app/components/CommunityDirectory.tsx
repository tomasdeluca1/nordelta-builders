"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { PALETTE } from '@/lib/palette';

export interface DirectoryMember {
  _id: string;
  name: string;
  initials: string;
  role: string;
  jobTitle?: string | null;
  company?: string | null;
  companyUrl?: string | null;
  websiteUrl?: string | null;
  tags?: string[];
  colorIndex: number;
  huevsiteUsername?: string | null;
  tier: 1 | 2 | 3;
}

interface HuevProfile {
  username: string;
  avatar: string | null;
  accentColor: string | null;
  builderScore: number | null;
  headline: string | null;
  url: string;
}

const PAGE_SIZE = 24;

/**
 * Directorio de toda la comunidad activa, escalonado: T1 (huevsite) con tarjeta
 * rica, T2 (web) con chip "web ↗", T3 básica. El detalle visual de T1
 * (avatar/acento/score) se trae diferido, sólo para las tarjetas visibles.
 */
export default function CommunityDirectory({
  onOpenHuevsite,
}: {
  onOpenHuevsite: (v: { username: string; name: string }) => void;
}) {
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [profiles, setProfiles] = useState<Map<string, HuevProfile | null>>(new Map());
  const inflight = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/members/all')
      .then((r) => r.json())
      .then((d) => { setMembers(d.members ?? []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.name, m.company, m.role, m.jobTitle, ...(m.tags ?? [])]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q)));
  }, [members, query]);

  const shown = filtered.slice(0, visible);

  // Enriquecimiento diferido de T1: sólo tarjetas visibles, una vez cada una.
  useEffect(() => {
    for (const m of shown) {
      const u = m.huevsiteUsername;
      if (m.tier !== 1 || !u || profiles.has(u) || inflight.current.has(u)) continue;
      inflight.current.add(u);
      fetch(`/api/huevsite/profile/${encodeURIComponent(u)}`)
        .then((r) => r.json())
        .then((d) => setProfiles((prev) => new Map(prev).set(u, d.profile ?? null)))
        .catch(() => setProfiles((prev) => new Map(prev).set(u, null)));
    }
  }, [shown, profiles]);

  if (!loaded) return <div className="dir"><p className="dir-empty">Cargando builders…</p></div>;

  return (
    <div className="dir">
      <div className="dir-head">
        <input
          className="dir-search"
          placeholder="Buscar por nombre, empresa, rol o tag…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_SIZE); }}
        />
        <span className="dir-count">{filtered.length} de {members.length} builders</span>
      </div>

      {!filtered.length ? (
        <p className="dir-empty">No encontramos a nadie con eso.</p>
      ) : (
        <>
          <div className="dir-grid">
            {shown.map((m) => {
              const c = PALETTE[m.colorIndex % PALETTE.length];
              const sub = m.jobTitle && m.company ? `${m.jobTitle} @ ${m.company}` : (m.jobTitle || m.role);

              if (m.tier === 1 && m.huevsiteUsername) {
                const p = profiles.get(m.huevsiteUsername);
                return (
                  <div className="dir-card dir-card-t1" key={m._id} style={p?.accentColor ? { borderColor: p.accentColor } : undefined}>
                    {p?.avatar
                      ? <img className="dir-av dir-av-img" src={p.avatar} alt="" />
                      : <div className="dir-av" style={{ background: c.bg, color: c.color }}>{m.initials}</div>}
                    <div className="dir-info">
                      <div className="dir-name">
                        {m.name}
                        {typeof p?.builderScore === 'number' && <span className="dir-score">{p.builderScore}</span>}
                      </div>
                      <div className="dir-sub">{sub}</div>
                    </div>
                    <button className="dir-cta" onClick={() => onOpenHuevsite({ username: m.huevsiteUsername as string, name: m.name })}>
                      Ver huevsite →
                    </button>
                  </div>
                );
              }

              const web = m.tier === 2 ? (m.websiteUrl || m.companyUrl) : null;
              return (
                <div className="dir-card" key={m._id}>
                  <div className="dir-av" style={{ background: c.bg, color: c.color }}>{m.initials}</div>
                  <div className="dir-info">
                    <div className="dir-name">{m.name}</div>
                    <div className="dir-sub">{sub}</div>
                  </div>
                  {web && <a className="dir-cta dir-cta-web" href={web} target="_blank" rel="noopener">web ↗</a>}
                </div>
              );
            })}
          </div>

          {filtered.length > visible && (
            <button className="btn btn-outline dir-more" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
              Cargar más ({filtered.length - visible} restantes)
            </button>
          )}
        </>
      )}
    </div>
  );
}
