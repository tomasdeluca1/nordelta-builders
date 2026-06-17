"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../auth.css';
import './admin.css';

interface AdminMember {
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
  status: string;
  isAdmin: boolean;
  huevsiteUsername?: string | null;
  huevsiteApproved: boolean;
  huevsiteFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

const ROLES = ['Founder/CEO', 'Developer/Engineer', 'Product/Design', 'Marketing/Growth', 'Inversor', 'Otro'];
const AVAILABLE_TAGS = ['AI', 'SaaS', 'Fintech', 'Web3', 'Proptech', 'Dev', 'Design', 'Marketing', 'Founder', 'Builder', 'Inversor'];

const TABS: { key: string; label: string }[] = [
  { key: 'pending', label: 'Pendientes' },
  { key: 'active', label: 'Activos' },
  { key: 'rejected', label: 'Rechazados' },
  { key: 'inactive', label: 'Inactivos' },
  { key: 'all', label: 'Todos' },
];

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente', active: 'Activo', rejected: 'Rechazado', inactive: 'Inactivo',
};

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [tab, setTab] = useState('pending');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [editing, setEditing] = useState<AdminMember | null>(null);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3500); };

  const loadMembers = useCallback(async () => {
    const res = await fetch('/api/admin/members', { cache: 'no-store' });
    if (res.status === 403) { router.replace('/dashboard'); return; }
    const data = await res.json();
    setMembers(data.members ?? []);
    setCounts(data.counts ?? {});
  }, [router]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (!d.user) { router.replace('/login'); return; }
        if (!d.user.isAdmin) { router.replace('/dashboard'); return; }
        setAuthorized(true);
        loadMembers();
      });
  }, [router, loadMembers]);

  async function doAction(id: number, action: string, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/members/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) { flash(data.error || 'Error'); return; }
      const emailNote = data.emailSent ? ' · email enviado' : (action === 'accept' || action === 'reject' || action === 'resend' ? ' · ⚠ email falló' : '');
      flash(`Listo: ${action}${emailNote}`);
      await loadMembers();
    } finally {
      setBusyId(null);
    }
  }

  const list = tab === 'all' ? members : members.filter(m => m.status === tab);

  if (authorized === null) {
    return <main className="dash-shell"><div className="dash-loading">Cargando…</div></main>;
  }

  return (
    <main className="dash-shell">
      <nav className="dash-nav">
        <a href="/" className="nav-logo">
          <img src="/assets/logo.png" alt="" width={28} height={28} />
          NORDELTA<em> TECH</em>
        </a>
        <div className="dash-nav-right">
          <span className="dash-domain">admin</span>
          <a href="/dashboard" className="btn btn-ghost dash-logout">Mi perfil</a>
        </div>
      </nav>

      <div className="dash-bg"><div className="dash-grid" /></div>

      <section className="dash-container">
        <header className="dash-hero" style={{ marginBottom: 24 }}>
          <div>
            <div className="eyebrow">Administración</div>
            <h1 className="display dash-title">GESTIÓN DE BUILDERS</h1>
            <div className="dash-meta">Aceptá, rechazá y gestioná a la comunidad.</div>
          </div>
        </header>

        {toast && <div className="admin-toast">{toast}</div>}

        <div className="admin-tabs">
          {TABS.map(t => {
            const n = t.key === 'all' ? members.length : (counts[t.key] ?? 0);
            return (
              <button key={t.key} className={`admin-tab${tab === t.key ? ' is-active' : ''}`} onClick={() => setTab(t.key)}>
                {t.label} <span className="admin-tab-count">{n}</span>
              </button>
            );
          })}
        </div>

        <div className="dash-card admin-card">
          {list.length === 0 ? (
            <div className="admin-empty">No hay builders en este estado.</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Builder</th><th>Rol</th><th>huevsite</th><th>Estado</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(m => (
                    <tr key={m.id}>
                      <td>
                        <div className="admin-builder">
                          <span className="admin-name">{m.name}{m.isAdmin && <span className="admin-badge badge-admin">admin</span>}</span>
                          <span className="admin-email">{m.email}</span>
                        </div>
                      </td>
                      <td>{m.jobTitle || m.role}</td>
                      <td>
                        {m.huevsiteUsername ? (
                          <span className="admin-huev">
                            @{m.huevsiteUsername}
                            {m.huevsiteFeatured ? <span className="admin-badge badge-feat">★</span>
                              : m.huevsiteApproved ? <span className="admin-badge badge-ok">✓</span>
                              : <span className="admin-badge badge-pend">pend</span>}
                          </span>
                        ) : <span className="admin-muted">—</span>}
                      </td>
                      <td><span className={`admin-status status-${m.status}`}>{STATUS_LABEL[m.status] ?? m.status}</span></td>
                      <td>
                        <div className="admin-actions">
                          {m.status === 'pending' && <>
                            <button disabled={busyId === m.id} className="btn-mini btn-accept" onClick={() => doAction(m.id, 'accept')}>Aceptar</button>
                            <button disabled={busyId === m.id} className="btn-mini btn-reject" onClick={() => doAction(m.id, 'reject', `¿Rechazar a ${m.name}? Se le envía un email.`)}>Rechazar</button>
                          </>}
                          {m.status === 'active' && <>
                            <button disabled={busyId === m.id} className="btn-mini" onClick={() => doAction(m.id, 'resend', `¿Reenviar credenciales a ${m.name}? Se resetea su contraseña temporal.`)}>Reenviar</button>
                            <button disabled={busyId === m.id} className="btn-mini btn-warn" onClick={() => doAction(m.id, 'deactivate', `¿Dar de baja a ${m.name}?`)}>Baja</button>
                          </>}
                          {(m.status === 'rejected') && <button disabled={busyId === m.id} className="btn-mini btn-accept" onClick={() => doAction(m.id, 'accept', `¿Aceptar a ${m.name}?`)}>Aceptar</button>}
                          {(m.status === 'inactive') && <button disabled={busyId === m.id} className="btn-mini btn-accept" onClick={() => doAction(m.id, 'reactivate')}>Reactivar</button>}
                          <button className="btn-mini" onClick={() => setEditing(m)}>Editar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <SettingsCard onSaved={() => flash('Configuración guardada ✓')} />
      </section>

      {editing && (
        <EditModal
          member={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); flash('Builder actualizado ✓'); await loadMembers(); }}
        />
      )}
    </main>
  );
}

function SettingsCard({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState<Record<string, string>>({ whatsapp_group_url: '', admin_notification_email: '', huevsite_url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings', { cache: 'no-store' }).then(r => r.json()).then(d => { if (d.settings) setForm(d.settings); });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) onSaved();
    } finally { setSaving(false); }
  }

  return (
    <div className="dash-card admin-card" style={{ marginTop: 24 }}>
      <div className="eyebrow">Configuración</div>
      <h3 className="dash-card-title">Settings de la comunidad</h3>
      <form onSubmit={save} className="auth-form">
        <label className="auth-label"><span>Link grupo de WhatsApp</span>
          <input value={form.whatsapp_group_url} onChange={e => setForm({ ...form, whatsapp_group_url: e.target.value })} placeholder="https://chat.whatsapp.com/…" />
        </label>
        <label className="auth-label"><span>Email de notificación al admin</span>
          <input value={form.admin_notification_email} onChange={e => setForm({ ...form, admin_notification_email: e.target.value })} placeholder="vos@gmail.com" />
        </label>
        <label className="auth-label"><span>URL de huevsite.io</span>
          <input value={form.huevsite_url} onChange={e => setForm({ ...form, huevsite_url: e.target.value })} placeholder="https://huevsite.io" />
        </label>
        <button type="submit" disabled={saving} className="btn btn-green auth-submit">{saving ? 'Guardando…' : 'Guardar settings'}</button>
      </form>
    </div>
  );
}

function EditModal({ member, onClose, onSaved }: { member: AdminMember; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    name: member.name,
    role: member.role,
    jobTitle: member.jobTitle ?? '',
    company: member.company ?? '',
    companyUrl: member.companyUrl ?? '',
    huevsiteUsername: member.huevsiteUsername ?? '',
    huevsiteApproved: member.huevsiteApproved,
    huevsiteFeatured: member.huevsiteFeatured,
    isAdmin: member.isAdmin,
  });
  const [tags, setTags] = useState<string[]>(member.tags ?? []);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const toggleTag = (t: string) => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, tags }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || 'Error'); return; }
      onSaved();
    } finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card admin-modal">
        <button onClick={onClose} className="modal-close" aria-label="Cerrar">&times;</button>
        <div className="modal-eyebrow">$ edit --member {member.id}</div>
        <h3 className="modal-title">Editar a {member.name.split(' ')[0]}</h3>
        <form onSubmit={save} className="auth-form">
          <label className="auth-label"><span>Nombre</span>
            <input required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
          </label>
          <label className="auth-label"><span>Rol</span>
            <select value={f.role} onChange={e => setF({ ...f, role: e.target.value })}>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select>
          </label>
          <label className="auth-label"><span>Job title</span>
            <input value={f.jobTitle} onChange={e => setF({ ...f, jobTitle: e.target.value })} />
          </label>
          <div className="auth-row">
            <label className="auth-label"><span>Empresa</span>
              <input value={f.company} onChange={e => setF({ ...f, company: e.target.value })} />
            </label>
            <label className="auth-label"><span>URL</span>
              <input value={f.companyUrl} onChange={e => setF({ ...f, companyUrl: e.target.value })} />
            </label>
          </div>
          <label className="auth-label"><span>huevsite (username o URL)</span>
            <input value={f.huevsiteUsername} onChange={e => setF({ ...f, huevsiteUsername: e.target.value })} placeholder="ada · ada.huevsite.io" />
          </label>
          <div className="auth-label"><span>Tags</span>
            <div className="dash-tag-picker">
              {AVAILABLE_TAGS.map(t => (
                <button type="button" key={t} onClick={() => toggleTag(t)} className={`dash-tag-chip${tags.includes(t) ? ' is-active' : ''}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="admin-checks">
            <label><input type="checkbox" checked={f.huevsiteApproved} onChange={e => setF({ ...f, huevsiteApproved: e.target.checked })} /> huevsite aprobado (visible en landing)</label>
            <label><input type="checkbox" checked={f.huevsiteFeatured} onChange={e => setF({ ...f, huevsiteFeatured: e.target.checked })} /> destacado</label>
            <label><input type="checkbox" checked={f.isAdmin} onChange={e => setF({ ...f, isAdmin: e.target.checked })} /> es admin</label>
          </div>
          {err && <div className="auth-error">{err}</div>}
          <button type="submit" disabled={saving} className="btn btn-green auth-submit">{saving ? 'Guardando…' : 'Guardar cambios'}</button>
        </form>
      </div>
    </div>
  );
}
