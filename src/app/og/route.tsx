import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams, hostname } = new URL(request.url);
  const title = searchParams.get('title');

  // Fetch the logo from public folder
  const logoUrl = new URL('/logo.png', request.url).toString();

  // Get display domain (without protocol)
  const displayDomain = hostname === 'localhost' ? 'resp-planner.ca' : hostname;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
        position: 'relative',
      }}
    >
      {/* Subtle gradient accents */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(ellipse at 20% 80%, rgba(26, 79, 92, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(26, 79, 92, 0.2) 0%, transparent 50%)',
        }}
      />

      {/* Logo */}
      <img
        src={logoUrl}
        alt="RESP Planner"
        width={500}
        height={125}
        style={{
          objectFit: 'contain',
        }}
      />

      {/* Page title (if provided) */}
      {title && (
        <div
          style={{
            marginTop: 32,
            color: '#9ca3af',
            fontSize: 40,
            fontWeight: 500,
            letterSpacing: '0.05em',
          }}
        >
          {title}
        </div>
      )}

      {/* URL at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          color: '#6b7280',
          fontSize: 20,
        }}
      >
        {displayDomain}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
