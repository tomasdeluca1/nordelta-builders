import React from 'react';
import { Composition, continueRender, delayRender, staticFile } from 'remotion';
import { NorteTechVideo } from './NorteTechVideo';
import { DURATION_S, FPS } from './theme';

// Fuentes locales: el render espera a que estén cargadas para no caer en la fuente de sistema.
const FONTS: [string, string, string, string][] = [
  ['Outfit', 'fonts/outfit-400.woff', '400', 'normal'],
  ['Outfit', 'fonts/outfit-600.woff', '600', 'normal'],
  ['Outfit', 'fonts/outfit-700.woff', '700', 'normal'],
  ['Outfit', 'fonts/outfit-700.woff', '800', 'normal'],
  ['Instrument Serif', 'fonts/instrument-serif-400-italic.woff', '400', 'italic'],
  ['JetBrains Mono', 'fonts/jetbrains-mono-400.woff', '400', 'normal'],
  ['JetBrains Mono', 'fonts/jetbrains-mono-500.woff', '500', 'normal'],
];
if (typeof document !== 'undefined') {
  const handle = delayRender('fuentes');
  Promise.all(FONTS.map(([family, file, weight, style]) => {
    const face = new FontFace(family, `url(${staticFile(file)})`, { weight, style });
    document.fonts.add(face);
    return face.load();
  })).then(() => continueRender(handle)).catch((e) => { console.error(e); continueRender(handle); });
}

const frames = Math.round(DURATION_S * FPS);

export const Root: React.FC = () => (
  <>
    {/* Hero del sitio: 4:5, sin audio, con fundido al final para el loop. */}
    <Composition id="Hero" component={NorteTechVideo} width={1080} height={1350} fps={FPS} durationInFrames={frames} defaultProps={{ withAudio: false, loopFade: true }} />
    {/* Redes horizontales (X, LinkedIn, YouTube). */}
    <Composition id="Social" component={NorteTechVideo} width={1920} height={1080} fps={FPS} durationInFrames={frames} defaultProps={{ withAudio: true, loopFade: false }} />
    {/* Reels, stories y TikTok. */}
    <Composition id="Vertical" component={NorteTechVideo} width={1080} height={1920} fps={FPS} durationInFrames={frames} defaultProps={{ withAudio: true, loopFade: false }} />
  </>
);
