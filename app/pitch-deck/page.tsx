import type { Metadata } from 'next';
import PitchDeck from './PitchDeck';

export const metadata: Metadata = {
  title: 'Norte Tech · Pitch para sponsors',
  description: 'La comunidad tech de founders, devs y makers de la Zona Norte.',
  robots: { index: false, follow: false },
};

export default function PitchDeckPage() {
  return <PitchDeck />;
}
