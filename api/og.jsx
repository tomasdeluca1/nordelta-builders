import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function () {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #222 2%, transparent 0%), radial-gradient(circle at 75px 75px, #222 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 80px', backgroundColor: 'rgba(10, 10, 10, 0.9)', borderRadius: '24px', border: '1px solid #333', maxWidth: '80%' }}>
          <h1 style={{ fontSize: 80, fontWeight: 900, color: '#fff', margin: 0, fontFamily: 'sans-serif', letterSpacing: '-0.05em', display: 'flex', alignItems: 'center' }}>
            NORDELTA <span style={{ color: '#00e5a0', fontStyle: 'italic', marginLeft: '10px' }}>BUILD</span>
          </h1>
          <p style={{ fontSize: 40, color: '#a1a1aa', marginTop: 20, maxWidth: 800, fontFamily: 'sans-serif', lineHeight: 1.4 }}>
            La comunidad de founders, devs y makers de Nordelta y zona norte.
          </p>
          <div style={{ display: 'flex', marginTop: 40, alignItems: 'center' }}>
            <div style={{ padding: '10px 20px', backgroundColor: 'rgba(0, 229, 160, 0.1)', color: '#00e5a0', borderRadius: '100px', fontSize: 24, fontWeight: 'bold' }}>
              ✦ Founders
            </div>
            <div style={{ padding: '10px 20px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#fff', borderRadius: '100px', fontSize: 24, fontWeight: 'bold', marginLeft: 16 }}>
              ✦ Startups
            </div>
            <div style={{ padding: '10px 20px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#fff', borderRadius: '100px', fontSize: 24, fontWeight: 'bold', marginLeft: 16 }}>
              ✦ Devs
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
