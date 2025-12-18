import type { MetadataRoute } from 'next';
import { APP_CONFIG } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = APP_CONFIG.url;

  // Static pages
  const staticPages = [
    '',
    '/dashboard',
    '/wizard',
    '/plans',
    '/plans/new',
    '/plans/compare',
    '/children',
    '/portfolio',
    '/settings',
    '/about',
    '/contact',
    '/privacy',
    '/tos',
    '/changelogs',
  ];

  return staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/dashboard' ? 0.9 : 0.8,
  }));
}
