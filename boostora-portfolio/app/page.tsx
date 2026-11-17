import PublicSite from '@/components/PublicSite';
import { loadPublished } from '@/lib/content';
import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';
export async function generateMetadata(): Promise<Metadata> {
  const { content } = await loadPublished();
  return { title: content?.seo.title || 'Creative Portfolio | Boostora LK', description: content?.seo.description || 'Graphic design, video editing, motion graphics and digital advertising.', keywords: content?.seo.keywords?.split(',').map(x => x.trim()) };
}
export default async function Home() { const { content, projects } = await loadPublished(); return <PublicSite content={content} projects={projects} page="home" />; }
