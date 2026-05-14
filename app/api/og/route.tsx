import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
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
          backgroundColor: '#05070a',
          backgroundImage:
            'radial-gradient(ellipse 900px 500px at 50% 40%, rgba(0,229,160,0.18) 0%, transparent 60%), radial-gradient(ellipse 600px 400px at 85% 90%, rgba(33,150,243,0.10) 0%, transparent 60%), linear-gradient(rgba(0,229,160,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,160,0.06) 1px, transparent 1px)',
          backgroundSize: 'auto, auto, 56px 56px, 56px 56px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top-left corner mark */}
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: '#00e5a0',
              boxShadow: '0 0 24px #00e5a0',
            }}
          />
          <div
            style={{
              color: '#7a8f9e',
              fontSize: 22,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Nordelta Tech · Community
          </div>
        </div>

        {/* Top-right corner mark */}
        <div
          style={{
            position: 'absolute',
            top: 56,
            right: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#7a8f9e',
            fontSize: 22,
            letterSpacing: '0.18em',
            fontWeight: 600,
          }}
        >
          <span style={{ color: '#00e5a0' }}>$</span>
          <span>cd ~/nordelta.tech</span>
        </div>

        {/* Center content block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 80px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 168,
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 0.92,
              letterSpacing: '-0.04em',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex' }}>BUILD THE</div>
            <div
              style={{
                display: 'flex',
                color: '#00e5a0',
                textShadow: '0 0 60px rgba(0,229,160,0.55)',
              }}
            >
              FUTURE.
            </div>
          </div>

          <div
            style={{
              marginTop: 36,
              fontSize: 30,
              color: '#b6c4cf',
              maxWidth: 880,
              lineHeight: 1.35,
              display: 'flex',
            }}
          >
            Founders, devs y makers construyendo el ecosistema tech de Nordelta y zona norte BA.
          </div>
        </div>

        {/* Bottom wordmark + pills */}
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 80,
            right: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 26px',
              border: '2px solid #00e5a0',
              borderRadius: 999,
              backgroundColor: 'rgba(0,229,160,0.08)',
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                backgroundColor: '#00e5a0',
                boxShadow: '0 0 16px #00e5a0',
              }}
            />
            <div
              style={{
                color: '#00e5a0',
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              nordelta.tech
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            <div
              style={{
                padding: '12px 22px',
                border: '1px solid rgba(255,255,255,0.18)',
                color: '#dde4ea',
                borderRadius: 999,
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: '0.06em',
              }}
            >
              FOUNDERS
            </div>
            <div
              style={{
                padding: '12px 22px',
                border: '1px solid rgba(255,255,255,0.18)',
                color: '#dde4ea',
                borderRadius: 999,
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: '0.06em',
              }}
            >
              DEVS
            </div>
            <div
              style={{
                padding: '12px 22px',
                border: '1px solid rgba(255,255,255,0.18)',
                color: '#dde4ea',
                borderRadius: 999,
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: '0.06em',
              }}
            >
              MAKERS
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
