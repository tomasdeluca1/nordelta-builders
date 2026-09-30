/* eslint-disable */
// Generates a static 1200x630 OG image at public/og.png using the Norte Tech brand:
//   • Outfit (display + body) · headline, subtitle
//   • Instrument Serif italic · palabra destacada con el degradado del logo
//   • JetBrains Mono          · URL y tags
//
// Layout respects the 1000x540 safe zone (centered).
// Run: node scripts/generate-og.js

const fs = require('fs');
const path = require('path');
const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');

const W = 1200;
const H = 630;
const BG = '#0A0F24';
const SURF = '#111935';
const BORDER = '#28355F';
const MUTED = '#95A0C2';
const TEXT = '#EEF1FA';
const G1 = '#5A8FDA';
const G2 = '#8E6BAE';
const G3 = '#F4C2A8';

const root = path.join(__dirname, '..');
const fontsDir = path.join(root, 'public', 'assets', 'fonts');
const logoSvgPath = path.join(root, 'public', 'brand', 'norte-tech-horizontal.svg');
const outPath = path.join(root, 'public', 'og.png');

const loadFont = name => fs.readFileSync(path.join(fontsDir, name));

async function main() {
  const logoPng = new Resvg(fs.readFileSync(logoSvgPath, 'utf8'), { fitTo: { mode: 'width', value: 760 } }).render().asPng();
  const logoDataUri = `data:image/png;base64,${logoPng.toString('base64')}`;
  const [, vbW, vbH] = fs.readFileSync(logoSvgPath, 'utf8').match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
  const logoW = 380, logoH = Math.round(logoW * vbH / vbW);

  const node = {
    type: 'div',
    props: {
      style: {
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '70px 100px',
        background: `radial-gradient(55% 60% at 88% 10%, rgba(142,107,174,0.35) 0%, transparent 60%), radial-gradient(50% 50% at 8% 100%, rgba(90,143,218,0.22) 0%, transparent 60%), radial-gradient(40% 40% at 95% 100%, rgba(244,194,168,0.14) 0%, transparent 60%), ${BG}`,
        fontFamily: 'Outfit', color: TEXT,
      },
      children: [
        { type: 'img', props: { src: logoDataUri, width: logoW, height: logoH, style: { display: 'block' } } },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column' },
            children: [
              {
                type: 'div',
                props: {
                  style: { fontSize: 76, fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 1.02, display: 'flex' },
                  children: 'Founders, capital y talento.',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 92, lineHeight: 1.05, display: 'flex',
                    backgroundImage: `linear-gradient(95deg, ${G1}, ${G2} 50%, ${G3})`, backgroundClip: 'text', color: 'transparent',
                    paddingRight: 12,
                  },
                  children: 'En la misma sala.',
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'JetBrains Mono', fontSize: 20, color: TEXT },
                  children: [
                    { type: 'div', props: { style: { width: 9, height: 9, borderRadius: 5, background: G3 } } },
                    'bsasnortetech.vercel.app',
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', gap: 10 },
                  children: ['Founders', 'Devs', 'Inversores'].map(t => ({
                    type: 'div',
                    props: {
                      style: { padding: '9px 18px', borderRadius: 100, background: SURF, border: `1px solid ${BORDER}`, fontFamily: 'JetBrains Mono', fontSize: 16, color: MUTED },
                      children: t,
                    },
                  })),
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(node, {
    width: W,
    height: H,
    fonts: [
      { name: 'Outfit', data: loadFont('Outfit-Regular.woff'), weight: 400, style: 'normal' },
      { name: 'Outfit', data: loadFont('Outfit-Bold.woff'), weight: 700, style: 'normal' },
      { name: 'Instrument Serif', data: loadFont('InstrumentSerif-Italic.woff'), weight: 400, style: 'italic' },
      { name: 'JetBrains Mono', data: loadFont('JetBrainsMono-Regular.woff'), weight: 400, style: 'normal' },
    ],
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  fs.writeFileSync(outPath, png);
  const stat = fs.statSync(outPath);
  console.log(`✓ Wrote ${outPath} (${(stat.size / 1024).toFixed(1)} KB, ${W}x${H})`);
}

main().catch(err => { console.error(err); process.exit(1); });
