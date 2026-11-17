import type { MetadataRoute } from 'next';
import { siteBase } from '@/lib/content';
export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/about', '/portfolio', '/services', '/boostora', '/contact'].map(p => ({ url: `${siteBase}${p}`, changeFrequency: 'weekly' as const, priority: p ? 0.7 : 1 }));
}
