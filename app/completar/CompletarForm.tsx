"use client";

import { useState } from 'react';
import PresentationFields, {
  presentationPayload,
  presentationFromMember,
  type PresentationState,
} from '../components/PresentationFields';
import { ROLES } from '@/lib/profile-fields';

export interface CompletarInitial {
  name: string;
  email: string;
  role: string;
  jobTitle: string;
  company: string;
  companyUrl: string;
  neighborhood: string;
  bio: string;
  building: string;
  lookingFor: string[];
  canHelpWith: string;
  linkedinUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  huevsiteUsername: string;
  websiteUrl: string;
}

export default function CompletarForm({
  token,
  initial,
  huevsiteBaseUrl,
}: {
  token: string;
  initial: CompletarInitial;
  huevsiteBaseUrl: string;
}) {
  const [identity, setIdentity] = useState({
    name: initial.name,
    role: initial.role || '',
    jobTitle: initial.jobTitle || '',
    company: initial.company,
    companyUrl: initial.companyUrl,
  });
  const [presentation, setPresentation] = useState<PresentationState>(presentationFromMember(initial));
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const patch = (p: Partial<PresentationState>) => setPresentation((prev) => ({ ...prev, ...p }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...identity, ...presentationPayload(presentation) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setError(data.error || 'No pudimos guardar tu presentación. Probá de nuevo.');
        return;
      }
      setStatus('success');
    } catch {
      setStatus('error');
      setError('Error de conexión. Probá de nuevo.');
    }
  }

  if (status === 'success') {
    return (
      <div className="modal-success">
        <div className="success-badge">✓</div>
        <h3 className="success-title">¡Gracias, <span style={{ color: 'var(--accent)' }}>{initial.name.split(' ')[0]}</span>!</h3>
        <p className="success-text">Recibimos tu presentación. Ya quedó en la cola de revisión.</p>
        <div className="success-note">
          <strong>$ status --pending</strong><br />
          Un admin la revisa y, cuando te acepte, te llega un email con tu acceso al dashboard y la <strong>invitación al grupo de WhatsApp</strong>.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="modal-form">
      <div className="field">
        <label>Nombre completo</label>
        <input required value={identity.name} onChange={(e) => setIdentity({ ...identity, name: e.target.value })} />
      </div>
      <div className="field">
        <label>E-mail</label>
        <input value={initial.email} disabled readOnly className="auth-input-readonly" />
      </div>
      <div className="field">
        <label>¿A qué te dedicás?</label>
        <select required value={identity.role} onChange={(e) => setIdentity({ ...identity, role: e.target.value })}>
          <option value="" disabled>Seleccioná tu rol…</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Cargo <span className="opt">(opcional)</span></label>
        <input placeholder="Ej. Partner & CTO" maxLength={80} value={identity.jobTitle} onChange={(e) => setIdentity({ ...identity, jobTitle: e.target.value })} />
      </div>
      <div className="form-grid">
        <div className="field">
          <label>Empresa / Proyecto <span className="opt">(opcional)</span></label>
          <input value={identity.company} onChange={(e) => setIdentity({ ...identity, company: e.target.value })} />
        </div>
        <div className="field">
          <label>URL <span className="opt">(opcional)</span></label>
          <input type="text" placeholder="tu-empresa.com" value={identity.companyUrl} onChange={(e) => setIdentity({ ...identity, companyUrl: e.target.value })} />
        </div>
      </div>

      <div className="modal-eyebrow" style={{ marginTop: 4 }}>$ tu --presentación</div>
      <PresentationFields value={presentation} onChange={patch} huevsiteBaseUrl={huevsiteBaseUrl} />

      {status === 'error' && <p className="form-error">{error}</p>}
      <button type="submit" disabled={status === 'loading'} className="btn btn-green">
        {status === 'loading' ? 'Guardando…' : 'Enviar mi presentación →'}
      </button>
    </form>
  );
}
