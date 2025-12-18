# Vercel Deployment Readiness Check

Run a comprehensive deployment readiness check for this Next.js project.

## Automated Checks to Perform

### 1. Build Verification

Run `pnpm build` and report if it succeeds. Note any TypeScript or ESLint errors.

### 2. Required Files Check

Verify these files exist:

- `public/robots.txt`
- `public/favicon.ico`
- `public/logo.png` (for OG images)
- `public/manifest.webmanifest`
- `src/app/sitemap.ts` or `public/sitemap.xml`
- `src/app/not-found.tsx` (404 page)
- `.env.example` (env vars documentation)
- `.vercelignore` (optional but recommended)

### 3. Security Headers

Check `next.config.ts` for security headers configuration (X-Frame-Options, X-Content-Type-Options, Referrer-Policy).

### 4. Environment Variables

- Verify `.env.example` exists and documents required vars
- Check `.gitignore` includes `.env.local` and `.env*.local`
- Report if any env vars are required but not documented

### 5. SEO Files

- Confirm `robots.txt` has valid content
- Confirm sitemap route/file exists
- Check root `layout.tsx` has metadata export
- Verify OG image route exists (`src/app/og/route.tsx`)

### 6. App Icons

Check `public/` for:

- `favicon.ico`
- `apple-icon.png` or `src/app/apple-icon.tsx`
- Android icons (192x192, 512x512) - optional

## Output Format

Provide a summary table:

| Check             | Status | Notes |
| ----------------- | ------ | ----- |
| Build             | ✅/❌  | ...   |
| robots.txt        | ✅/❌  | ...   |
| sitemap           | ✅/❌  | ...   |
| 404 page          | ✅/❌  | ...   |
| Security headers  | ✅/❌  | ...   |
| Env documentation | ✅/❌  | ...   |
| OG images         | ✅/❌  | ...   |
| Favicon           | ✅/❌  | ...   |

Then list any issues found and recommended fixes.

## Notes

- This checks pre-deployment readiness only
- Domain/DNS and Vercel dashboard settings must be configured manually
- Post-deployment testing (curl checks, PageSpeed) should be done after deploy
