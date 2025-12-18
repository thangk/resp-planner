# Prompt: SEO Friendliness Implementation

## Context

Implement comprehensive SEO optimizations to ensure the application is discoverable by search engines and displays well when shared on social media platforms.

## Requirements

### 1. robots.txt

Create a `public/robots.txt` file:

```txt
User-agent: *
Allow: /

Sitemap: https://[YOUR_DOMAIN]/sitemap.xml
```

### 2. Dynamic Sitemap

Create `src/app/sitemap.ts` for automatic sitemap generation:

```typescript
import type { MetadataRoute } from 'next';
import { APP_CONFIG } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = APP_CONFIG.url;

  const staticPages = [
    '',
    '/dashboard',
    '/about',
    '/contact',
    '/privacy',
    '/tos',
    // Add all your static routes
  ];

  return staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}
```

### 3. Root Layout Metadata

Update `src/app/layout.tsx` with comprehensive metadata:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(APP_CONFIG.url),
  title: {
    default: APP_CONFIG.name,
    template: `%s - ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
  keywords: ['keyword1', 'keyword2', ...],
  authors: [{ name: APP_CONFIG.author.name, url: APP_CONFIG.author.url }],
  creator: APP_CONFIG.author.name,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: APP_CONFIG.url,
    siteName: APP_CONFIG.name,
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    images: [{ url: '/og', width: 1200, height: 630, alt: APP_CONFIG.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    images: ['/og'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: APP_CONFIG.themeColor,
};
```

### 4. Per-Page Metadata

Create a metadata helper in `src/lib/metadata.ts`:

```typescript
import type { Metadata } from 'next';
import { APP_CONFIG } from './constants';

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
}

export function generatePageMetadata({ title, description, path }: PageMetadataOptions): Metadata {
  const url = `${APP_CONFIG.url}${path}`;
  const ogImageUrl = `/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} - ${APP_CONFIG.name}`,
      description,
      url,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${title} - ${APP_CONFIG.name}` }],
    },
    twitter: {
      title: `${title} - ${APP_CONFIG.name}`,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: url,
    },
  };
}

export const PAGE_METADATA = {
  dashboard: {
    title: 'Dashboard',
    description: 'Your dashboard description...',
    path: '/dashboard',
  },
  // Add all pages...
} as const;
```

Then create `layout.tsx` in each route folder:

```typescript
import { generatePageMetadata, PAGE_METADATA } from '@/lib/metadata';

export const metadata = generatePageMetadata(PAGE_METADATA.dashboard);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
```

### 5. Web App Manifest

Create `public/manifest.webmanifest`:

```json
{
  "name": "App Name",
  "short_name": "App",
  "description": "App description",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#1A4F5C",
  "background_color": "#F7FAFA",
  "display": "standalone",
  "start_url": "/"
}
```

## SEO Checklist

- [ ] robots.txt in public folder
- [ ] Dynamic sitemap.ts
- [ ] Comprehensive root metadata
- [ ] Per-page metadata with unique titles/descriptions
- [ ] Open Graph images (static or dynamic)
- [ ] Twitter card metadata
- [ ] Canonical URLs for each page
- [ ] Web app manifest
- [ ] Favicon and apple-touch-icon
- [ ] Semantic HTML structure
- [ ] Proper heading hierarchy (h1 -> h2 -> h3)
- [ ] Alt text for images
- [ ] Skip navigation link for accessibility
