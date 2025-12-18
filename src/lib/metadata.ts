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
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} - ${APP_CONFIG.name}`,
        },
      ],
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

// Page metadata configurations
export const PAGE_METADATA = {
  dashboard: {
    title: 'Dashboard',
    description:
      'View your RESP savings overview, track contributions, and monitor your education savings progress.',
    path: '/dashboard',
  },
  wizard: {
    title: 'Quick Start Wizard',
    description:
      'Get started with RESP Planner in minutes. Set up your children, portfolio, and create your first savings plan.',
    path: '/wizard',
  },
  plans: {
    title: 'Plans',
    description:
      'Create and manage your RESP savings plans. Compare different contribution strategies and projections.',
    path: '/plans',
  },
  plansNew: {
    title: 'New Plan',
    description:
      'Create a new RESP savings plan with customized contribution amounts and projections.',
    path: '/plans/new',
  },
  plansCompare: {
    title: 'Compare Plans',
    description:
      'Compare your RESP savings plans side by side to find the best strategy for your family.',
    path: '/plans/compare',
  },
  children: {
    title: 'Children',
    description:
      "Manage your children's profiles for RESP planning. Track CESG and CLB eligibility for each child.",
    path: '/children',
  },
  portfolio: {
    title: 'Portfolio',
    description:
      'Configure your RESP investment portfolio with ETFs and expected returns for accurate projections.',
    path: '/portfolio',
  },
  settings: {
    title: 'Settings',
    description:
      'Manage your RESP Planner preferences, appearance settings, and data backup options.',
    path: '/settings',
  },
  about: {
    title: 'About',
    description:
      'Learn about RESP Planner and the developer behind this free education savings planning tool.',
    path: '/about',
  },
  contact: {
    title: 'Contact',
    description:
      'Get in touch with the RESP Planner developer for questions, feedback, or support.',
    path: '/contact',
  },
  privacy: {
    title: 'Privacy Policy',
    description:
      'RESP Planner privacy policy. Learn how your data is stored locally and never shared.',
    path: '/privacy',
  },
  tos: {
    title: 'Terms of Service',
    description: 'Terms of service and disclaimer for using RESP Planner.',
    path: '/tos',
  },
  changelogs: {
    title: 'Changelogs',
    description: 'Version history and release notes for RESP Planner.',
    path: '/changelogs',
  },
} as const;
