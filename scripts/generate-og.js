/* eslint-disable */
// Generates a static 1200x630 OG image at public/og.png using brand fonts.
//   • Bebas Neue (display)  · headlines
//   • Space Mono (mono)     · stamps, pills
//   • DM Sans (body)        · subtitle
//
// Layout respects the 1000x540 safe zone (centered).
// Run: node scripts/generate-og.js

const fs = require('fs');
const path = require('path');
const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');

const W = 1200;
const H = 630;
const ACCENT = '#00E5A0';
const BG = '#080B0D';
const SURF = '#0E1215';
const BORDER = '#1C2328';
const MUTED = '#7A8F9E';
const TEXT = '#E6EDF3';
const DIM = '#52626E';

const root = path.join(__dirname, '..');
const fontsDir = path.join(root, 'public', 'assets', 'fonts');
const logoPath = path.join(root, 'public', 'assets', 'logo.png');
const outPath = path.join(root, 'public', 'og.png');

function loadFont(name) {
  return fs.readFileSync(path.join(fontsDir, name));
}

async function main() {
  const bebas = loadFont('BebasNeue-Regular.ttf');
  const monoR = loadFont('SpaceMono-Regular.ttf');
  const monoB = loadFont('SpaceMono-Bold.ttf');
  const dmSans = loadFont('DMSans-Regular.ttf');
  const logoB64 = fs.readFileSync(logoPath).toString('base64');
  const logoDataUri = `data:image/png;base64,${logoB64}`;

  const node = {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: `radial-gradient(60% 50% at 78% 20%, rgba(0,229,160,0.18) 0%, transparent 60%), radial-gradient(60% 50% at 12% 88%, rgba(33,150,243,0.12) 0%, transparent 60%), linear-gradient(135deg, ${BG} 0%, #0a1014 100%)`,
        fontFamily: 'DM Sans',
        color: TEXT,
      },
      children: [
        // Top scanline
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
              opacity: 0.5,
            },
          },
        },
        // Top bar
        {
          type: 'div',
          props: {
            style: {
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '56px 80px 0 80px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'Space Mono', fontSize: 18, letterSpacing: '0.28em', color: MUTED },
                  children: [
                    { type: 'div', props: { style: { width: 8, height: 8, borderRadius: 4, background: ACCENT, boxShadow: `0 0 12px ${ACCENT}` } } },
                    'NORDELTA TECH',
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { fontFamily: 'Space Mono', fontSize: 18, letterSpacing: '0.16em', color: MUTED, display: 'flex' },
                  children: [
                    { type: 'span', props: { style: { color: ACCENT, marginRight: 8 }, children: '$' } },
                    'cd ~/nordelta.tech',
                  ],
                },
              },
            ],
          },
        },
        // Hero row
        {
          type: 'div',
          props: {
            style: {
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              padding: '0 80px',
              gap: 56,
            },
            children: [
              // Logo card
              {
                type: 'div',
                props: {
                  style: {
                    width: 240, height: 240,
                    background: SURF,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: `0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(0,229,160,0.05)`,
                  },
                  children: [
                    { type: 'img', props: { src: logoDataUri, width: 200, height: 200, style: { display: 'block' } } },
                  ],
                },
              },
              // Text block
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', flex: 1 },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontFamily: 'Bebas Neue',
                          fontSize: 152,
                          lineHeight: 0.92,
                          letterSpacing: '0.02em',
                          color: TEXT,
                          display: 'flex',
                        },
                        children: 'BUILD THE',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontFamily: 'Bebas Neue',
                          fontSize: 152,
                          lineHeight: 0.92,
                          letterSpacing: '0.02em',
                          color: ACCENT,
                          display: 'flex',
                          marginTop: 4,
                          textShadow: `0 0 40px rgba(0,229,160,0.45)`,
                        },
                        children: 'FUTURE.',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontFamily: 'DM Sans',
                          fontSize: 22,
                          color: MUTED,
                          marginTop: 18,
                          display: 'flex',
                          lineHeight: 1.4,
                          maxWidth: 640,
                        },
                        children: 'Comunidad tech de Nordelta y Zona Norte BA. Founders, devs y makers buildeando en serio.',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        // Bottom row
        {
          type: 'div',
          props: {
            style: {
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 80px 56px 80px',
            },
            children: [
              // Domain pill
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 22px',
                    borderRadius: 100,
                    background: 'rgba(0,229,160,0.10)',
                    border: `1px solid rgba(0,229,160,0.45)`,
                    fontFamily: 'Space Mono', fontWeight: 700,
                    fontSize: 16, letterSpacing: '0.22em', color: ACCENT,
                  },
                  children: [
                    { type: 'div', props: { style: { width: 8, height: 8, borderRadius: 4, background: ACCENT, boxShadow: `0 0 10px ${ACCENT}` } } },
                    'NORDELTA.TECH',
                  ],
                },
              },
              // Tag pills
              {
                type: 'div',
                props: {
                  style: { display: 'flex', gap: 10 },
                  children: ['FOUNDERS', 'DEVS', 'MAKERS'].map(t => ({
                    type: 'div',
                    props: {
                      style: {
                        padding: '10px 20px', borderRadius: 100,
                        background: SURF, border: `1px solid ${BORDER}`,
                        fontFamily: 'Space Mono', fontSize: 15,
                        letterSpacing: '0.22em', color: TEXT,
                      },
                      children: t,
                    },
                  })),
                },
              },
            ],
          },
        },
        // Bottom scanline
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
              opacity: 0.3,
            },
          },
        },
      ],
    },
  };

  const svg = await satori(node, {
    width: W,
    height: H,
    fonts: [
      { name: 'Bebas Neue', data: bebas, weight: 400, style: 'normal' },
      { name: 'Space Mono', data: monoR, weight: 400, style: 'normal' },
      { name: 'Space Mono', data: monoB, weight: 700, style: 'normal' },
      { name: 'DM Sans',    data: dmSans, weight: 400, style: 'normal' },
    ],
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  fs.writeFileSync(outPath, png);
  const stat = fs.statSync(outPath);
  console.log(`✓ Wrote ${outPath} (${(stat.size / 1024).toFixed(1)} KB, ${W}x${H})`);
}

main().catch(err => { console.error(err); process.exit(1); });
