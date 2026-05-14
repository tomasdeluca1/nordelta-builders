/* eslint-disable */
// Generates a static 1200x630 OG image at public/og.png.
// Run: node scripts/generate-og.js
//
// Layout (respects 100px safe-zone margin on all sides):
//   • Dark gradient background with subtle dot grid
//   • Logomark at left
//   • "BUILD THE FUTURE." headline center-right
//   • "nordelta.tech" wordmark below
//   • Tag pills bottom-right (Founders · Devs · Makers)
//   • Corner stamps top-left & top-right

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const W = 1200;
const H = 630;
const ACCENT = '#00E5A0';
const BG = '#080B0D';
const SURF = '#0E1215';
const BORDER = '#1C2328';
const MUTED = '#7A8F9E';
const TEXT = '#E6EDF3';

const logoPath = path.join(__dirname, '..', 'public', 'assets', 'logo.png');
const outPath = path.join(__dirname, '..', 'public', 'og.png');

async function main() {
  const logoBuf = fs.readFileSync(logoPath);
  const logoB64 = logoBuf.toString('base64');
  const logoDataUri = `data:image/png;base64,${logoB64}`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${BG}"/>
      <stop offset="1" stop-color="#0a1014"/>
    </linearGradient>
    <radialGradient id="glow1" cx="78%" cy="22%" r="55%">
      <stop offset="0" stop-color="${ACCENT}" stop-opacity="0.18"/>
      <stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="12%" cy="86%" r="55%">
      <stop offset="0" stop-color="#2196F3" stop-opacity="0.10"/>
      <stop offset="1" stop-color="#2196F3" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
      <circle cx="1.2" cy="1.2" r="1.2" fill="${ACCENT}" fill-opacity="0.06"/>
    </pattern>
  </defs>

  <!-- background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect width="${W}" height="${H}" fill="url(#glow1)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>

  <!-- top scanline -->
  <line x1="0" y1="0.5" x2="${W}" y2="0.5" stroke="${ACCENT}" stroke-opacity="0.35" stroke-width="1"/>

  <!-- top-left corner stamp -->
  <g font-family="'SF Mono','Menlo','Consolas',monospace" font-size="18" letter-spacing="3" fill="${MUTED}" text-transform="uppercase">
    <circle cx="80" cy="80" r="4" fill="${ACCENT}"/>
    <text x="100" y="86">NORDELTA TECH</text>
  </g>

  <!-- top-right corner stamp -->
  <g font-family="'SF Mono','Menlo','Consolas',monospace" font-size="18" letter-spacing="3" fill="${MUTED}">
    <text x="${W - 80}" y="86" text-anchor="end"><tspan fill="${ACCENT}">$</tspan> cd ~/nordelta.tech</text>
  </g>

  <!-- logo card -->
  <g transform="translate(108, 215)">
    <rect x="-22" y="-22" width="244" height="244" rx="32" fill="${SURF}" stroke="${BORDER}" stroke-width="1.5"/>
    <image x="0" y="0" width="200" height="200" href="${logoDataUri}" preserveAspectRatio="xMidYMid meet"/>
  </g>

  <!-- headline + wordmark -->
  <g transform="translate(400, 235)">
    <text font-family="'Bebas Neue','Impact','Arial Narrow',sans-serif" font-size="130" font-weight="700" letter-spacing="2" fill="${TEXT}" y="0">BUILD THE</text>
    <text font-family="'Bebas Neue','Impact','Arial Narrow',sans-serif" font-size="130" font-weight="700" letter-spacing="2" fill="${ACCENT}" y="125">FUTURE.</text>
  </g>

  <!-- domain pill (bottom-left) -->
  <g transform="translate(108, 510)">
    <rect x="0" y="0" width="240" height="44" rx="22" fill="${ACCENT}" fill-opacity="0.10" stroke="${ACCENT}" stroke-opacity="0.45" stroke-width="1.5"/>
    <circle cx="22" cy="22" r="4" fill="${ACCENT}"/>
    <text x="42" y="28" font-family="'SF Mono','Menlo','Consolas',monospace" font-size="16" letter-spacing="3" fill="${ACCENT}">NORDELTA.TECH</text>
  </g>

  <!-- tags pills (bottom-right) -->
  <g transform="translate(${W - 108}, 510)" font-family="'SF Mono','Menlo','Consolas',monospace" font-size="15" letter-spacing="3">
    <g transform="translate(-130, 0)">
      <rect x="0" y="0" width="130" height="44" rx="22" fill="${SURF}" stroke="${BORDER}"/>
      <text x="65" y="28" text-anchor="middle" fill="${TEXT}">MAKERS</text>
    </g>
    <g transform="translate(-272, 0)">
      <rect x="0" y="0" width="130" height="44" rx="22" fill="${SURF}" stroke="${BORDER}"/>
      <text x="65" y="28" text-anchor="middle" fill="${TEXT}">DEVS</text>
    </g>
    <g transform="translate(-422, 0)">
      <rect x="0" y="0" width="140" height="44" rx="22" fill="${SURF}" stroke="${BORDER}"/>
      <text x="70" y="28" text-anchor="middle" fill="${TEXT}">FOUNDERS</text>
    </g>
  </g>

  <!-- bottom scanline -->
  <line x1="0" y1="${H - 0.5}" x2="${W}" y2="${H - 0.5}" stroke="${ACCENT}" stroke-opacity="0.2" stroke-width="1"/>
</svg>`;

  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  const stat = fs.statSync(outPath);
  console.log(`✓ Wrote ${outPath} (${(stat.size / 1024).toFixed(1)} KB, ${W}x${H})`);
}

main().catch(err => { console.error(err); process.exit(1); });
