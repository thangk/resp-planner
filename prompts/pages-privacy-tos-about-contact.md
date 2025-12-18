# Prompt: Create Privacy, ToS, About, and Contact Pages

## Context

Create four essential informational pages for the application: Privacy Policy, Terms of Service, About, and Contact. These pages should be consistent with the app's design system and provide necessary legal/informational content.

## Requirements

### Privacy Policy Page (`/privacy`)

- Clear explanation of data handling practices
- Sections covering:
  - What data is collected (if any)
  - How data is stored (local storage, no servers, etc.)
  - Third-party services used (analytics, etc.)
  - User rights regarding their data
  - Contact information for privacy concerns
- Use cards to organize sections visually

### Terms of Service Page (`/tos`)

- Clear disclaimer that the app is for informational purposes only
- Sections covering:
  - Acceptance of terms
  - Service description
  - Disclaimers (not financial/legal advice)
  - Limitation of liability
  - Data and privacy reference
  - Modifications to terms
  - Contact information
- Professional but accessible language

### About Page (`/about`)

- Developer introduction section with:
  - Name: [YOUR_NAME]
  - Brief bio (education, expertise)
  - Location
- Project description section explaining:
  - Why the app was built
  - Technologies used
  - Privacy-first approach
- Link to portfolio/other projects
- Use first-person voice for authenticity
- Include relevant icons (GraduationCap, MapPin, ExternalLink)

### Contact Page (`/contact`)

- Welcoming introduction
- Email contact section with:
  - Email address: [YOUR_EMAIL]
  - Clear call-to-action button
- Response time expectations
- Link to portfolio for more info
- Mention app name in email requests for context

## Navigation Integration

Add these pages to a secondary navigation section at the bottom of the sidebar, separate from main app navigation:

```typescript
export const SECONDARY_NAV_ITEMS = [
  { label: 'Privacy', href: '/privacy', icon: 'Shield' },
  { label: 'ToS', href: '/tos', icon: 'ScrollText' },
  { label: 'About', href: '/about', icon: 'Info' },
  { label: 'Contact', href: '/contact', icon: 'Mail' },
] as const;
```

## File Structure

```
src/app/
├── about/
│   ├── page.tsx
│   └── layout.tsx (for metadata)
├── contact/
│   ├── page.tsx
│   └── layout.tsx
├── privacy/
│   ├── page.tsx
│   └── layout.tsx
└── tos/
    ├── page.tsx
    └── layout.tsx
```

## Design Guidelines

- Use the app's Card components for content sections
- Consistent heading hierarchy (h1 for page title, CardTitle for sections)
- Muted text color for body content
- Proper spacing between sections (space-y-6)
- External links should open in new tab with proper rel attributes
- Use appropriate icons from lucide-react

## Example Card Structure

```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Icon className="h-5 w-5" />
      Section Title
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <p className="text-muted-foreground leading-relaxed">Content here...</p>
  </CardContent>
</Card>
```
