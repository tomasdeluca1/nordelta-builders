"use client";

import { useEffect, useState } from 'react';
import PresentationFields, { EMPTY_PRESENTATION, presentationPayload, type PresentationState } from './components/PresentationFields';
import { ROLES } from '@/lib/profile-fields';
import CommunityDirectory from './components/CommunityDirectory';
import { PALETTE } from '@/lib/palette';

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
  websiteUrl?: string | null;
}

export default function Home() {
  const [isMobOpen, setIsMobOpen] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [me, setMe] = useState<{ name: string; initials: string; colorIndex: number } | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [memberTotal, setMemberTotal] = useState<number | null>(null);

  const [navScrolled, setNavScrolled] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', role: '', jobTitle: '', company: '', companyUrl: '' });
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
      })
      .catch(() => {})
      .finally(() => setMembersLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Estado de sesión para el chip del nav (top-right).
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => setMe(d.user ?? null))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    window.location.href = '/';
  };

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

  // Builders con sitio propio, para la grilla de la sección comunidad.
  const sites = members.filter(m => m.websiteUrl);

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
    if (isMobOpen || showJoinModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
  }, [isMobOpen, showJoinModal]);

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
    setFormData({ name: '', email: '', role: '', jobTitle: '', company: '', companyUrl: '' });
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
          {me ? (
            <>
              <a href="/dashboard" className="nav-user" title="Ir a mi dashboard">
                <span
                  className="nav-user-av"
                  style={{ background: PALETTE[me.colorIndex % PALETTE.length].bg, color: PALETTE[me.colorIndex % PALETTE.length].color }}
                >{me.initials}</span>
                <span className="nav-user-name">{me.name.split(' ')[0]}</span>
              </a>
              <button onClick={handleLogout} className="btn btn-outline nav-logout">Salir</button>
            </>
          ) : (
            <>
              <a href="/login" className="btn btn-outline">Iniciar sesión</a>
              <button onClick={() => setShowJoinModal(true)} className="btn btn-green">Unirse</button>
            </>
          )}
          <button className={`hamburger ${isMobOpen ? 'open' : ''}`} onClick={() => setIsMobOpen(!isMobOpen)} aria-label="Menú">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${isMobOpen ? 'open' : ''}`} id="mob">
        <a href="#sobre" onClick={closeMob}>Sobre</a>
        <a href="#eventos" onClick={closeMob}>Eventos</a>
        <a href="#comunidad" onClick={closeMob}>Comunidad</a>
        {me ? (
          <>
            <a href="/dashboard" onClick={closeMob}>Mi dashboard</a>
            <button className="btn btn-outline" onClick={() => { closeMob(); handleLogout(); }}>Salir</button>
          </>
        ) : (
          <>
            <a href="/login" onClick={closeMob}>Iniciar sesión</a>
            <button className="btn btn-green" onClick={() => { closeMob(); setShowJoinModal(true); }}>
              Unirse a la comunidad
            </button>
          </>
        )}
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
                return (
                  <div key={mem._id} className="orbit-node" style={{ ['--a']: `${angle}deg` } as React.CSSProperties}>
                    <div className="orbit-counter">
                      <div
                        className="orbit-avatar"
                        aria-label={mem.name}
                        style={{
                          borderColor: c.color,
                          color: c.color,
                          background: `${c.color}1f`,
                          animationDelay: `${(i * -0.8).toFixed(1)}s`,
                        }}
                      >
                        {mem.initials}
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
                <div><span className="ou">&nbsp;&nbsp;{`"members": ${memberTotal ?? 163},`}</span></div>
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
            <p className="sec-sub">Los primeros builders armando esto desde el día cero. Cada uno con lo que está construyendo. Si todavía no estás, estás a un clic.</p>
          </div>
        </div>

        {membersLoading ? (
          <div className="sites"><div className="dir-grid">
            {Array.from({ length: 6 }).map((_, i) => <div className="dir-card site-skel" key={i} />)}
          </div></div>
        ) : sites.length > 0 && (
          <div className="sites"><div className="dir-grid">
            {sites.map(m => {
              const c = PALETTE[m.colorIndex % PALETTE.length];
              const sub = m.jobTitle && m.company ? `${m.jobTitle} @ ${m.company}` : (m.jobTitle || m.role);
              return (
                <div className="dir-card dir-card-t1" key={m._id}>
                  <div className="dir-av" style={{ background: c.bg, color: c.color }}>{m.initials}</div>
                  <div className="dir-info">
                    <div className="dir-name">{m.name}</div>
                    <div className="dir-sub">{sub}</div>
                  </div>
                  <a className="dir-cta" href={m.websiteUrl as string} target="_blank" rel="noopener">
                    Abrir ↗
                  </a>
                </div>
              );
            })}
          </div></div>
        )}

        <CommunityDirectory />

        <div className="members-join">
          {me
            ? <a href="/dashboard" className="btn btn-outline">Sumá tu sitio →</a>
            : <button onClick={() => setShowJoinModal(true)} className="btn btn-green">Sumate a la comunidad →</button>}
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

      {showJoinModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowJoinModal(false); }}>
          <div className="modal-card">
            <button onClick={() => setShowJoinModal(false)} className="modal-close" aria-label="Cerrar">&times;</button>

            {formStatus === 'success' ? (
              <div className="modal-success">
                <div className="success-badge">✓</div>
                <h3 className="success-title">¡Estás <span style={{ color: 'var(--accent)' }}>adentro</span>!</h3>
                <p className="success-text">Ya sos parte de nordelta.tech.</p>
                <div className="success-note">
                  <strong>$ status --ok</strong><br />
                  Te mandamos un mail con tu <strong>acceso al dashboard</strong> y la <strong>invitación al grupo de WhatsApp</strong>. Revisá el inbox (y el spam, por las dudas).
                </div>
                <div className="success-actions">
                  <button onClick={handleAddAnother} className="btn btn-outline">+ Registrar a otro builder</button>
                </div>
              </div>
            ) : (
              <>
                <div className="modal-eyebrow">$ join --community</div>
                <h3 className="modal-title">Sumate a <span className="green">nordelta.tech</span></h3>
                <p className="modal-sub">Contanos quién sos, dónde vivís y qué construís. Entrás al toque: te llega un mail con tu acceso y la invitación al grupo de WhatsApp.</p>

                <form onSubmit={handleJoinSubmit} className="modal-form">
                  <div className="field">
                    <label>Nombre completo</label>
                    <input required placeholder="Ej. Ada Lovelace" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="field">
                    <label>E-mail</label>
                    <input required type="email" placeholder="ada@ejemplo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label>¿Cuál es tu área?</label>
                      <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="" disabled>Seleccioná tu área...</option>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Cargo <span className="opt">(opcional)</span></label>
                      <input placeholder="Ej. Partner & CTO" maxLength={80} value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label>Empresa / Proyecto</label>
                      <input placeholder="Ej. Nordelta Tech" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                    </div>
                    <div className="field">
                      <label>URL</label>
                      <input type="text" placeholder="tu-empresa.com" value={formData.companyUrl} onChange={e => setFormData({...formData, companyUrl: e.target.value})} />
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
                  <PresentationFields value={presentation} onChange={patchPresentation} />
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
    </>
  );
}
