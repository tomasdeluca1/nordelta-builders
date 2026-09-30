// Marca Norte Tech · paleta Índigo + Outfit / Instrument Serif itálica / JetBrains Mono.
export const C = {
  bg: '#0A0F24',
  surf: '#111935',
  text: '#EEF1FA',
  muted: '#95A0C2',
  line: '#1F2A52',
  g1: '#5A8FDA',
  g2: '#8E6BAE',
  g3: '#F4C2A8',
};
export const GRAD = `linear-gradient(95deg, ${C.g1}, ${C.g2} 50%, ${C.g3})`;

export const FONT = {
  display: "'Outfit', system-ui, sans-serif",
  serif: "'Instrument Serif', Georgia, serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

// Tiempo musical: 128 BPM. Todo el video se escribe en tiempos (beats), no en frames.
export const BPM = 128;
export const FPS = 30;
export const BEAT_S = 60 / BPM;
export const DURATION_S = 18;
export const f = (beat: number) => Math.round(beat * BEAT_S * FPS);

// Datos reales de la comunidad. Actualizar antes de volver a renderizar.
export const DATA = {
  members: 257, // /api/members → total, 2026-09-30
  words: ['Founders.', 'Devs.', 'Inversores.', 'Sponsors.'],
  tags: ['AI', 'SaaS', 'Fintech', 'Web3', 'Design', 'Dev', 'Marketing', 'Proptech'],
  coworks: [
    { src: 'coworks/cafe-garcia.jpg', venue: 'Café García' },
    { src: 'coworks/santa-barbara.jpg', venue: 'Club Santa Bárbara' },
    { src: 'coworks/islas-del-golf.jpg', venue: 'SUM · Islas del Golf' },
  ],
  url: 'bsasnortetech.vercel.app',
};
