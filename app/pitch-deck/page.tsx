import type { Metadata } from 'next';
import PitchDeck from './PitchDeck';

export const metadata: Metadata = {
  title: 'Nordelta Tech · Pitch para sponsors',
  description: 'La comunidad tech de founders, devs y makers de Nordelta y Zona Norte.',
  robots: { index: false, follow: false },
};

export default function PitchDeckPage() {
  return <PitchDeck />;
}
