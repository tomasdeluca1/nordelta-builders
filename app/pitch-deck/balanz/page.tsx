import type { Metadata } from 'next';
import PitchDeck from '../PitchDeck';
import { BALANZ } from '../pitch-data';

export const metadata: Metadata = {
  title: 'Nordelta Tech × Balanz · Propuesta',
  description: 'Propuesta para que Balanz sea el sponsor principal de Nordelta Tech.',
  robots: { index: false, follow: false },
};

export default function BalanzPitchPage() {
  return <PitchDeck sponsor={BALANZ} />;
}
