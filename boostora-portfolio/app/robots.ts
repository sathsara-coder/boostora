import type { MetadataRoute } from 'next';
import { siteBase } from '@/lib/content';
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/preview', '/api/'] }, sitemap: `${siteBase}/sitemap.xml` };
}
