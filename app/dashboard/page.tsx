"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../auth.css';

interface User {
  id: number;
  name: string;
  email: string;
  initials: string;
  role: string;
  jobTitle?: string | null;
  company?: string | null;
  companyUrl?: string | null;
  tags: string[];
  colorIndex: number;
  mustChangePassword: boolean;
  isAdmin?: boolean;
  huevsiteUsername?: string | null;
  huevsiteApproved?: boolean;
  createdAt: string;
}

const HUEVSITE_URL = 'https://huevsite.io';

const PALETTE = [
  { bg: 'rgba(0,229,160,.12)',  color: '#00e5a0' },
  { bg: 'rgba(33,150,243,.12)', color: '#2196f3' },
  { bg: 'rgba(255,152,0,.12)',  color: '#ff9800' },
  { bg: 'rgba(156,39,176,.12)', color: '#9c27b0' },
  { bg: 'rgba(244,67,54,.12)',  color: '#ef5350' },
  { bg: 'rgba(0,188,212,.12)',  color: '#00bcd4' },
  { bg: 'rgba(255,193,7,.12)',  color: '#ffc107' },
  { bg: 'rgba(76,175,80,.12)',  color: '#4caf50' },
];

const ROLES = ['Founder/CEO', 'Developer/Engineer', 'Product/Design', 'Marketing/Growth', 'Inversor', 'Otro'];
const AVAILABLE_TAGS = ['AI', 'SaaS', 'Fintech', 'Web3', 'Proptech', 'Dev', 'Design', 'Marketing', 'Founder', 'Builder', 'Inversor'];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: '', role: '', jobTitle: '', company: '', companyUrl: '',
  });
  const [profileTags, setProfileTags] = useState<string[]>([]);
  const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [profileMessage, setProfileMessage] = useState('');

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdStatus, setPwdStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pwdMessage, setPwdMessage] = useState('');

  const [huevInput, setHuevInput] = useState('');
  const [huevStatus, setHuevStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [huevMessage, setHuevMessage] = useState('');

  function hydrateFormFromUser(u: User) {
    setProfile({
      name: u.name,
      role: u.role,
      jobTitle: u.jobTitle ?? '',
      company: u.company ?? '',
      companyUrl: u.companyUrl ?? '',
    });
    setProfileTags(u.tags ?? []);
  }

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (!d.user) { router.replace('/login'); return; }
        setUser(d.user);
        hydrateFormFromUser(d.user);
        setHuevInput(d.user.huevsiteUsername ?? '');
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  function toggleTag(tag: string) {
    setProfileTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileMessage('');
    setProfileStatus('loading');
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profile, tags: profileTags }),
    });
    const data = await res.json();
    if (!res.ok) {
      setProfileStatus('error');
      setProfileMessage(data.error || 'Error al actualizar perfil');
      return;
    }
    setProfileStatus('success');
    setProfileMessage('Perfil actualizado ✓');
    setUser(data.user);
    hydrateFormFromUser(data.user);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMessage('');
    if (newPwd.length < 8) {
      setPwdStatus('error');
      setPwdMessage('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdStatus('error');
      setPwdMessage('Las contraseñas no coinciden');
      return;
    }
    setPwdStatus('loading');
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPwdStatus('error');
      setPwdMessage(data.error || 'Error');
      return;
    }
    setPwdStatus('success');
    setPwdMessage('Contraseña actualizada ✓');
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    setUser(u => u ? { ...u, mustChangePassword: false } : u);
  }

  async function handleConnectHuevsite(e: React.FormEvent) {
    e.preventDefault();
    setHuevMessage('');
    setHuevStatus('loading');
    const res = await fetch('/api/huevsite/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ huevsiteUsername: huevInput }),
    });
    const data = await res.json();
    if (!res.ok) {
      setHuevStatus('error');
      setHuevMessage(data.error || 'Error al conectar tu huevsite');
      return;
    }
    setHuevStatus('success');
    setHuevMessage(
      data.huevsiteUsername
        ? '¡huevsite conectado! Queda pendiente de aprobación para verse en la landing.'
        : 'huevsite desconectado.',
    );
    setHuevInput(data.huevsiteUsername ?? '');
    setUser(u => (u ? { ...u, huevsiteUsername: data.huevsiteUsername, huevsiteApproved: false } : u));
  }

  if (loading || !user) {
    return (
      <main className="dash-shell">
        <div className="dash-loading">Cargando…</div>
      </main>
    );
  }

  const c = PALETTE[user.colorIndex % PALETTE.length];

  return (
    <main className="dash-shell">
      <nav className="dash-nav">
        <a href="/" className="nav-logo">
          <img src="/assets/logo.png" alt="" width={28} height={28} />
          NORDELTA<em> TECH</em>
        </a>
        <div className="dash-nav-right">
          {user.isAdmin && <a href="/admin" className="btn btn-ghost dash-logout">Admin</a>}
          <span className="dash-domain">nordelta.tech</span>
          <button onClick={handleLogout} className="btn btn-ghost dash-logout">Salir</button>
        </div>
      </nav>

      <div className="dash-bg">
        <div className="dash-grid" />
      </div>

      <section className="dash-container">
        {user.mustChangePassword && (
          <div className="dash-alert">
            <strong>⚠ Cambiá tu contraseña.</strong> Estás usando la contraseña temporal que te enviamos por email.
          </div>
        )}

        <header className="dash-hero">
          <div className="dash-avatar" style={{ background: c.bg, color: c.color }}>{user.initials}</div>
          <div>
            <div className="eyebrow">Tu perfil</div>
            <h1 className="display dash-title">HOLA, {user.name.split(' ')[0].toUpperCase()}</h1>
            <div className="dash-meta">
              {user.jobTitle && user.company
                ? <>{user.jobTitle} @ <a href={user.companyUrl ?? '#'} target="_blank" rel="noopener" style={{ color: c.color }}>{user.company}</a></>
                : user.role}
            </div>
          </div>
        </header>

        <div className="dash-grid-cols">
          <div className="dash-card">
            <div className="eyebrow">Cuenta</div>
            <h3 className="dash-card-title">Editar perfil</h3>
            <form onSubmit={handleProfileSubmit} className="auth-form">
              <label className="auth-label">
                <span>Nombre</span>
                <input required value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
              </label>
              <label className="auth-label">
                <span>Email</span>
                <input value={user.email} disabled readOnly className="auth-input-readonly" />
              </label>
              <label className="auth-label">
                <span>Rol</span>
                <select required value={profile.role} onChange={e => setProfile({ ...profile, role: e.target.value })}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <label className="auth-label">
                <span>Job title</span>
                <input placeholder="Ej. Founder, Dev, Product…" value={profile.jobTitle} onChange={e => setProfile({ ...profile, jobTitle: e.target.value })} />
              </label>
              <div className="auth-row">
                <label className="auth-label">
                  <span>Empresa</span>
                  <input placeholder="huevsite.io" value={profile.company} onChange={e => setProfile({ ...profile, company: e.target.value })} />
                </label>
                <label className="auth-label">
                  <span>URL</span>
                  <input type="url" placeholder="https://…" value={profile.companyUrl} onChange={e => setProfile({ ...profile, companyUrl: e.target.value })} />
                </label>
              </div>
              <div className="auth-label">
                <span>Tags</span>
                <div className="dash-tag-picker">
                  {AVAILABLE_TAGS.map(tag => {
                    const active = profileTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`dash-tag-chip${active ? ' is-active' : ''}`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
              {profileMessage && (
                <div className={profileStatus === 'success' ? 'auth-success' : 'auth-error'}>{profileMessage}</div>
              )}
              <button type="submit" disabled={profileStatus === 'loading'} className="btn btn-green auth-submit">
                {profileStatus === 'loading' ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </form>
          </div>

          <div className="dash-card">
            <div className="eyebrow">Seguridad</div>
            <h3 className="dash-card-title">Cambiar contraseña</h3>
            <form onSubmit={handleChangePassword} className="auth-form">
              <label className="auth-label">
                <span>Contraseña actual</span>
                <input required type="password" autoComplete="current-password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} />
              </label>
              <label className="auth-label">
                <span>Nueva contraseña</span>
                <input required type="password" autoComplete="new-password" minLength={8} value={newPwd} onChange={e => setNewPwd(e.target.value)} />
              </label>
              <label className="auth-label">
                <span>Repetir nueva</span>
                <input required type="password" autoComplete="new-password" minLength={8} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
              </label>
              {pwdMessage && (
                <div className={pwdStatus === 'success' ? 'auth-success' : 'auth-error'}>{pwdMessage}</div>
              )}
              <button type="submit" disabled={pwdStatus === 'loading'} className="btn btn-green auth-submit">
                {pwdStatus === 'loading' ? 'Guardando…' : 'Actualizar contraseña'}
              </button>
            </form>

            <div className="dash-meta-block">
              <div><strong>Miembro desde:</strong> {new Date(user.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
        </div>

        <div className="dash-card" style={{ marginTop: 24 }}>
          <div className="eyebrow">Tu portfolio</div>
          <h3 className="dash-card-title">Conectá tu huevsite.io</h3>
          <p className="dash-meta" style={{ marginBottom: 16 }}>
            Mostrá tu huevsite en la landing de Nordelta Tech. Pegá tu usuario o la URL de tu perfil.
            {' '}<span style={{ color: 'var(--muted)' }}>Un admin lo aprueba antes de que se vea públicamente.</span>
          </p>
          <form onSubmit={handleConnectHuevsite} className="auth-form">
            <label className="auth-label">
              <span>Tu huevsite</span>
              <input
                value={huevInput}
                onChange={e => setHuevInput(e.target.value)}
                placeholder="tu-usuario · tu-usuario.huevsite.io"
              />
            </label>
            {user.huevsiteUsername && (
              <div className="dash-meta" style={{ marginTop: -4 }}>
                Conectado: <a href={`${HUEVSITE_URL}/${user.huevsiteUsername}`} target="_blank" rel="noopener" style={{ color: 'var(--accent)' }}>@{user.huevsiteUsername}</a>
                {' · '}
                {user.huevsiteApproved
                  ? <span style={{ color: 'var(--accent)' }}>aprobado ✓</span>
                  : <span style={{ color: '#ffb020' }}>pendiente de aprobación</span>}
              </div>
            )}
            {huevMessage && (
              <div className={huevStatus === 'success' ? 'auth-success' : 'auth-error'}>{huevMessage}</div>
            )}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="submit" disabled={huevStatus === 'loading'} className="btn btn-green auth-submit" style={{ flex: 1, minWidth: 160 }}>
                {huevStatus === 'loading' ? 'Conectando…' : (user.huevsiteUsername ? 'Actualizar huevsite' : 'Conectar huevsite')}
              </button>
              <a href={HUEVSITE_URL} target="_blank" rel="noopener" className="btn btn-ghost auth-submit" style={{ flex: 1, minWidth: 160, textAlign: 'center' }}>
                {user.huevsiteUsername ? 'Editar mi huevsite →' : 'Armá tu huevsite →'}
              </a>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
