import React from 'react';
import {
  AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from 'remotion';
import { C, DATA, FONT, GRAD, f } from './theme';
import { FACES } from './faces';
import { SYMBOL_BOX, SYMBOL_GEOM, WORDMARK, symbolBody, symbolDefs } from './logo-data';

// Estructura en tiempos (128 BPM), igual que la música:
// 0–4 intro · 4–12 palabras · 12–20 fotos · 20–28 números · 28–34 logo · 34–38.4 cierre
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const useUnits = () => {
  const { width, height } = useVideoConfig();
  return { u: Math.min(width, height) / 100, width, height, portrait: height > width };
};

// Tamaño de letra que entra en el ancho disponible (Outfit bold ≈ 0.56 em por carácter).
const fit = (text: string, width: number, max: number, perChar = 0.56) => Math.min(max, (width * 0.86) / (text.length * perChar));

// Pulso que se dispara en cada tiempo desde `from` hasta `to`.
const beatPulse = (frame: number, from: number, to: number, decay = 5) => {
  let v = 0;
  for (let b = from; b < to; b++) { const d = frame - f(b); if (d >= 0) v = Math.max(v, Math.exp(-d / decay)); }
  return v;
};

// ─── Fondo ───────────────────────────────────────────────
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, width, height } = useUnits();
  const pulse = beatPulse(frame, 0, 28) * (frame < f(28) ? 1 : 0);
  const t = frame / 30;
  const x = 50 + Math.sin(t * 0.7) * 18, y = 45 + Math.cos(t * 0.5) * 14;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(${C.line}55 1px, transparent 1px), linear-gradient(90deg, ${C.line}55 1px, transparent 1px)`,
        backgroundSize: `${u * 8}px ${u * 8}px`, backgroundPosition: `${width / 2}px ${height / 2}px`,
      }} />
      <AbsoluteFill style={{
        background: `radial-gradient(circle at ${x}% ${y}%, ${C.g2}${Math.round(40 + pulse * 50).toString(16).padStart(2, '0')}, ${C.g1}22 ${28 + pulse * 6}%, transparent 62%)`,
        filter: `blur(${u * 2}px)`,
      }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 120%, ${C.g3}1f, transparent 55%)` }} />
    </AbsoluteFill>
  );
};

const GradText: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', ...style }}>{children}</span>
);

const Mono: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const { u } = useUnits();
  return <div style={{ fontFamily: FONT.mono, fontSize: u * 2.2, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, ...style }}>{children}</div>;
};

// ─── 0–4 · Intro ─────────────────────────────────────────
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { u } = useUnits();
  const pulse = beatPulse(frame, 0, 4, 7);
  const grow = interpolate(frame, [0, f(4)], [0.6, 1.1], clamp);
  const label = interpolate(frame, [f(0.5), f(1.5), f(3.5), f(4)], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: u * 18 * grow * (1 + pulse * 0.18), height: u * 18 * grow * (1 + pulse * 0.18), borderRadius: '50%', background: GRAD, filter: `blur(${u * (3 + pulse * 2)}px)`, opacity: 0.5 + pulse * 0.5 }} />
      <Mono style={{ position: 'absolute', bottom: u * 12, opacity: label }}>Norte Tech · comunidad tech</Mono>
    </AbsoluteFill>
  );
};

// ─── 4–12 · Palabras ─────────────────────────────────────
const Word: React.FC<{ text: string; index: number; last: boolean }> = ({ text, index, last }) => {
  const frame = useCurrentFrame();
  const { u, width, portrait } = useUnits();
  const inP = interpolate(frame, [0, 5], [0, 1], { ...clamp, easing: easeOut });
  const scale = interpolate(inP, [0, 1], [1.28, 1]);
  const blur = interpolate(inP, [0, 1], [u * 1.6, 0]);
  const bar = interpolate(frame, [f(1), f(1.8)], [0, 1], { ...clamp, easing: easeOut });
  const size = fit(text, width, u * (portrait ? 30 : 24), last ? 0.44 : 0.56);
  const word = last
    ? <GradText style={{ fontFamily: FONT.serif, fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.02em', paddingRight: '0.08em' }}>{text}</GradText>
    : <>{text.slice(0, -1)}<GradText>.</GradText></>;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: u * 3 }}>
      <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: size, letterSpacing: '-0.045em', lineHeight: 1, color: C.text, transform: `scale(${scale})`, filter: `blur(${blur}px)`, opacity: inP }}>{word}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: u * 2 }}>
        <Mono>{String(index + 1).padStart(2, '0')} / {String(DATA.words.length).padStart(2, '0')}</Mono>
        <div style={{ width: u * 16, height: u * 0.4, background: C.line, borderRadius: u }}>
          <div style={{ width: `${bar * 100}%`, height: '100%', background: GRAD, borderRadius: u }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── 12–20 · Fotos ───────────────────────────────────────
const Photo: React.FC<{ src: string; venue: string }> = ({ src, venue }) => {
  const frame = useCurrentFrame();
  const { u } = useUnits();
  const z = interpolate(frame, [0, f(1)], [1.12, 1.02], clamp);
  const flash = interpolate(frame, [0, 3], [0.55, 0], clamp);
  return (
    <AbsoluteFill>
      <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`, filter: 'saturate(0.9) contrast(1.05)' }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg}33 0%, ${C.bg}10 40%, ${C.bg}e6 100%)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(120deg, ${C.g1}40, ${C.g2}30 50%, ${C.g3}30)`, mixBlendMode: 'soft-light' }} />
      <Mono style={{ position: 'absolute', left: u * 6, bottom: u * 6, color: C.text, fontSize: u * 2.6 }}>● Cowork · {venue}</Mono>
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
    </AbsoluteFill>
  );
};

const Faces: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, width, height } = useUnits();
  const aspect = width / height;
  const cols = Math.max(4, Math.round(Math.sqrt(FACES.length * aspect)));
  const rows = Math.ceil(FACES.length / cols);
  const gap = u * 0.8;
  const cell = Math.min((width * 0.92 - gap * (cols - 1)) / cols, (height * 0.8 - gap * (rows - 1)) / rows);
  const zoom = interpolate(frame, [0, f(5)], [1.08, 0.96], clamp);
  const label = interpolate(frame, [f(2.5), f(3)], [0, 1], clamp);
  // Orden de aparición mezclado para que no se lea como una lista.
  const order = FACES.map((_, i) => (i * 17) % FACES.length);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap, transform: `scale(${zoom})` }}>
        {FACES.map((src, i) => {
          const start = (order[i] / FACES.length) * f(1.5);
          const p = spring({ frame: frame - start, fps: 30, config: { damping: 14, stiffness: 180 } });
          return <Img key={src} src={staticFile(src)} style={{ width: cell, height: cell, objectFit: 'cover', borderRadius: cell * 0.22, transform: `scale(${p})`, opacity: p, filter: 'grayscale(0.15)', boxShadow: `0 0 0 ${u * 0.15}px ${C.line}` }} />;
        })}
      </div>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: u * 4, opacity: label }}>
        <div style={{ background: `${C.bg}d9`, padding: `${u * 1.2}px ${u * 2.4}px`, borderRadius: u * 5, border: `1px solid ${C.line}` }}>
          <Mono style={{ color: C.text }}>Miembros reales de la comunidad</Mono>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── 20–28 · Números ─────────────────────────────────────
const Members: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, width } = useUnits();
  const n = Math.round(interpolate(frame, [0, f(1.6)], [0, DATA.members], { ...clamp, easing: easeOut }));
  const sub = interpolate(frame, [f(1), f(1.4)], [0, 1], clamp);
  const pop = 1 + beatPulse(frame, 0, 4, 4) * 0.04;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: fit('000', width, u * 42, 0.6), letterSpacing: '-0.06em', lineHeight: 0.9, fontVariantNumeric: 'tabular-nums', transform: `scale(${pop})` }}><GradText>{n}</GradText></div>
      <div style={{ fontFamily: FONT.serif, fontStyle: 'italic', fontSize: u * 11, color: C.text, opacity: sub, transform: `translateY(${(1 - sub) * u * 3}px)` }}>miembros.</div>
    </AbsoluteFill>
  );
};

const OneRoom: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, width } = useUnits();
  const a = interpolate(frame, [0, 5], [0, 1], { ...clamp, easing: easeOut });
  const b = interpolate(frame, [f(1), f(1) + 5], [0, 1], { ...clamp, easing: easeOut });
  const size = fit('Una sala.', width, u * 20, 0.5);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: size, letterSpacing: '-0.045em', color: C.text, display: 'flex', gap: '0.25em' }}>
        <span style={{ opacity: a, transform: `translateY(${(1 - a) * u * 4}px)`, display: 'inline-block' }}>Una</span>
        <span style={{ opacity: b, transform: `translateY(${(1 - b) * u * 4}px)`, display: 'inline-block' }}><GradText style={{ fontFamily: FONT.serif, fontStyle: 'italic', fontWeight: 400, paddingRight: '0.08em' }}>sala.</GradText></span>
      </div>
    </AbsoluteFill>
  );
};

const TagFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, width } = useUnits();
  const step = f(0.25) || 4;
  const i = Math.min(DATA.tags.length - 1, Math.floor(frame / step));
  const inv = i % 2 === 1;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', background: inv ? GRAD : 'transparent' }}>
      <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: fit(DATA.tags[i], width, u * 30, 0.62), letterSpacing: '-0.05em', color: inv ? C.bg : C.text }}>{DATA.tags[i]}</div>
    </AbsoluteFill>
  );
};

// ─── 28–38.4 · Logo y cierre ─────────────────────────────
const { W, L, R, T, B } = SYMBOL_GEOM;
const STROKE_LEN = (B - T) * 2 + Math.hypot(R - L, B - T);

const Symbol: React.FC<{ size: number; draw: number; fill: number; id: string }> = ({ size, draw, fill, id }) => (
  <svg viewBox={`0 0 ${SYMBOL_BOX.w} ${SYMBOL_BOX.h}`} width={size} height={size * SYMBOL_BOX.h / SYMBOL_BOX.w} style={{ overflow: 'visible' }}>
    <defs dangerouslySetInnerHTML={{ __html: symbolDefs(id) + `<linearGradient id="${id}-draw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.g1}"/><stop offset=".5" stop-color="${C.g2}"/><stop offset="1" stop-color="${C.g3}"/></linearGradient>` }} />
    <path d={`M${L} ${B} V${T} L${R} ${B} V${T}`} fill="none" stroke={`url(#${id}-draw)`} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray={STROKE_LEN} strokeDashoffset={STROKE_LEN * (1 - draw)} opacity={1 - fill} />
    <g opacity={fill} dangerouslySetInnerHTML={{ __html: symbolBody(id) }} />
  </svg>
);

const Wordmark: React.FC<{ width: number; reveal: number }> = ({ width, reveal }) => {
  const h = WORDMARK.ascent * 1.25;
  return (
    <svg viewBox={`0 ${-WORDMARK.ascent * 1.05} ${WORDMARK.width} ${h}`} width={width} height={width * h / WORDMARK.width} style={{ clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)` }}>
      <defs><linearGradient id="wm-tech" x1="0" y1={-WORDMARK.ascent} x2="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#B4B6CF" /><stop offset="1" stopColor="#8E90B0" /></linearGradient></defs>
      <path d={WORDMARK.a} fill="#F3F3F6" />
      <path d={WORDMARK.b} fill="url(#wm-tech)" />
    </svg>
  );
};

const LogoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { u } = useUnits();
  const flash = interpolate(frame, [0, 4], [0.9, 0], clamp);
  const draw = interpolate(frame, [2, f(2.2)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const fill = interpolate(frame, [f(2), f(2.8)], [0, 1], clamp);
  const bloom = interpolate(frame, [f(2), f(2.8), f(4.5)], [0, 1, 0.35], clamp);
  const reveal = interpolate(frame, [f(3), f(4.2)], [0, 1], { ...clamp, easing: easeOut });
  const drift = interpolate(frame, [0, f(6)], [1, 1.05], clamp);
  const sym = u * 34;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', width: sym * 1.6, height: sym * 1.6, borderRadius: '50%', background: GRAD, filter: `blur(${u * 8}px)`, opacity: bloom * 0.45 }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u * 5, transform: `scale(${drift})` }}>
        <Symbol size={sym} draw={draw} fill={fill} id="logo-a" />
        <Wordmark width={sym * 2.6} reveal={reveal} />
      </div>
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ loopFade: boolean }> = ({ loopFade }) => {
  const frame = useCurrentFrame();
  const { u, width, durationInFrames } = { ...useUnits(), durationInFrames: useVideoConfig().durationInFrames };
  const flash = interpolate(frame, [0, 4], [0.7, 0], clamp);
  const p = spring({ frame, fps: 30, config: { damping: 16, stiffness: 140 } });
  const cta = interpolate(frame, [f(0.5), f(1.2)], [0, 1], { ...clamp, easing: easeOut });
  const url = interpolate(frame, [f(1.5), f(2)], [0, 1], clamp);
  // Dentro de una Sequence, durationInFrames es la duración de la secuencia.
  const end = durationInFrames;
  const fadeOut = loopFade ? interpolate(frame, [end - 12, end], [1, 0], clamp) : 1;
  const sym = u * 12;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: fadeOut }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u * 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: u * 2.4, transform: `translateY(${(1 - p) * u * 10}px)` }}>
          <Symbol size={sym} draw={1} fill={1} id="logo-b" />
          <Wordmark width={sym * 2.9} reveal={1} />
        </div>
        <div style={{ fontFamily: FONT.serif, fontStyle: 'italic', fontSize: fit('Sumate.', width, u * 22, 0.42), lineHeight: 1, opacity: cta, transform: `scale(${0.9 + cta * 0.1})` }}>
          <GradText style={{ paddingRight: '0.08em' }}>Sumate.</GradText>
        </div>
        <Mono style={{ color: C.text, opacity: url, fontSize: u * 2.8, letterSpacing: '0.06em', textTransform: 'none' }}>{DATA.url}</Mono>
      </div>
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
    </AbsoluteFill>
  );
};

// ─── Composición ─────────────────────────────────────────
export const NorteTechVideo: React.FC<{ withAudio: boolean; loopFade: boolean }> = ({ withAudio, loopFade }) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.bg, color: C.text, fontFamily: FONT.display }}>
      {withAudio && <Audio src={staticFile('music/norte-tech-hype.wav')} />}
      <Background />
      <Sequence from={0} durationInFrames={f(4)}><Intro /></Sequence>
      {DATA.words.map((w, i) => (
        <Sequence key={w} from={f(4 + i * 2)} durationInFrames={f(6 + i * 2) - f(4 + i * 2)}>
          <Word text={w} index={i} last={i === DATA.words.length - 1} />
        </Sequence>
      ))}
      {DATA.coworks.map((c, i) => (
        <Sequence key={c.src} from={f(12 + i)} durationInFrames={f(13 + i) - f(12 + i)}><Photo {...c} /></Sequence>
      ))}
      <Sequence from={f(15)} durationInFrames={f(20) - f(15)}><Faces /></Sequence>
      <Sequence from={f(20)} durationInFrames={f(23) - f(20)}><Members /></Sequence>
      <Sequence from={f(23)} durationInFrames={f(26) - f(23)}><OneRoom /></Sequence>
      <Sequence from={f(26)} durationInFrames={f(28) - f(26)}><TagFlash /></Sequence>
      <Sequence from={f(28)} durationInFrames={f(34) - f(28)}><LogoScene /></Sequence>
      <Sequence from={f(34)} durationInFrames={durationInFrames - f(34)}><Outro loopFade={loopFade} /></Sequence>
    </AbsoluteFill>
  );
};
