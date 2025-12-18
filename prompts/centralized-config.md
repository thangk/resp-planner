# Prompt: Centralize Hardcoded Configuration

## Context

Centralize all hardcoded values (URLs, author info, theme colors, app metadata) into a single configuration file for easy maintenance and reusability across the application.

## Requirements

### 1. Create Central Configuration

In `src/lib/constants.ts`, create an `APP_CONFIG` object:

```typescript
export const APP_CONFIG = {
  // App Identity
  name: 'App Name',
  version: '1.0.0',
  storagePrefix: 'app-name', // for localStorage keys

  // URLs
  url: 'https://your-domain.com',

  // Description
  description: 'Your app description for SEO and metadata.',

  // Author Information
  author: {
    name: 'Your Name',
    email: 'contact@your-domain.com',
    url: 'https://your-portfolio.com',
    projectsUrl: 'https://your-portfolio.com/projects',
  },

  // Theme
  themeColor: '#1A4F5C', // Primary brand color
} as const;
```

### 2. Values to Centralize

**Must Centralize:**

- App name
- App URL/domain
- App description
- Author name
- Author email
- Author website URL
- Theme/brand color

**Consider Centralizing:**

- Social media handles
- Support/contact URLs
- API endpoints
- Feature flags
- Default settings

### 3. Usage Examples

**In Layout Metadata:**

```typescript
import { APP_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  metadataBase: new URL(APP_CONFIG.url),
  title: { default: APP_CONFIG.name, template: `%s - ${APP_CONFIG.name}` },
  description: APP_CONFIG.description,
  authors: [{ name: APP_CONFIG.author.name, url: APP_CONFIG.author.url }],
  creator: APP_CONFIG.author.name,
};

export const viewport: Viewport = {
  themeColor: APP_CONFIG.themeColor,
};
```

**In Pages:**

```typescript
import { APP_CONFIG } from '@/lib/constants';

// About page
<h1>Hi, I'm {APP_CONFIG.author.name}</h1>

// Contact page
<Link href={`mailto:${APP_CONFIG.author.email}`}>
  {APP_CONFIG.author.email}
</Link>

<Link href={APP_CONFIG.author.url}>
  Visit Portfolio
</Link>
```

**In Sitemap:**

```typescript
import { APP_CONFIG } from '@/lib/constants';

export default function sitemap() {
  const baseUrl = APP_CONFIG.url;
  // ...
}
```

**In OG Image Route:**

```typescript
// For localhost fallback
const displayDomain = hostname === 'localhost' ? new URL(APP_CONFIG.url).hostname : hostname;
```

### 4. Files to Update After Centralization

Audit and update these files to use `APP_CONFIG`:

- [ ] `src/app/layout.tsx` - Root metadata
- [ ] `src/app/sitemap.ts` - Base URL
- [ ] `src/app/og/route.tsx` - Domain display
- [ ] `src/lib/metadata.ts` - Page metadata helper
- [ ] `src/app/about/page.tsx` - Author info
- [ ] `src/app/contact/page.tsx` - Email, URLs
- [ ] `public/manifest.webmanifest` - (static, manually sync)

### 5. Static Files Note

Some files can't import TypeScript constants:

- `public/robots.txt` - Hardcode domain
- `public/manifest.webmanifest` - Hardcode theme color

Keep these in sync manually when updating `APP_CONFIG`.

### 6. Search for Hardcoded Values

Run these searches to find values to centralize:

```bash
# Find hardcoded domains
grep -r "https://" src/

# Find email addresses
grep -r "@" src/ --include="*.tsx" --include="*.ts"

# Find hex colors
grep -rE "#[0-9A-Fa-f]{6}" src/
```

### 7. Benefits of Centralization

1. **Single Source of Truth** - Change once, update everywhere
2. **Easier Rebranding** - Update config for new projects
3. **Type Safety** - TypeScript ensures correct usage
4. **Consistency** - No risk of typos or mismatched values
5. **Maintainability** - Clear location for app configuration

## Checklist

- [ ] Create `APP_CONFIG` in constants.ts
- [ ] Add app identity (name, version, storagePrefix)
- [ ] Add URLs (main domain)
- [ ] Add description
- [ ] Add author info (name, email, url, projectsUrl)
- [ ] Add theme color
- [ ] Update layout.tsx to use config
- [ ] Update sitemap.ts to use config
- [ ] Update metadata.ts to use config
- [ ] Update about page to use config
- [ ] Update contact page to use config
- [ ] Manually sync static files (manifest, robots.txt)
- [ ] Search codebase for remaining hardcoded values
