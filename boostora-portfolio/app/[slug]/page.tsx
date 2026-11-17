import PublicSite from '@/components/PublicSite';
import { loadPublished } from '@/lib/content';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';
const routes = ['about', 'portfolio', 'services', 'boostora', 'contact'] as const;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { content } = await loadPublished();
  return { title: `${slug[0]?.toUpperCase() + slug.slice(1)} | ${content?.about.name || 'Creative Portfolio'}`, description: content?.seo.description || 'Creative portfolio and Meta advertising services' };
}
export default async function SectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!routes.includes(slug as typeof routes[number])) notFound();
  const { content, projects } = await loadPublished();
  return <PublicSite content={content} projects={projects} page={slug as typeof routes[number]} />;
}
