// Redibuja en vector el logo de Norte Tech (N de cinta + wordmark "norte.tech").
// El wordmark se convierte a trazos con Montserrat para que el SVG no dependa de fuentes.
// Salida: public/brand/*.svg del sitio y src/logo-data.ts para el video.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const siteBrand = path.resolve(root, '../../public/brand');
fs.mkdirSync(siteBrand, { recursive: true });

const load = f => opentype.parse(fs.readFileSync(path.join(root, 'public/fonts', f)).buffer);
const bold = load('montserrat-700.woff');
const medium = load('montserrat-500.woff');

// ─── Símbolo ────────────────────────────────────────────
// Tres trazos de ancho 40 con puntas redondas: pierna izq, pierna der y la diagonal encima.
const W = 40, L = 20, R = 124, T = 20, B = 101;
const SYMBOL_BOX = { w: R + W / 2, h: B + W / 2 };
// Polígono de la diagonal (el trazo sin puntas), para recortar la sombra de la pierna izquierda.
const DX = R - L, DY = B - T, DL = Math.hypot(DX, DY), NX = -DY / DL * W / 2, NY = DX / DL * W / 2;
const DIAG_POLY = [[L + NX, T + NY], [R + NX, B + NY], [R - NX, B - NY], [L - NX, T - NY]].map(p => p.map(v => v.toFixed(2)).join(',')).join(' ');

function symbolDefs(id) {
  return `<linearGradient id="${id}-l" x1="0" y1="${T - W / 2}" x2="0" y2="${B + W / 2}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#4656A8"/><stop offset=".55" stop-color="#4A70BE"/><stop offset="1" stop-color="#6AAEEA"/>
    </linearGradient>
    <linearGradient id="${id}-r" x1="0" y1="${T - W / 2}" x2="0" y2="${B + W / 2}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#5A60CC"/><stop offset=".45" stop-color="#4B4E9E"/><stop offset=".75" stop-color="#9A78A8"/><stop offset="1" stop-color="#F0C3A8"/>
    </linearGradient>
    <linearGradient id="${id}-d" x1="${L}" y1="${T}" x2="${R}" y2="${B}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#5E66C8"/><stop offset=".35" stop-color="#8A6CB8"/><stop offset=".7" stop-color="#C28A9E"/><stop offset="1" stop-color="#F4C7AA"/>
    </linearGradient>
    <linearGradient id="${id}-sheen" x1="${L}" y1="${B}" x2="${R}" y2="${T}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".45" stop-color="#FFFFFF" stop-opacity=".16"/><stop offset=".6" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="${id}-rleg"><rect x="${R - W / 2}" y="${T - W / 2}" width="${W}" height="${B - T + W}" rx="${W / 2}"/></clipPath>
    <clipPath id="${id}-diag"><polygon points="${DIAG_POLY}"/><circle cx="${R}" cy="${B}" r="${W / 2}"/></clipPath>
    <filter id="${id}-blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>`;
}

function symbolBody(id) {
  // Orden de capas como en el original: pierna derecha, diagonal encima, pierna izquierda arriba de todo.
  const leg = (x, g, extra = '') => `<rect x="${x - W / 2}" y="${T - W / 2}" width="${W}" height="${B - T + W}" rx="${W / 2}" ${extra} fill="${g}"/>`;
  const diag = (extra) => `<line x1="${L}" y1="${T}" x2="${R}" y2="${B}" stroke-width="${W}" stroke-linecap="round" ${extra}/>`;
  return `${leg(R, `url(#${id}-r)`)}
    <g clip-path="url(#${id}-rleg)" opacity=".6">${diag(`stroke="#0B0A18" filter="url(#${id}-blur)" transform="translate(-2 -3)"`)}</g>
    ${diag(`stroke="url(#${id}-d)"`)}
    ${diag(`stroke="url(#${id}-sheen)"`)}
    <g clip-path="url(#${id}-diag)" opacity=".6">${leg(L, '#0B0A18', `filter="url(#${id}-blur)" transform="translate(4 0)"`)}</g>
    ${leg(L, `url(#${id}-l)`)}`;
}

function symbolMono(color) {
  return `<path d="M${L} ${B} V${T} L${R} ${B} V${T}" fill="none" stroke="${color}" stroke-width="${W}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// ─── Wordmark ───────────────────────────────────────────
// Ancho objetivo relativo al símbolo, tomado de la imagen de referencia (≈2.6× el ancho del símbolo).
const TARGET_W = 375, TRACK = 0.012;

function runPath(font, text, x, size) {
  let d = '';
  for (let i = 0; i < text.length; i++) {
    const g = font.charToGlyph(text[i]);
    d += g.getPath(x, 0, size).toPathData(2);
    x += (g.advanceWidth / font.unitsPerEm) * size + TRACK * size;
    if (i < text.length - 1) x += (font.getKerningValue(g, font.charToGlyph(text[i + 1])) / font.unitsPerEm) * size;
  }
  return { d, x };
}
function measure(size) {
  const a = runPath(bold, 'norte.', 0, size);
  const b = runPath(medium, 'tech', a.x, size);
  return b.x - TRACK * size;
}
const size = 100 * TARGET_W / measure(100);
const partA = runPath(bold, 'norte.', 0, size);
const partB = runPath(medium, 'tech', partA.x, size);
const ascent = (bold.charToGlyph('h').getBoundingBox().y2 / bold.unitsPerEm) * size; // alto de la 'h'
const xHeight = (bold.charToGlyph('o').getBoundingBox().y2 / bold.unitsPerEm) * size;
const wordW = measure(size);

const TECH_GRAD = (id, y0, y1) => `<linearGradient id="${id}-tech" x1="0" y1="${y0}" x2="0" y2="${y1}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#B4B6CF"/><stop offset="1" stop-color="#8E90B0"/></linearGradient>`;

function wordmark(id, x, baseline, { a = '#F3F3F6', b = `url(#${id}-tech)` } = {}) {
  return `<g transform="translate(${x.toFixed(2)} ${baseline.toFixed(2)})"><path d="${partA.d}" fill="${a}"/><path d="${partB.d}" fill="${b}"/></g>`;
}

// ─── Composiciones ──────────────────────────────────────
const svg = (w, h, inner, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" width="${Math.round(w)}" height="${Math.round(h)}">${bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : ''}${inner}</svg>\n`;

function stacked({ mono, bg, pad = 0 } = {}) {
  const id = 'nts';
  const gap = 27;
  const w = Math.max(wordW, SYMBOL_BOX.w) + pad * 2;
  const symX = (w - SYMBOL_BOX.w) / 2;
  const baseline = pad + SYMBOL_BOX.h + gap + ascent;
  const h = baseline + pad + size * 0.02;
  const defs = mono ? '' : `<defs>${symbolDefs(id)}${TECH_GRAD(id, baseline - ascent, baseline)}</defs>`;
  const sym = mono ? symbolMono(mono) : symbolBody(id);
  const wm = mono ? wordmark(id, (w - wordW) / 2, baseline, { a: mono, b: mono }) : wordmark(id, (w - wordW) / 2, baseline);
  return svg(w, h, `${defs}<g transform="translate(${symX.toFixed(2)} ${pad})">${sym}</g>${wm}`, bg);
}

function horizontal({ mono, bg, pad = 0 } = {}) {
  const id = 'nth';
  const s = (xHeight * 1.9) / SYMBOL_BOX.h; // el símbolo mide ~2 veces la altura de x
  const symW = SYMBOL_BOX.w * s, symH = SYMBOL_BOX.h * s;
  const gap = symW * 0.28;
  const h = Math.max(symH, ascent) + pad * 2;
  const baseline = pad + (h - pad * 2) / 2 + xHeight / 2;
  const w = symW + gap + wordW + pad * 2;
  const defs = mono ? '' : `<defs>${symbolDefs(id)}${TECH_GRAD(id, baseline - ascent, baseline)}</defs>`;
  const sym = mono ? symbolMono(mono) : symbolBody(id);
  const wm = mono ? wordmark(id, pad + symW + gap, baseline, { a: mono, b: mono }) : wordmark(id, pad + symW + gap, baseline);
  return svg(w, h, `${defs}<g transform="translate(${pad} ${(h - symH) / 2}) scale(${s.toFixed(4)})">${sym}</g>${wm}`, bg);
}

function symbolOnly({ mono, bg, pad = 0 } = {}) {
  const id = 'ntn';
  const w = SYMBOL_BOX.w + pad * 2, h = SYMBOL_BOX.h + pad * 2;
  const inner = mono ? symbolMono(mono) : `<defs>${symbolDefs(id)}</defs>${symbolBody(id)}`;
  return svg(w, h, `<g transform="translate(${pad} ${pad})">${inner}</g>`, bg);
}

function appIcon() {
  // Cuadrado con el símbolo centrado, para favicon y apple-icon.
  const id = 'nti', side = 256, s = 150 / SYMBOL_BOX.w;
  const sw = SYMBOL_BOX.w * s, sh = SYMBOL_BOX.h * s;
  return svg(side, side, `<defs>${symbolDefs(id)}</defs><rect width="${side}" height="${side}" rx="56" fill="#0A0F24"/><g transform="translate(${(side - sw) / 2} ${(side - sh) / 2}) scale(${s.toFixed(4)})">${symbolBody(id)}</g>`);
}

const files = {
  'norte-tech-logo.svg': stacked(),
  'norte-tech-logo-on-dark.svg': stacked({ bg: '#0F0E0F', pad: 90 }),
  'norte-tech-logo-white.svg': stacked({ mono: '#FFFFFF' }),
  'norte-tech-logo-black.svg': stacked({ mono: '#0A0F24' }),
  'norte-tech-horizontal.svg': horizontal(),
  'norte-tech-horizontal-white.svg': horizontal({ mono: '#FFFFFF' }),
  'norte-tech-horizontal-black.svg': horizontal({ mono: '#0A0F24' }),
  'norte-tech-symbol.svg': symbolOnly(),
  'norte-tech-symbol-white.svg': symbolOnly({ mono: '#FFFFFF' }),
  'norte-tech-icon.svg': appIcon(),
};
for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(siteBrand, name), content);

// Datos para el video: se inyectan como markup SVG dentro de los componentes.
const ts = `// Generado por scripts/build-logo.mjs — no editar a mano.
export const SYMBOL_BOX = ${JSON.stringify(SYMBOL_BOX)};
export const SYMBOL_GEOM = ${JSON.stringify({ W, L, R, T, B })};
export const symbolDefs = (id: string) => ${JSON.stringify(symbolDefs('__ID__'))}.split('__ID__').join(id);
export const symbolBody = (id: string) => ${JSON.stringify(symbolBody('__ID__'))}.split('__ID__').join(id);
export const WORDMARK = ${JSON.stringify({ a: partA.d, b: partB.d, width: wordW, ascent, xHeight })};
`;
fs.writeFileSync(path.join(root, 'src/logo-data.ts'), ts);
console.log('logo ok →', siteBrand, Object.keys(files).length, 'archivos · wordmark', wordW.toFixed(1), 'x', ascent.toFixed(1));
