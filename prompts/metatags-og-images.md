# Prompt: Meta Tags and Dynamic OG Image Generation

## Context

Implement comprehensive meta tags and dynamic Open Graph image generation for rich social media previews when URLs are shared.

## Requirements

### 1. Dynamic OG Image Route

Create `src/app/og/route.tsx` for dynamic OG image generation:

```typescript
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams, hostname } = new URL(request.url);
  const title = searchParams.get('title');

  // Fetch logo from public folder
  const logoUrl = new URL('/logo.png', request.url).toString();

  // Dynamic domain display (fallback for localhost)
  const displayDomain = hostname === 'localhost' ? 'your-domain.com' : hostname;

  return new ImageResponse(
    (
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
          alt="Logo"
          width={500}
          height={125}
          style={{ objectFit: 'contain' }}
        />

        {/* Dynamic page title */}
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

        {/* Domain at bottom */}
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
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

### 2. OG Image Design Guidelines

**Dimensions:** 1200x630px (standard OG image size)

**Design Elements:**

- Dark gradient background for modern look
- Centered logo (500x125px recommended)
- Optional page title below logo
- Domain/URL at bottom for branding
- Subtle accent gradients using theme colors

**Color Scheme Example:**

- Background: `#0d1117` to `#161b22` gradient
- Accent: Theme color with 0.2-0.3 opacity
- Text: `#9ca3af` for title, `#6b7280` for domain

### 3. Meta Tag Structure

**Root Layout (layout.tsx):**

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(APP_CONFIG.url),

  // Basic
  title: { default: APP_CONFIG.name, template: `%s - ${APP_CONFIG.name}` },
  description: APP_CONFIG.description,

  // Authorship
  authors: [{ name: APP_CONFIG.author.name, url: APP_CONFIG.author.url }],
  creator: APP_CONFIG.author.name,

  // Icons
  icons: { icon: '/favicon.ico', apple: '/apple-icon.png' },
  manifest: '/manifest.webmanifest',

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: APP_CONFIG.url,
    siteName: APP_CONFIG.name,
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    images: [{ url: '/og', width: 1200, height: 630, alt: APP_CONFIG.name }],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    images: ['/og'],
  },
};

export const viewport: Viewport = {
  themeColor: APP_CONFIG.themeColor,
};
```

**Per-Page Metadata:**

```typescript
// In route's layout.tsx
export const metadata = generatePageMetadata({
  title: 'Page Title',
  description: 'Page description for search engines and social sharing.',
  path: '/page-path',
});
```

The `generatePageMetadata` helper automatically:

- Sets page-specific title and description
- Generates OG image URL with title parameter: `/og?title=Page%20Title`
- Sets canonical URL
- Configures Twitter card

### 4. Testing OG Images

**Local Testing:**

1. Run dev server: `pnpm dev`
2. Visit: `http://localhost:3000/og` (default image)
3. Visit: `http://localhost:3000/og?title=Dashboard` (with title)

**Social Media Debuggers:**

- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

### 5. Required Assets

Place in `public/` folder:

- `logo.png` - Main logo for OG image (transparent background)
- `favicon.ico` - Browser tab icon
- `apple-icon.png` - Apple touch icon
- `android-chrome-192x192.png` - Android icon (192x192)
- `android-chrome-512x512.png` - Android icon (512x512)

## Checklist

- [ ] OG route created at `/og`
- [ ] Edge runtime enabled for performance
- [ ] Logo placed in public folder
- [ ] Root metadata configured
- [ ] Per-page metadata helper created
- [ ] Each route has layout.tsx with metadata
- [ ] Tested OG images locally
- [ ] Validated with social media debuggers
