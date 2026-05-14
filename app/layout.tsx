import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.APP_URL?.trim() || 'https://nordelta.tech';

const TITLE = 'Nordelta Tech · Comunidad de founders, devs y makers';
const DESCRIPTION =
  'Comunidad tech de Nordelta y Zona Norte BA: founders, devs y makers construyendo startups, compartiendo conocimiento y armando red. Eventos y dashboard.';
const OG_DESCRIPTION =
  'Founders, devs y makers de Nordelta y Zona Norte construyendo el ecosistema tech desde el agua. Sumate al kick-off, conocé a los builders y empezá a buildear.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    'Nordelta, Tech, Comunidad, Startups, Builders, Founders, Developers, Makers, Buenos Aires, Zona Norte, nordelta.tech',
  authors: [{ name: 'Nordelta Tech' }],
  alternates: { canonical: siteUrl },
  openGraph: {
    title: 'Nordelta Tech · Comunidad de founders, devs y makers',
    description: OG_DESCRIPTION,
    url: siteUrl,
    siteName: 'Nordelta Tech',
    images: [
      { url: '/og.png', width: 1200, height: 630, alt: 'Nordelta Tech · nordelta.tech', type: 'image/png' },
    ],
    type: 'website',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nordelta Tech · Comunidad de founders, devs y makers',
    description: OG_DESCRIPTION,
    images: ['/og.png'],
  },
  // Favicon + Apple icon are auto-detected from app/icon.png and app/apple-icon.png
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
