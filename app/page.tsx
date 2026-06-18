"use client";

import { useEffect, useState } from 'react';
import PresentationFields, { EMPTY_PRESENTATION, presentationPayload, type PresentationState } from './components/PresentationFields';

interface HuevsiteData {
  username: string;
  avatar: string | null;
  accentColor: string | null;
  builderScore: number | null;
  headline: string | null;
  url: string;
}

interface Member {
  _id: string;
  name: string;
  initials: string;
  role: string;
  jobTitle?: string;
  company?: string;
  companyUrl?: string;
  tags?: string[];
  colorIndex: number;
  huevsiteUsername?: string | null;
  huevsiteFeatured?: boolean;
  huevsite?: HuevsiteData | null;
}

const PALETTE = [
  { bg: 'rgba(0,229,160,.1)',  color: '#00e5a0' },
  { bg: 'rgba(33,150,243,.1)', color: '#2196f3' },
  { bg: 'rgba(255,152,0,.1)',  color: '#ff9800' },
  { bg: 'rgba(156,39,176,.1)', color: '#9c27b0' },
  { bg: 'rgba(244,67,54,.1)',  color: '#ef5350' },
  { bg: 'rgba(0,188,212,.1)',  color: '#00bcd4' },
  { bg: 'rgba(255,193,7,.1)',  color: '#ffc107' },
  { bg: 'rgba(76,175,80,.1)',  color: '#4caf50' },
];

export default function Home() {
  const [isMobOpen, setIsMobOpen] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [memberTotal, setMemberTotal] = useState<number | null>(null);
  const [huevsiteUrl, setHuevsiteUrl] = useState('https://huevsite.io');
  const [huevView, setHuevView] = useState<{ username: string; name: string } | null>(null);

  const [navScrolled, setNavScrolled] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', role: '', company: '', companyUrl: '' });
  const [formTags, setFormTags] = useState<string[]>([]);
  const [presentation, setPresentation] = useState<PresentationState>(EMPTY_PRESENTATION);
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const patchPresentation = (patch: Partial<PresentationState>) => setPresentation(prev => ({ ...prev, ...patch }));

  const AVAILABLE_TAGS = ['AI', 'SaaS', 'Fintech', 'Web3', 'Proptech', 'Dev', 'Design', 'Marketing', 'Founder', 'Builder', 'Inversor'];
  const toggleTag = (tag: string) => setFormTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const closeMob = () => setIsMobOpen(false);

  const fetchMembers = () => {
    fetch('/api/members')
      .then(r => r.json())
      .then(data => {
        setMembers(data.members ?? []);
        if (typeof data.total === 'number') setMemberTotal(data.total);
        if (typeof data.huevsiteUrl === 'string') setHuevsiteUrl(data.huevsiteUrl);
      })
      .catch(() => {})
      .finally(() => setMembersLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Nav condenses on scroll + scroll-reveal for sections (progressive
  // enhancement: hidden state only applies once JS marks the doc ready).
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const root = document.documentElement;
    root.classList.add('reveal-ready');
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-reveal], .about-grid > div, .feat, .terminal, .events-hd, .ev-card:not(.ev-dim), .comunidad-head, .cta-inner',
      ),
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    targets.forEach((t, i) => {
      t.style.setProperty('--reveal-i', String(i % 6));
      io.observe(t);
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, []);

  // Two independent rows (even/odd split) for the 2-row slider; each row is its
  // own seamless marquee, so odd member counts never leave an empty slot.
  const memberRow1 = members.filter((_, i) => i % 2 === 0);
  const memberRow2 = members.filter((_, i) => i % 2 === 1);

  const renderMemberCard = (m: Member, key: string) => {
    const c = PALETTE[m.colorIndex % PALETTE.length];
    const huev = m.huevsite;
    const accent = huev?.accentColor || c.color;
    return (
      <div key={key} className={`member${huev ? ' member-huev' : ''}${m.huevsiteFeatured ? ' member-feat' : ''}`}>
        {m.huevsiteFeatured && <span className="member-feat-badge">★ destacado</span>}
        <div
          className="avatar"
          style={huev?.avatar
            ? { backgroundImage: `url(${huev.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent', border: `2px solid ${accent}` }
            : { background: c.bg, color: c.color }}
        >
          {huev?.avatar ? '' : m.initials}
        </div>
        <h4>{m.name}</h4>
        <div className="member-role">
          {m.jobTitle && m.company
            ? <>{m.jobTitle} @ <a href={m.companyUrl} target="_blank" rel="noopener" style={{ color: accent }}>{m.company}</a></>
            : m.role}
        </div>
        <div className="tags">
          {m.tags?.slice(0, 3).map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>
        {huev && (
          <button
            className="member-huev-btn"
            style={{ color: accent, borderColor: `${accent}55` }}
            onClick={() => setHuevView({ username: huev.username, name: m.name })}
          >
            {typeof huev.builderScore === 'number' ? `Ver huevsite · ${huev.builderScore} pts →` : 'Ver huevsite →'}
          </button>
        )}
      </div>
    );
  };

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth > 960) closeMob(); };
    window.addEventListener('resize', handleResize);

    // Particles parallax effect
    const orbs = document.querySelectorAll('.orb') as NodeListOf<HTMLElement>;
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      orbs.forEach((orb, index) => {
        const factor = (index + 1) * 0.8;
        orb.style.transform = `translate(calc(-50% + ${x * factor}px), calc(-50% + ${y * factor}px))`;
      });
    };
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (isMobOpen || showJoinModal || huevView) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
  }, [isMobOpen, showJoinModal, huevView]);

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tags: formTags, ...presentationPayload(presentation) }),
      });
      if (!res.ok) throw new Error('Error al registrar');
      setFormStatus('success');
      fetchMembers();
    } catch (err) {
      setFormStatus('error');
    }
  };

  const handleAddAnother = () => {
    setFormData({ name: '', email: '', role: '', company: '', companyUrl: '' });
    setFormTags([]);
    setPresentation(EMPTY_PRESENTATION);
    setFormStatus('idle');
  };

  return (
    <>
      <nav className={navScrolled ? 'scrolled' : ''}>
        <a href="#" className="nav-logo">
          <img src="/assets/logo.png" alt="" width={32} height={32} />
          Nordelta<em> Tech</em>
        </a>
        <ul className="nav-center">
          <li><a href="#sobre">Sobre</a></li>
          <li><a href="#eventos">Eventos</a></li>
          <li><a href="#comunidad">Comunidad</a></li>
        </ul>
        <div className="nav-right">
          <a href="/login" className="btn btn-outline">Iniciar sesión</a>
          <button onClick={() => setShowJoinModal(true)} className="btn btn-green">Unirse</button>
          <button className={`hamburger ${isMobOpen ? 'open' : ''}`} onClick={() => setIsMobOpen(!isMobOpen)} aria-label="Menú">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${isMobOpen ? 'open' : ''}`} id="mob">
        <a href="#sobre" onClick={closeMob}>Sobre</a>
        <a href="#eventos" onClick={closeMob}>Eventos</a>
        <a href="#comunidad" onClick={closeMob}>Comunidad</a>
        <a href="/login" onClick={closeMob}>Iniciar sesión</a>
        <button className="btn btn-green" onClick={() => { closeMob(); setShowJoinModal(true); }}>
          Unirse a la comunidad
        </button>
      </div>

      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>

        <div className="hero-left container" style={{ maxWidth: 'none' }}>
          <div className="pill">
            <span className="pill-dot"></span>
            nordelta.tech
            <span className="pill-sep">/</span>
            Zona Norte BA
            <span className="pill-sep">/</span>
            v0.1 beta
          </div>
          <h1 className="hero-h1 display">
            BUILD<br />
            <span className="green">THE</span><br />
            <span className="stroke">FUTURE.</span>
          </h1>
          <p className="hero-sub">
            La comunidad tech de founders, devs y makers de Nordelta y zona norte.
            Construimos startups, compartimos conocimiento y hacemos crecer el ecosistema
            desde el agua. Ahora en <span className="domain">nordelta.tech</span>.
          </p>
          <div className="hero-actions">
            <button onClick={() => setShowJoinModal(true)} className="btn btn-green">
              Unirse a la comunidad
            </button>
            <a href="#eventos" className="btn btn-ghost">Ver eventos →</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="val">{memberTotal ?? '—'}</div>
              <div className="lbl">Miembros fundadores</div>
            </div>
            <div className="hero-stat">
              <div className="val">2025</div>
              <div className="lbl">Año de inicio</div>
            </div>
            <div className="hero-stat">
              <div className="val">∞</div>
              <div className="lbl">Por construir</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-orbit">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            <div className="orb orb-3"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-1"></div>
            <div className={`orbit-core${membersLoading ? ' is-loading' : ''}`}>
              <span className="orbit-core-pulse" />
              {membersLoading ? (
                <span className="orbit-core-spinner" aria-label="Cargando" />
              ) : (
                <>
                  <span className="orbit-core-val">{memberTotal ?? '—'}</span>
                  <span className="orbit-core-lbl">builders</span>
                </>
              )}
            </div>
            <div className={`orbit-spin${membersLoading ? ' is-loading' : ''}`}>
              {(membersLoading ? Array.from({ length: 8 }) : members.slice(0, 8)).map((m: unknown, i: number, arr: unknown[]) => {
                const angle = (360 / Math.max(arr.length, 1)) * i;
                if (membersLoading) {
                  return (
                    <div key={`sk-${i}`} className="orbit-node" style={{ ['--a']: `${angle}deg` } as React.CSSProperties}>
                      <div className="orbit-counter">
                        <div className="orbit-avatar orbit-avatar-skel" style={{ animationDelay: `${(i * -0.15).toFixed(2)}s` }} />
                      </div>
                    </div>
                  );
                }
                const mem = m as Member;
                const c = PALETTE[mem.colorIndex % PALETTE.length];
                const accent = mem.huevsite?.accentColor || c.color;
                const hasImg = Boolean(mem.huevsite?.avatar);
                return (
                  <div key={mem._id} className="orbit-node" style={{ ['--a']: `${angle}deg` } as React.CSSProperties}>
                    <div className="orbit-counter">
                      <div
                        className="orbit-avatar"
                        aria-label={mem.name}
                        style={{
                          borderColor: accent,
                          color: hasImg ? 'transparent' : accent,
                          background: hasImg ? undefined : `${accent}1f`,
                          backgroundImage: hasImg ? `url(${mem.huevsite!.avatar})` : undefined,
                          animationDelay: `${(i * -0.8).toFixed(1)}s`,
                        }}
                      >
                        {hasImg ? '' : mem.initials}
                      </div>
                      <span className="orbit-name">{mem.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <a href="#sobre" className="hero-scroll" aria-label="Bajar">
          <span className="hero-scroll-dot" />
          scroll
        </a>
      </section>

      <div className="marquee-wrap">
        <div className="marquee-track">
          {Array(20).fill([
            'Inteligencia Artificial', 'Fintech', 'SaaS', 'Web3', 'Proptech',
            'Healthtech', 'EdTech', 'Developer Tools', 'E-commerce', 'Networking'
          ]).flat().map((item, i) => (
            <div key={i} className="m-item"><span></span>{item}</div>
          ))}
        </div>
      </div>

      <section id="sobre" className="section">
        <div className="about-grid">
          <div>
            <div className="eyebrow">¿Qué es esto?</div>
            <h2 className="sec-title display">TECH NACE<br />EN NORDELTA</h2>
            <p className="sec-sub">
              Somos un grupo de builders que vive y trabaja en Nordelta y zona norte del Gran Buenos Aires.
              Arrancamos en 2025 con ganas de construir el ecosistema tech de la zona — desde cero, sin humo.
            </p>
            <div className="feat-grid">
              <div className="feat"><div className="feat-icon">🚀</div><h4>Startups & Proyectos</h4><p>Conectamos fundadores con co-founders, early hires y primeros usuarios.</p></div>
              <div className="feat"><div className="feat-icon">🧠</div><h4>Conocimiento</h4><p>Workshops técnicos, talks de founders y sesiones de Q&A.</p></div>
              <div className="feat"><div className="feat-icon">🤝</div><h4>Red de Contactos</h4><p>Inversores, mentores y corporaciones de zona norte.</p></div>
              <div className="feat"><div className="feat-icon">⚡</div><h4>Acción Real</h4><p>No es otro grupo de WhatsApp. Construimos cosas juntos.</p></div>
            </div>
          </div>
          <div>
            <div className="terminal">
              <div className="t-bar">
                <div className="td"></div><div className="td"></div><div className="td"></div>
                <span>~/nordelta.tech</span>
              </div>
              <div className="t-body mono">
                <div><span className="pr">$</span> <span className="cm">whoami</span></div>
                <div><span className="ou">→ builders, devs, founders, makers</span></div>
                <div>&nbsp;</div>
                <div><span className="pr">$</span> <span className="cm">cat ./manifest.json</span></div>
                <div><span className="ou">{`{ "domain": "nordelta.tech",`}</span></div>
                <div><span className="ou">&nbsp;&nbsp;{`"members": 40,`}</span></div>
                <div><span className="ou">&nbsp;&nbsp;{`"year": 2025,`}</span></div>
                <div><span className="ou">&nbsp;&nbsp;{`"status": "shipping" }`}</span></div>
                <div>&nbsp;</div>
                <div><span className="pr">$</span> <span className="cm">next-event</span></div>
                <div><span className="ou">→ Kick-off — fecha por confirmar</span></div>
                <div><span className="ou">→ Nordelta, zona norte BA</span></div>
                <div>&nbsp;</div>
                <div><span className="pr">$</span> <span className="cm">join<span className="cursor"></span></span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="events-bg">
        <section id="eventos" className="section">
          <div className="events-hd">
            <div>
              <div className="eyebrow">Agenda</div>
              <h2 className="sec-title display">PRÓXIMOS<br />EVENTOS</h2>
            </div>
            <button onClick={() => setShowJoinModal(true)} className="btn btn-ghost">Avisame de nuevos eventos →</button>
          </div>
          <div className="events-grid">
            <div className="ev-card ev-featured">
              <div className="ev-badge badge-star">★ Evento fundacional</div>
              <h3>Kick-off Nordelta Tech</h3>
              <p>El primer encuentro de la comunidad. Nos juntamos para conocernos, contar en qué estamos construyendo y definir juntos el rumbo de Nordelta Tech. Lugar y fecha a confirmar — anotate para que te avisemos en cuanto esté todo listo.</p>
              <div className="ev-meta">
                <span className="ev-date">Fecha a confirmar · Nordelta</span>
                <button onClick={() => setShowJoinModal(true)} className="ev-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>Avisame cuando sea →</button>
              </div>
            </div>
            <div className="ev-card ev-dim">
              <div className="ev-badge badge-ws">Workshop</div>
              <h3>Build with AI — TBD</h3>
              <p>Sesión práctica de vibe coding: de idea a MVP en pocas horas. Fecha a definir por la comunidad.</p>
              <div className="ev-meta"><span className="ev-date">Próximamente</span><span>Nordelta</span></div>
            </div>
            <div className="ev-card ev-dim">
              <div className="ev-badge badge-hack">Hackathon</div>
              <h3>Nordelta Hack #1 — TBD</h3>
              <p>El primer hackathon de la comunidad. Track y fecha a definir. ¿Tenés idea de tema? Sugerila.</p>
              <div className="ev-meta"><span className="ev-date">Próximamente</span><span>Nordelta</span></div>
            </div>
          </div>
        </section>
      </div>

      <section id="comunidad" className="section">
        <div className="comunidad-head">
          <div className="comunidad-head-main">
            <div className="eyebrow">Miembros fundadores</div>
            <h2 className="sec-title display">LA COMUNIDAD</h2>
            <p className="sec-sub">Los primeros builders armando esto desde el día cero. Cada perfil es un huevsite vivo. Si todavía no estás, estás a un clic.</p>
          </div>
          <aside className="huev-badge">
            <span className="huev-badge-label">Perfiles en vivo</span>
            <a href={huevsiteUrl} target="_blank" rel="noopener" className="pill huev-pill">
              <span className="pill-dot" />
              powered by <span className="huev-wm">huev<span>site</span>.io</span>
            </a>
            <a href={huevsiteUrl} target="_blank" rel="noopener" className="huev-badge-cta">Armá el tuyo →</a>
          </aside>
        </div>
        {membersLoading ? (
          <div className="members-slider members-skeleton">
            {[0, 1].map((r) => (
              <div className="members-row" key={r}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="member member-skel" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="members-slider">
            <div className="members-row">
              <div className="members-track" style={{ animationDuration: `${Math.max(24, memberRow1.length * 6)}s` }}>
                {[...memberRow1, ...memberRow1].map((m, i) => renderMemberCard(m, `r1-${i}-${m._id}`))}
              </div>
            </div>
            <div className="members-row">
              <div className="members-track members-track-2" style={{ animationDuration: `${Math.max(24, memberRow2.length * 6)}s` }}>
                {[...memberRow2, ...memberRow2].map((m, i) => renderMemberCard(m, `r2-${i}-${m._id}`))}
              </div>
            </div>
          </div>
        )}

        <div className="members-join">
          <button onClick={() => setShowJoinModal(true)} className="btn btn-green">Sumate a la comunidad →</button>
        </div>
      </section>

      <div id="join" className="cta-band">
        <div className="cta-inner">
          <div>
            <h2 className="display">¿LISTO PARA<br />CONSTRUIR?</h2>
            <p>Sumate a Nordelta Tech. Es gratis, es local y es real. Nos vemos en nordelta.tech.</p>
          </div>
          <button onClick={() => setShowJoinModal(true)} className="btn btn-dark" style={{ fontSize: '.9rem', padding: '16px 36px' }}>
            Unirse al grupo
          </button>
        </div>
      </div>

      <footer id="contacto">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="f-brand">
              <div className="logo">
                <img src="/assets/logo.png" alt="" width={40} height={40} />
                Nordelta Tech
              </div>
              <div className="domain-tag">→ nordelta.tech</div>
              <p>Comunidad tech de Nordelta y zona norte del Gran Buenos Aires. Construimos juntos desde cero.</p>
            </div>
            <div className="f-col">
              <h5>Comunidad</h5>
              <a href="#sobre">Sobre nosotros</a>
              <a href="#comunidad">Miembros</a>
              <a href="#eventos">Eventos</a>
              <a href="/login">Iniciar sesión</a>
            </div>
            <div className="f-col">
              <h5>Contacto</h5>
              <a href="#" onClick={(e) => { e.preventDefault(); setShowJoinModal(true); }}>Unirse a la comunidad</a>
              <a href="tel:+541125085500">+54 11 2508-5500</a>
              <a href="https://nordelta.tech" target="_blank">nordelta.tech</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Nordelta Tech · nordelta.tech · Nordelta, Pcia. de Buenos Aires</p>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowJoinModal(true); }} className="f-wa">
              Unirse a la comunidad
            </a>
          </div>
        </div>
      </footer>

      {/* JOIN MODAL */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowJoinModal(false); }}>
          <div className="modal-card">
            <button onClick={() => setShowJoinModal(false)} className="modal-close" aria-label="Cerrar">&times;</button>

            {formStatus === 'success' ? (
              <div className="modal-success">
                <div className="success-badge">✓</div>
                <h3 className="success-title">¡Recibimos tu <span style={{ color: 'var(--accent)' }}>registro</span>!</h3>
                <p className="success-text">Tu solicitud para sumarte a nordelta.tech quedó registrada.</p>
                <div className="success-note">
                  <strong>$ status --pending</strong><br />
                  Un admin va a revisar tu solicitud. Cuando te <strong>aceptemos</strong> te llega un email con tu acceso al dashboard y la <strong>invitación al grupo de WhatsApp</strong>. Revisá el inbox (y el spam, por las dudas).
                </div>
                <div className="success-actions">
                  <button onClick={handleAddAnother} className="btn btn-outline">+ Registrar a otro builder</button>
                </div>
              </div>
            ) : (
              <>
                <div className="modal-eyebrow">$ join --community</div>
                <h3 className="modal-title">Sumate a <span className="green">nordelta.tech</span></h3>
                <p className="modal-sub">Contanos quién sos, dónde vivís y qué construís. Un admin revisa tu presentación y, si te acepta, te llega el acceso y la invitación al grupo de WhatsApp por email.</p>

                <form onSubmit={handleJoinSubmit} className="modal-form">
                  <div className="field">
                    <label>Nombre completo</label>
                    <input required placeholder="Ej. Ada Lovelace" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="field">
                    <label>E-mail</label>
                    <input required type="email" placeholder="ada@ejemplo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="field">
                    <label>¿A qué te dedicás?</label>
                    <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                      <option value="" disabled>Seleccioná tu rol...</option>
                      <option value="Founder/CEO">Founder / CEO</option>
                      <option value="Developer/Engineer">Developer / Engineer</option>
                      <option value="Product/Design">Product / Design</option>
                      <option value="Marketing/Growth">Marketing / Growth</option>
                      <option value="Inversor">Inversor / VC</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label>Empresa / Proyecto</label>
                      <input placeholder="Ej. huevsite.io" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                    </div>
                    <div className="field">
                      <label>URL</label>
                      <input type="url" placeholder="https://..." value={formData.companyUrl} onChange={e => setFormData({...formData, companyUrl: e.target.value})} />
                    </div>
                  </div>
                  <div className="field">
                    <label>Tags <span className="opt">(opcional)</span></label>
                    <div className="tag-picker">
                      {AVAILABLE_TAGS.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`tag-btn${formTags.includes(tag) ? ' active' : ''}`}
                        >{tag}</button>
                      ))}
                    </div>
                  </div>
                  <div className="modal-eyebrow" style={{ marginTop: 4 }}>$ tu --presentación</div>
                  <PresentationFields value={presentation} onChange={patchPresentation} huevsiteBaseUrl={huevsiteUrl} />
                  <button type="submit" disabled={formStatus === 'loading'} className="btn btn-green">
                    {formStatus === 'loading' ? 'Guardando...' : 'Unirme a nordelta.tech →'}
                  </button>
                  {formStatus === 'error' && <p className="form-error">Hubo un error al guardar. Intentá de nuevo.</p>}
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* HUEVSITE IFRAME MODAL */}
      {huevView && (
        <div className="modal-overlay huev-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setHuevView(null); }}>
          <div className="huev-modal">
            <div className="huev-modal-bar">
              <span className="huev-modal-title">{huevView.name} · <span className="green">@{huevView.username}</span></span>
              <div className="huev-modal-actions">
                <a href={`${huevsiteUrl}/${huevView.username}`} target="_blank" rel="noopener" className="btn btn-ghost">Abrir ↗</a>
                <button onClick={() => setHuevView(null)} className="modal-close huev-modal-close" aria-label="Cerrar">&times;</button>
              </div>
            </div>
            <iframe
              className="huev-iframe"
              src={`${huevsiteUrl}/${huevView.username}?embed=1`}
              title={`huevsite de ${huevView.name}`}
              loading="lazy"
            />
          </div>
        </div>
      )}
    </>
  );
}
