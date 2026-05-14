import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.APP_URL?.trim() || 'https://nordelta.tech';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Nordelta Tech — Comunidad Tech · nordelta.tech',
  description:
    'La comunidad de founders, devs y makers de Nordelta y zona norte. Construimos startups, compartimos conocimiento y hacemos crecer el ecosistema tech desde el agua.',
  keywords:
    'Nordelta, Tech, Comunidad, Startups, Builders, Founders, Developers, Makers, Buenos Aires, Zona Norte, nordelta.tech',
  authors: [{ name: 'Nordelta Tech' }],
  alternates: { canonical: siteUrl },
  openGraph: {
    title: 'Nordelta Tech — Comunidad Tech',
    description:
      'Founders, devs y makers de Nordelta y zona norte construyendo el ecosistema tech desde el agua.',
    url: siteUrl,
    siteName: 'Nordelta Tech',
    images: [
      { url: '/api/og', width: 1200, height: 630, alt: 'Nordelta Tech · nordelta.tech' },
    ],
    type: 'website',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nordelta Tech — Comunidad Tech',
    description: 'Founders, devs y makers construyendo el ecosistema tech desde Nordelta.',
    images: ['/api/og'],
  },
  icons: { icon: '/assets/favicon.svg' },
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
