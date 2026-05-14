"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../auth.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) router.replace('/dashboard');
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error || 'Error al iniciar sesión');
        return;
      }
      router.push('/dashboard');
    } catch (err) {
      setStatus('error');
      setErrorMsg('Error de conexión');
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-bg">
        <div className="auth-grid" />
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-card">
        <a href="/" className="auth-logo">
          NORDELTA<em> BUILD</em>
        </a>
        <div className="auth-eyebrow">nordelta.tech</div>
        <h1 className="auth-title display">INICIÁ<br />SESIÓN</h1>
        <p className="auth-sub">Accedé al dashboard de la comunidad.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            <span>Email</span>
            <input
              required
              type="email"
              autoComplete="email"
              placeholder="vos@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>
          <label className="auth-label">
            <span>Contraseña</span>
            <input
              required
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>

          {status === 'error' && <div className="auth-error">{errorMsg}</div>}

          <button type="submit" disabled={status === 'loading'} className="btn btn-green auth-submit">
            {status === 'loading' ? 'Ingresando…' : 'Entrar →'}
          </button>
        </form>

        <div className="auth-footer">
          ¿Todavía no estás en la comunidad?
          <a href="/#comunidad"> Sumate ←</a>
        </div>
      </div>
    </main>
  );
}
