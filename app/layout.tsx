import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nordelta Build — Comunidad Tech',
  description: 'La comunidad de founders, devs y makers de Nordelta y zona norte. Construimos startups, compartimos conocimiento y hacemos crecer el ecosistema tech desde el agua.',
  keywords: 'Nordelta, Tech, Comunidad, Startups, Builders, Founders, Developers, Makers, Buenos Aires, Zona Norte',
  authors: [{ name: 'Nordelta Build' }],
  openGraph: {
    title: 'Nordelta Build — Comunidad Tech',
    description: 'La comunidad de founders, devs y makers de Nordelta y zona norte. Construimos startups y hacemos crecer el ecosistema tech.',
    url: 'https://nordelta-build.vercel.app/',
    siteName: 'Nordelta Build',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Nordelta Build OG Image',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nordelta Build — Comunidad Tech',
    description: 'La comunidad de founders, devs y makers de Nordelta y zona norte. Construimos startups y hacemos crecer el ecosistema tech.',
    images: ['/api/og'],
  },
  icons: {
    icon: '/assets/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
