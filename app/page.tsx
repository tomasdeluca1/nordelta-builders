"use client";

import { useEffect, useState } from 'react';

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
  const [formData, setFormData] = useState({ name: '', email: '', role: '', company: '', companyUrl: '' });
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const AVAILABLE_TAGS = ['AI', 'SaaS', 'Fintech', 'Web3', 'Proptech', 'Dev', 'Design', 'Marketing', 'Founder', 'Builder', 'Inversor'];
  const toggleTag = (tag: string) => setFormTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const closeMob = () => setIsMobOpen(false);

  useEffect(() => {
    fetch('/api/members')
      .then(r => r.json())
      .then(data => setMembers(data.members ?? []));
  }, []);

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

  const WHATSAPP_URL = 'https://chat.whatsapp.com/BCjkNIAfX5k157xVl28NCT';

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tags: formTags }),
      });
      if (!res.ok) throw new Error('Error al registrar');
      setFormStatus('success');
      window.location.href = WHATSAPP_URL;
    } catch (err) {
      setFormStatus('error');
    }
  };

  const openWhatsApp = () => {
    window.open('https://chat.whatsapp.com/BCjkNIAfX5k157xVl28NCT', '_blank');
  };

  return (
    <>
      <nav>
        <a href="#" className="nav-logo">Nordelta<em> Build</em></a>
        <ul className="nav-center">
          <li><a href="#sobre">Sobre</a></li>
          <li><a href="#eventos">Eventos</a></li>
          <li><a href="#comunidad">Comunidad</a></li>
        </ul>
        <div className="nav-right">
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
        <button className="btn btn-wa" onClick={() => { closeMob(); setShowJoinModal(true); }}>
          Unirse al grupo
        </button>
      </div>

      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>

        <div className="hero-left container" style={{ maxWidth: 'none' }}>
          <div className="pill"><span className="pill-dot"></span>Nordelta · Zona Norte · Recién arrancamos</div>
          <h1 className="hero-h1 display">
            BUILD<br />
            <span className="green">THE</span><br />
            <span className="stroke">FUTURE</span>
          </h1>
          <p className="hero-sub">
            La comunidad de founders, devs y makers de Nordelta y zona norte.
            Construimos startups, compartimos conocimiento y hacemos crecer el ecosistema tech desde el agua.
          </p>
          <div className="hero-actions">
            <button onClick={() => setShowJoinModal(true)} className="btn btn-green">
              Unirse a la comunidad
            </button>
            <a href="#eventos" className="btn btn-ghost">Ver eventos →</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="val">~40</div>
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
          <div className="orb-wrap">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            <div className="orb orb-3"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-1"></div>
            <div className="float-card fc-a">
              <div className="fc-val">~40</div>
              <div className="fc-lbl">Miembros fundadores</div>
            </div>
            <div className="float-card fc-b">
              <div className="fc-val">2025</div>
              <div className="fc-lbl">Año de inicio</div>
            </div>
            <div className="float-card fc-c">
              <div className="fc-val">∞</div>
              <div className="fc-lbl">Por construir</div>
            </div>
          </div>
        </div>
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
              Arrancamos en 2025 con ganas de construir el ecosistema tech de la zona — desde cero.
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
                <span>~/nordelta-build</span>
              </div>
              <div className="t-body mono">
                <div><span className="pr">$</span> <span className="cm">whoami</span></div>
                <div><span className="ou">→ builders, devs, founders, makers</span></div>
                <div>&nbsp;</div>
                <div><span className="pr">$</span> <span className="cm">ls comunidad/</span></div>
                <div><span className="ou">→ ~40 miembros fundadores</span></div>
                <div><span className="ou">→ recién arrancamos 🚀</span></div>
                <div><span className="ou">→ todo por construir</span></div>
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
              <h3>Kick-off Nordelta Build</h3>
              <p>El primer encuentro de la comunidad. Nos juntamos para conocernos, contar en qué estamos construyendo y definir juntos el rumbo de Nordelta Build. Lugar y fecha a confirmar — anotate para que te avisemos en cuanto esté todo listo.</p>
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
        <div className="eyebrow">Miembros fundadores</div>
        <h2 className="sec-title display">LA COMUNIDAD</h2>
        <p className="sec-sub">Los primeros builders armando esto desde el día cero.</p>
        <div className="members-grid">
          {members.map((m) => {
            const c = PALETTE[m.colorIndex % PALETTE.length];
            return (
              <div key={m._id} className="member">
                <div className="avatar" style={{ background: c.bg, color: c.color }}>{m.initials}</div>
                <h4>{m.name}</h4>
                <div className="member-role">
                  {m.jobTitle && m.company
                    ? <>{m.jobTitle} @ <a href={m.companyUrl} target="_blank" rel="noopener" style={{ color: c.color }}>{m.company}</a></>
                    : m.role}
                </div>
                <div className="tags">
                  {m.tags?.map(tag => <span key={tag} className="tag">{tag}</span>)}
                </div>
              </div>
            );
          })}
          <div className="member" style={{ borderStyle: 'dashed', cursor: 'pointer', opacity: 0.6, transition: 'all .2s' }}
            onClick={() => setShowJoinModal(true)}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.borderColor = ''; }}>
            <div className="avatar" style={{ background: 'rgba(255,255,255,.04)', color: 'var(--muted)', fontSize: '2rem' }}>+</div>
            <h4 style={{ color: 'var(--muted2)' }}>¿Sos vos?</h4>
            <div className="member-role" style={{ color: 'var(--muted)' }}>Sumate a la comunidad</div>
            <div className="tags"><span className="tag">Unirse →</span></div>
          </div>
        </div>
      </section>

      <div id="join" className="cta-band">
        <div className="cta-inner">
          <div>
            <h2 className="display">¿LISTO PARA<br />CONSTRUIR?</h2>
            <p>Sumate a Nordelta Build. Es gratis, es local y es real.</p>
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
              <div className="logo">Nordelta Build</div>
              <p>Comunidad tech de Nordelta y zona norte del Gran Buenos Aires. Construimos juntos desde cero.</p>
            </div>
            <div className="f-col">
              <h5>Comunidad</h5>
              <a href="#sobre">Sobre nosotros</a>
              <a href="#comunidad">Miembros</a>
              <a href="#eventos">Eventos</a>
            </div>
            <div className="f-col">
              <h5>Contacto</h5>
              <a href="https://chat.whatsapp.com/BCjkNIAfX5k157xVl28NCT" target="_blank">WhatsApp</a>
              <a href="https://chat.whatsapp.com/BCjkNIAfX5k157xVl28NCT" target="_blank">+54 11 2508-5500</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Nordelta Build · Nordelta, Pcia. de Buenos Aires</p>
            <a href="https://chat.whatsapp.com/BCjkNIAfX5k157xVl28NCT" target="_blank" className="f-wa">
              Unirse al grupo
            </a>
          </div>
        </div>
      </footer>

      {/* JOIN MODAL */}
      {showJoinModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', padding: '20px' }}>
          <div style={{ background: 'var(--surf)', padding: '40px', borderRadius: '16px', maxWidth: '480px', width: '100%', border: '1px solid var(--border2)', position: 'relative' }}>
            <button onClick={() => setShowJoinModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '8px', lineHeight: 1 }}>SUMATE A LA COMUNIDAD</h3>
            <p style={{ color: 'var(--muted2)', fontSize: '0.9rem', marginBottom: '24px' }}>Completá tus datos para sumarte a la base de builders y acceder al grupo de WhatsApp exclusivo.</p>
            
            {formStatus === 'success' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>¡Datos guardados!</h4>
                <p style={{ color: 'var(--muted2)', fontSize: '0.9rem', marginBottom: '24px' }}>Ya sos parte de la base. Ahora hacé clic abajo para entrar al grupo de WhatsApp oficial y presentarte.</p>
                <button onClick={openWhatsApp} className="btn btn-wa" style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>Entrar al WhatsApp</button>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre completo</label>
                  <input required placeholder="Ej. Ada Lovelace" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>E-mail</label>
                  <input required type="email" placeholder="ada@ejemplo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>¿A qué te dedicás?</label>
                  <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', appearance: 'none' }}>
                    <option value="" disabled>Seleccioná tu rol...</option>
                    <option value="Founder/CEO">Founder / CEO</option>
                    <option value="Developer/Engineer">Developer / Engineer</option>
                    <option value="Product/Design">Product / Design</option>
                    <option value="Marketing/Growth">Marketing / Growth</option>
                    <option value="Inversor">Inversor / VC</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Empresa / Proyecto</label>
                    <input placeholder="Ej. huevsite.io" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>URL</label>
                    <input type="url" placeholder="https://..." value={formData.companyUrl} onChange={e => setFormData({...formData, companyUrl: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tags <span style={{ color: 'var(--muted)', fontStyle: 'normal', textTransform: 'none', letterSpacing: 0, fontSize: '0.75rem' }}>(opcional)</span></label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {AVAILABLE_TAGS.map(tag => (
                      <button key={tag} type="button" onClick={() => toggleTag(tag)} style={{
                        fontFamily: 'Space Mono, monospace', fontSize: '0.62rem', padding: '5px 12px',
                        borderRadius: '4px', cursor: 'pointer', letterSpacing: '0.04em', transition: 'all .15s',
                        background: formTags.includes(tag) ? 'rgba(0,229,160,.15)' : 'var(--surf2)',
                        color: formTags.includes(tag) ? 'var(--accent)' : 'var(--muted2)',
                        border: formTags.includes(tag) ? '1px solid rgba(0,229,160,.5)' : '1px solid var(--border)',
                      }}>{tag}</button>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={formStatus === 'loading'} className="btn btn-green" style={{ width: '100%', justifyContent: 'center', padding: '16px', marginTop: '4px' }}>
                  {formStatus === 'loading' ? 'Guardando...' : 'Unirme y ver WhatsApp →'}
                </button>
                {formStatus === 'error' && <p style={{ color: 'var(--red)', fontSize: '0.8rem', textAlign: 'center' }}>Hubo un error al guardar. Intentá de nuevo.</p>}
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
