import React from 'react';
import {
  SNAPSHOT_LABEL, GROWTH, ROLES, VERTICALS, LOOKING_FOR, GEOGRAPHY,
  PLATFORM, TEAM, TIERS, CONTACT,
} from './pitch-data';

const PILLARS = [
  { t: 'Startups y proyectos', d: 'Founders, co-founders, primeros hires y primeros usuarios.' },
  { t: 'Conocimiento', d: 'Workshops, charlas de founders y sesiones de preguntas.' },
  { t: 'Red de contactos', d: 'Mentores, inversores y empresas de la zona.' },
  { t: 'Acción real', d: 'No es otro grupo de WhatsApp. Construimos juntos.' },
];

const ACTIVITY = [
  { t: 'Primer co-work', d: 'Ya pasó: un día entero construyendo en Islas del Golf.', done: true },
  { t: 'Kick-off', d: 'El encuentro fundacional de la comunidad.', done: false },
  { t: 'Build with AI', d: 'Sesión práctica: de idea a MVP en pocas horas.', done: false },
  { t: 'Hackathon #1', d: 'El primer hackathon de la zona.', done: false },
];

const SPONSOR_WINS = [
  { t: 'Una audiencia que construye', d: 'Founders y devs AI-first de Zona Norte, en un solo lugar.' },
  { t: 'Tu marca donde pasa', d: 'Presencia en los eventos y en nordelta.tech.' },
  { t: 'Acceso a talento', d: 'Gente que ya está buscando equipo y proyectos.' },
  { t: 'Las startups de la zona, de cerca', d: 'Ves qué se está construyendo antes que nadie.' },
];

function Bars({ data, max }: { data: { label: string; n: number }[]; max: number }) {
  return (
    <div>
      {data.map((d) => (
        <div className="bar-row" key={d.label}>
          <span className="lbl">{d.label}</span>
          <span className="bar"><span className="bar-fill" style={{ width: `${Math.round((d.n / max) * 100)}%` }} /></span>
          <span className="n">{d.n}</span>
        </div>
      ))}
    </div>
  );
}

function Snapshot() {
  return <div className="s-snapshot">{SNAPSHOT_LABEL}</div>;
}

export function buildSlides(memberTotal: number): React.ReactNode[] {
  const growthMax = Math.max(...GROWTH.map((g) => g.n));

  return [
    // 1 — Cover
    <React.Fragment key="cover">
      <div className="s-eyebrow">Pitch para sponsors · 2026</div>
      <h1 className="s-title">BUILD<br />THE FUTURE</h1>
      <p className="s-lead">La comunidad tech de founders, devs y makers de Nordelta y Zona Norte.</p>
      <div className="deck-foot"><span className="big">{memberTotal}+ builders</span>nordelta.tech</div>
    </React.Fragment>,

    // 2 — La oportunidad
    <React.Fragment key="oportunidad">
      <div className="s-eyebrow">La oportunidad</div>
      <h1 className="s-title">ACÁ HAY MUCHA<br />GENTE QUE<br />CONSTRUYE</h1>
      <p className="s-lead">
        Zona Norte está lleno de founders, devs y makers. Hasta ahora cada uno remaba solo:
        no había un lugar tech que los junte. Eso es lo que estamos armando.
      </p>
    </React.Fragment>,

    // 3 — Qué es
    <React.Fragment key="quees">
      <div className="s-eyebrow">Qué es Nordelta Tech</div>
      <h1 className="s-title">TECH NACE<br />EN NORDELTA</h1>
      <p className="s-lead">
        Una comunidad de builders que vive y trabaja en la zona. Nos juntamos a construir,
        no a hacer networking de tarjetita.
      </p>
      <div className="s-grid cols-4">
        {PILLARS.map((p) => (
          <div className="feat-box" key={p.t}><h4>{p.t}</h4><p>{p.d}</p></div>
        ))}
      </div>
    </React.Fragment>,

    // 4 — Tracción
    <React.Fragment key="traccion">
      <div className="s-eyebrow">Tracción</div>
      <div className="s-bignum">{memberTotal}+</div>
      <p className="s-lead">builders en cuestión de semanas. Sin pauta, todo boca a boca.</p>
      <div className="timeline">
        {GROWTH.map((g) => (
          <div className="tl-step" key={g.label}>
            <div className="tl-n">{g.n}</div>
            <div className="tl-bar" style={{ height: `${Math.max(8, Math.round((g.n / growthMax) * 180))}px` }} />
            <div className="tl-l">{g.label}</div>
          </div>
        ))}
      </div>
      <Snapshot />
    </React.Fragment>,

    // 5 — Quiénes son
    <React.Fragment key="quienes">
      <div className="s-eyebrow">Quiénes son</div>
      <h1 className="s-title">NO ES UNA<br />LISTA DE EMAILS</h1>
      <Bars data={ROLES} max={ROLES[0].n} />
      <p className="s-lead" style={{ marginTop: 18 }}>9 de cada 10 son founders o devs.</p>
      <Snapshot />
    </React.Fragment>,

    // 6 — Qué construyen
    <React.Fragment key="construyen">
      <div className="s-eyebrow">Qué construyen</div>
      <h1 className="s-title">UNA COMUNIDAD<br />AI-FIRST</h1>
      <div className="chips">
        {VERTICALS.map((v) => (
          <span className="chip" key={v.label}>{v.label}<span className="n">{v.n}</span></span>
        ))}
      </div>
      <Snapshot />
    </React.Fragment>,

    // 7 — De dónde son
    <React.Fragment key="geo">
      <div className="s-eyebrow">De dónde son</div>
      <h1 className="s-title">TODO A 20 MINUTOS</h1>
      <p className="s-lead">Por eso pasa en persona, no sólo en un chat.</p>
      <div className="chips" style={{ marginTop: 24 }}>
        {GEOGRAPHY.map((g) => (<span className="chip" key={g}>{g}</span>))}
      </div>
    </React.Fragment>,

    // 8 — Qué buscan
    <React.Fragment key="buscan">
      <div className="s-eyebrow">Qué buscan</div>
      <h1 className="s-title">VIENEN A BUSCAR<br />COSAS CONCRETAS</h1>
      <Bars data={LOOKING_FOR} max={LOOKING_FOR[0].n} />
      <Snapshot />
    </React.Fragment>,

    // 9 — Qué hacemos
    <React.Fragment key="hacemos">
      <div className="s-eyebrow">Qué hacemos</div>
      <h1 className="s-title">ESTO RECIÉN ARRANCA</h1>
      <div className="s-grid cols-4">
        {ACTIVITY.map((a) => (
          <div className="feat-box" key={a.t}>
            <h4>{a.t} {a.done ? '✓' : ''}</h4>
            <p>{a.d}</p>
          </div>
        ))}
      </div>
    </React.Fragment>,

    // 10 — La plataforma
    <React.Fragment key="plataforma">
      <div className="s-eyebrow">La plataforma</div>
      <h1 className="s-title">NO ES SÓLO UN GRUPO</h1>
      <p className="s-lead">
        nordelta.tech tiene dashboard, perfiles públicos de cada builder y un directorio
        de la comunidad. Presencia online real, no sólo un chat.
      </p>
      <div className="s-grid cols-3">
        <div className="kpi"><div className="v">{PLATFORM.huevsites}</div><div className="k">perfiles públicos armados</div></div>
        <div className="kpi"><div className="v">{PLATFORM.linkedin}</div><div className="k">con LinkedIn conectado</div></div>
        <div className="kpi"><div className="v">{PLATFORM.websites}</div><div className="k">con web propia</div></div>
      </div>
      <Snapshot />
    </React.Fragment>,

    // 11 — Equipo
    <React.Fragment key="equipo">
      <div className="s-eyebrow">Quiénes lo organizan</div>
      <h1 className="s-title">GENTE QUE VIVE Y<br />CONSTRUYE ACÁ</h1>
      <div className="s-grid cols-3">
        {TEAM.map((m) => (
          <div className="team-card" key={m.name}>
            <div className="team-av">{m.initials}</div>
            <div className="nm">{m.name}</div>
            <div className="ro">{m.role}</div>
          </div>
        ))}
      </div>
    </React.Fragment>,

    // 12 — Por qué un sponsor
    <React.Fragment key="porque">
      <div className="s-eyebrow">Por qué sumarte</div>
      <h1 className="s-title">QUÉ GANÁS</h1>
      <div className="s-grid cols-2">
        {SPONSOR_WINS.map((w) => (
          <div className="feat-box" key={w.t}><h4>{w.t}</h4><p>{w.d}</p></div>
        ))}
      </div>
    </React.Fragment>,

    // 13 — Formas de sumarte
    <React.Fragment key="formas">
      <div className="s-eyebrow">Formas de sumarte</div>
      <h1 className="s-title">ELEGÍ CÓMO ENTRAR</h1>
      <div className="s-grid cols-3">
        {TIERS.map((t, idx) => (
          <div className={`tier-card${idx === 0 ? ' lead' : ''}`} key={t.name}>
            <div className="tn">{t.name}</div>
            <div className="tt">{t.tagline}</div>
            <ul>{t.perks.map((p) => (<li key={p}>{p}</li>))}</ul>
          </div>
        ))}
      </div>
      <p className="s-snapshot">Sin precio de lista: armamos el formato juntos.</p>
    </React.Fragment>,

    // 14 — Hablemos
    <React.Fragment key="hablemos">
      <div className="s-eyebrow">Hablemos</div>
      <h1 className="s-title">SUMATE A LA QUE<br />CONSTRUYE LA ZONA</h1>
      <p className="s-lead">
        Si querés acompañar esto desde el lado que construye Zona Norte, escribinos y
        armamos el formato.
      </p>
      <div className="deck-foot">
        <span className="big"><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></span>
        {CONTACT.site}
      </div>
    </React.Fragment>,
  ];
}
