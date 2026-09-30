// Tema original para el video de Norte Tech, sintetizado desde cero (sin samples ni licencias).
// 128 BPM, La menor (Am–F–C–G), 18 s. La estructura sigue los bloques del video:
//   0–4 intro (pulso + riser) · 4–12 palabras · 12–20 fotos · 20–28 números (riser al final)
//   28–34 logo (corte, impacto y pad) · 34–38.4 cierre (golpe final y cola)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SR = 48000, BPM = 128, BEAT = 60 / BPM, DUR = 18.0, TAIL = 0.6;
const N = Math.ceil((DUR + TAIL) * SR);
const L = new Float32Array(N), R = new Float32Array(N);
const sendL = new Float32Array(N), sendR = new Float32Array(N);
const duck = new Float32Array(N).fill(1);
const K = new Float32Array(N); // bombo, fuera del ducking

let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const b2s = b => Math.round(b * BEAT * SR);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const add = (i, l, r = l, send = 0) => { if (i < 0 || i >= N) return; L[i] += l; R[i] += r; if (send) { sendL[i] += l * send; sendR[i] += r * send; } };

// ─── Instrumentos ──────────────────────────────────────
function kick(beat, gain = 1) {
  const s0 = b2s(beat), len = Math.round(0.42 * SR);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const f = 45 + 125 * Math.exp(-t * 32);
    ph += 2 * Math.PI * f / SR;
    const env = Math.exp(-t * 7.5) * (t < 0.002 ? t / 0.002 : 1);
    const click = i < 90 ? rnd() * 0.25 * (1 - i / 90) : 0;
    const v = Math.tanh((Math.sin(ph) * env + click) * 1.6) * 0.9 * gain;
    if (s0 + i < N) K[s0 + i] += v;
  }
  // Sidechain: el resto de la mezcla se agacha en cada bombo.
  const dl = Math.round(0.28 * SR);
  for (let i = 0; i < dl; i++) { const j = s0 + i; if (j < N) duck[j] = Math.min(duck[j], 0.25 + 0.75 * Math.pow(i / dl, 0.6)); }
}

function clap(beat, gain = 0.5) {
  const s0 = b2s(beat), len = Math.round(0.25 * SR);
  let hp = 0, prev = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const burst = [0, 0.011, 0.022].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * (t - o < 0.012 ? 120 : 22)) : 0), 0) / 2;
    const n = rnd();
    hp = 0.82 * (hp + n - prev); prev = n; // pasa-altos simple
    const v = hp * burst * gain;
    add(s0 + i, v * (0.9 + 0.1 * rnd()), v * (0.9 + 0.1 * rnd()), 0.5);
  }
}

function hat(beat, gain = 0.16, open = false) {
  const s0 = b2s(beat), len = Math.round((open ? 0.18 : 0.05) * SR);
  let hp = 0, prev = 0;
  for (let i = 0; i < len; i++) {
    const n = rnd();
    hp = 0.6 * (hp + n - prev); prev = n;
    const env = Math.exp(-(i / SR) * (open ? 22 : 90));
    add(s0 + i, hp * env * gain * 0.9, hp * env * gain * 1.1);
  }
}

// Supersaw: 7 osciladores desafinados, filtrado con pasa-bajos de 2 polos.
function supersaw(startBeat, lenBeats, notes, { gain = 0.08, attack = 0.005, release = 0.12, cutoff = () => 3000, send = 0.35, detune = 0.18 } = {}) {
  const s0 = b2s(startBeat), len = Math.round(lenBeats * BEAT * SR + release * SR);
  const hold = lenBeats * BEAT;
  const voices = [];
  notes.forEach(m => { for (let k = 0; k < 7; k++) voices.push({ f: hz(m) * Math.pow(2, ((k - 3) * detune) / 12 / 3), ph: Math.random(), pan: (k - 3) / 3 }); });
  let l1 = 0, l2 = 0, r1 = 0, r2 = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = (t < attack ? t / attack : 1) * (t > hold ? Math.exp(-(t - hold) / release * 3) : 1);
    let vl = 0, vr = 0;
    for (const v of voices) { v.ph += v.f / SR; v.ph -= Math.floor(v.ph); const s = 2 * v.ph - 1; vl += s * (1 - v.pan) * 0.5; vr += s * (1 + v.pan) * 0.5; }
    const a = 1 - Math.exp(-2 * Math.PI * cutoff(t) / SR);
    l1 += a * (vl - l1); l2 += a * (l1 - l2); r1 += a * (vr - r1); r2 += a * (r1 - r2);
    add(s0 + i, l2 * env * gain / voices.length * 7, r2 * env * gain / voices.length * 7, send);
  }
}

function bass(startBeat, lenBeats, m, gain = 0.32) {
  const s0 = b2s(startBeat), len = Math.round(lenBeats * BEAT * SR);
  const f = hz(m); let ph = 0, ph2 = 0, lp = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    ph += f / SR; ph -= Math.floor(ph); ph2 += (f / 2) / SR; ph2 -= Math.floor(ph2);
    const saw = 2 * ph - 1, sub = Math.sin(2 * Math.PI * ph2);
    lp += (1 - Math.exp(-2 * Math.PI * (220 + 500 * Math.exp(-t * 14)) / SR)) * (saw - lp);
    const env = Math.min(1, t / 0.004) * Math.min(1, (len - i) / (0.01 * SR));
    add(s0 + i, (lp * 0.6 + sub * 0.7) * env * gain);
  }
}

function pluck(beat, m, gain = 0.07) {
  const s0 = b2s(beat), len = Math.round(0.35 * SR), f = hz(m);
  let ph = 0, lp = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    ph += f / SR; ph -= Math.floor(ph);
    const sq = ph < 0.5 ? 1 : -1;
    lp += (1 - Math.exp(-2 * Math.PI * (600 + 5000 * Math.exp(-t * 18)) / SR)) * (sq - lp);
    const v = lp * Math.exp(-t * 9) * gain;
    const pan = Math.sin(beat * 2.1) * 0.5;
    add(s0 + i, v * (1 - pan), v * (1 + pan), 0.45);
  }
}

function riser(fromBeat, toBeat, gain = 0.22) {
  const s0 = b2s(fromBeat), len = b2s(toBeat) - s0;
  let lp = 0, hp = 0, prev = 0;
  for (let i = 0; i < len; i++) {
    const p = i / len;
    const n = rnd();
    const a = 1 - Math.exp(-2 * Math.PI * (400 + 9000 * p * p) / SR);
    lp += a * (n - lp); hp = 0.97 * (hp + lp - prev); prev = lp;
    const v = hp * Math.pow(p, 2.2) * gain;
    add(s0 + i, v * (1 - 0.3 * Math.sin(p * 40)), v * (1 + 0.3 * Math.sin(p * 40)), 0.3);
  }
}

function impact(beat, gain = 0.9) {
  const s0 = b2s(beat), len = Math.round(2.2 * SR);
  let ph = 0, lp = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    ph += 2 * Math.PI * (38 + 60 * Math.exp(-t * 10)) / SR;
    const boom = Math.sin(ph) * Math.exp(-t * 1.6);
    const n = rnd(); lp += 0.25 * (n - lp);
    const crash = (n - lp) * Math.exp(-t * 3.2) * 0.35;
    add(s0 + i, Math.tanh(boom * 1.4) * gain * 0.8 + crash * gain, Math.tanh(boom * 1.4) * gain * 0.8 + crash * gain * 0.9, 0.25);
  }
}

// ─── Arreglo ───────────────────────────────────────────
// Am – F – C – G, dos tiempos por acorde (voicings en la octava 4).
const CHORDS = [[57, 60, 64], [53, 57, 60], [55, 60, 64], [55, 59, 62]];
const ROOTS = [45, 41, 48, 43];
const ARP = [69, 72, 76, 72, 65, 69, 72, 69, 67, 72, 76, 72, 67, 71, 74, 71];
const chordAt = b => Math.floor(b / 2) % 4;

// Intro: pulso de bombo suave, pad que abre y riser.
for (let b = 0; b < 4; b++) kick(b, 0.55);
supersaw(0, 4, CHORDS[0], { gain: 0.09, attack: 1.2, release: 0.3, cutoff: t => 300 + 2500 * Math.min(1, t / 1.9) });
riser(1, 4, 0.18);

// Groove principal: palabras (4–12), fotos (12–20) y números (20–28).
for (let b = 4; b < 28; b++) {
  kick(b);
  if (b % 2 === 1) clap(b);
  hat(b + 0.5, 0.17, b % 4 === 3);
  if (b >= 12) { hat(b + 0.25, 0.07); hat(b + 0.75, 0.07); }
  const c = chordAt(b - 4);
  bass(b + 0.5, 0.45, ROOTS[c]);
  supersaw(b, 0.28, CHORDS[c], { gain: 0.1, release: 0.08, cutoff: t => 900 + 4200 * Math.exp(-t * 9) });
  if (b >= 12) for (let k = 0; k < 4; k++) pluck(b + k * 0.25, ARP[((b - 12) * 4 + k) % 16] + (b >= 20 ? 12 : 0), b >= 20 ? 0.055 : 0.07);
}
// Redoble de clap en los últimos dos tiempos antes del logo.
for (let k = 0; k < 8; k++) clap(26 + k * 0.25, 0.25 + k * 0.04);
riser(22, 28, 0.26);

// Logo: corte seco, impacto y pad amplio mientras se dibuja la N.
impact(28);
supersaw(28, 5.6, [45, 57, 60, 64, 69], { gain: 0.11, attack: 0.6, release: 0.5, cutoff: t => 400 + 3800 * Math.min(1, t / 2.6), send: 0.5 });
for (let k = 0; k < 8; k++) hat(32 + k * 0.25, 0.05 + k * 0.012);

// Cierre: golpe final con el acorde entero y cola.
impact(34, 1);
kick(34, 1);
supersaw(34, 2.6, [45, 52, 57, 60, 64, 69, 72], { gain: 0.13, release: 1.2, cutoff: t => 5200 * Math.exp(-t * 0.7) + 500, send: 0.6 });
bass(34, 2.4, 33, 0.3);

// ─── Mezcla ────────────────────────────────────────────
// Reverb Schroeder corta sobre el envío.
function reverb(inp, delaysMs, fb) {
  const out = new Float32Array(N);
  for (const ms of delaysMs) {
    const d = Math.round(ms * SR / 1000), buf = new Float32Array(d); let k = 0, lp = 0;
    for (let i = 0; i < N; i++) { const y = buf[k]; lp += 0.4 * (y - lp); buf[k] = inp[i] + lp * fb; out[i] += y / delaysMs.length; k = (k + 1) % d; }
  }
  for (const ms of [5, 1.7]) {
    const d = Math.round(ms * SR / 1000), buf = new Float32Array(d); let k = 0;
    for (let i = 0; i < N; i++) { const b = buf[k]; const y = -0.7 * out[i] + b; buf[k] = out[i] + 0.7 * y; out[i] = y; k = (k + 1) % d; }
  }
  return out;
}
const revL = reverb(sendL, [29.7, 37.1, 41.1, 43.7], 0.78);
const revR = reverb(sendR, [31.3, 36.7, 40.3, 45.1], 0.78);

let peak = 0;
const outL = new Float32Array(N), outR = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const g = duck[i];
  const fade = i > DUR * SR ? Math.max(0, 1 - (i - DUR * SR) / (TAIL * SR)) : 1;
  outL[i] = Math.tanh(((L[i] + revL[i] * 0.5) * g + K[i]) * 1.15) * fade;
  outR[i] = Math.tanh(((R[i] + revR[i] * 0.5) * g + K[i]) * 1.15) * fade;
  peak = Math.max(peak, Math.abs(outL[i]), Math.abs(outR[i]));
}
const norm = 0.89 / peak;

// ─── WAV 16 bits estéreo ───────────────────────────────
const data = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, outL[i] * norm)) * 32767), i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, outR[i] * norm)) * 32767), i * 4 + 2);
}
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + data.length, 4); hdr.write('WAVE', 8);
hdr.write('fmt ', 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34);
hdr.write('data', 36); hdr.writeUInt32LE(data.length, 40);
fs.mkdirSync(path.join(root, 'public/music'), { recursive: true });
const out = path.join(root, 'public/music/norte-tech-hype.wav');
fs.writeFileSync(out, Buffer.concat([hdr, data]));
console.log('música ok →', out, (N / SR).toFixed(2) + 's');
