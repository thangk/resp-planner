# Prompt: Deployment Readiness Check (Vercel/Production)

## Context

Perform a comprehensive deployment readiness check to ensure the application is production-ready for platforms like Vercel, Netlify, or similar hosting services.

## Pre-Deployment Checklist

### 1. Build Verification

```bash
# Clean install and build
rm -rf node_modules .next
pnpm install
pnpm build
```

**Check for:**

- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings/errors
- [ ] All pages generate successfully

### 2. Environment Variables

**Verify `.env.example` exists with all required variables:**

```env
# Example - document all env vars your app needs
NEXT_PUBLIC_APP_URL=https://your-domain.com
# Add any API keys, database URLs, etc.
```

**Check:**

- [ ] All env vars documented in `.env.example`
- [ ] No secrets committed to git
- [ ] `.env.local` in `.gitignore`
- [ ] Production env vars set in hosting dashboard

### 3. SEO & Meta Tags

- [ ] `robots.txt` exists in `public/`
- [ ] Sitemap generates at `/sitemap.xml`
- [ ] Root metadata configured in `layout.tsx`
- [ ] Per-page metadata for all routes
- [ ] OG images generate correctly
- [ ] Favicon and app icons in place

**Test URLs after deployment:**

```
https://your-domain.com/robots.txt
https://your-domain.com/sitemap.xml
https://your-domain.com/og
https://your-domain.com/og?title=Test
```

### 4. Static Assets

**Verify `public/` folder contains:**

- [ ] `favicon.ico`
- [ ] `apple-icon.png` (180x180)
- [ ] `android-chrome-192x192.png`
- [ ] `android-chrome-512x512.png`
- [ ] `logo.png` (for OG images)
- [ ] `manifest.webmanifest`
- [ ] `robots.txt`

### 5. Configuration Files

**`next.config.ts` or `next.config.js`:**

```typescript
const nextConfig = {
  // Recommended settings
  reactStrictMode: true,

  // If using images from external domains
  images: {
    remotePatterns: [
      // Add allowed image domains
    ],
  },
};
```

### 6. Security Headers

Consider adding security headers in `next.config.js` or `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "origin-when-cross-origin" }
      ]
    }
  ]
}
```

### 7. Performance Checks

- [ ] Images optimized (use Next.js Image component)
- [ ] No large bundle sizes (check build output)
- [ ] Code splitting working (dynamic imports where needed)
- [ ] Fonts optimized (next/font)

### 8. Functionality Testing

**Test all critical paths:**

- [ ] Home page loads
- [ ] All navigation links work
- [ ] Forms submit correctly
- [ ] Data persists (localStorage, if used)
- [ ] Error pages render (404, 500)
- [ ] Mobile responsive design works

### 9. Domain & DNS

**For custom domains:**

- [ ] Domain purchased and verified
- [ ] DNS records configured
- [ ] SSL certificate active (automatic on Vercel)
- [ ] WWW redirect configured (if desired)

### 10. Vercel-Specific Settings

**In Vercel Dashboard:**

- [ ] Framework Preset: Next.js
- [ ] Build Command: `pnpm build` (or npm/yarn)
- [ ] Output Directory: `.next`
- [ ] Install Command: `pnpm install`
- [ ] Node.js Version: 18.x or 20.x

**Environment Variables in Vercel:**

- [ ] All production env vars added
- [ ] Preview env vars (if different)
- [ ] Scoped to correct environments

### 11. Post-Deployment Verification

**After deploying, verify:**

```bash
# Check pages load
curl -I https://your-domain.com
curl -I https://your-domain.com/dashboard
curl -I https://your-domain.com/about

# Check static files
curl -I https://your-domain.com/robots.txt
curl -I https://your-domain.com/sitemap.xml
curl -I https://your-domain.com/manifest.webmanifest

# Check OG image
curl -I https://your-domain.com/og
```

**Test with external tools:**

- [ ] Google PageSpeed Insights
- [ ] Facebook Sharing Debugger
- [ ] Twitter Card Validator
- [ ] Mobile-Friendly Test

### 12. Monitoring Setup (Optional)

- [ ] Vercel Analytics enabled
- [ ] Error tracking (Sentry, etc.)
- [ ] Uptime monitoring
- [ ] Performance monitoring

## Quick Deployment Commands

```bash
# Vercel CLI deployment
npx vercel

# Production deployment
npx vercel --prod

# Or connect GitHub repo for automatic deployments
```

## Common Issues & Fixes

**Build fails with module not found:**

- Check import paths (case sensitivity matters on Linux)
- Verify all dependencies in package.json

**OG images not generating:**

- Check Edge runtime is set: `export const runtime = 'edge'`
- Verify logo.png exists in public folder

**Environment variables undefined:**

- Prefix with `NEXT_PUBLIC_` for client-side access
- Restart dev server after adding env vars
- Check Vercel dashboard for production vars

**404 on dynamic routes:**

- Verify `generateStaticParams` for static export
- Check route file naming conventions

## Final Checklist Summary

- [ ] Build passes locally
- [ ] All env vars documented and set
- [ ] SEO files in place (robots.txt, sitemap, OG)
- [ ] Static assets complete
- [ ] Security headers configured
- [ ] Mobile responsive verified
- [ ] Domain and DNS ready
- [ ] Vercel settings configured
- [ ] Post-deployment tests pass
