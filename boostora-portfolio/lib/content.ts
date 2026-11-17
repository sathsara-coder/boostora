import { getServerClient } from './supabase';
import type { SiteContent, Project } from './types';

// The public website reads ONLY published views. No draft records are exposed here.
export async function loadPublished(): Promise<{ content: SiteContent | null; projects: Project[] }> {
  const db = getServerClient();
  if (!db) return { content: null, projects: [] };
  const [site, projects] = await Promise.all([
    db.from('published_site').select('content').eq('id', 1).maybeSingle(),
    db.from('live_projects').select('id,data,position').order('position', { ascending: true })
  ]);
  if (site.error) console.error('Error loading published site:', site.error.message);
  if (projects.error) console.error('Error loading projects:', projects.error.message);
  return { content: (site.data?.content as SiteContent) ?? null, projects: ((projects.data ?? []).map(p => ({ ...p.data as Project, id: p.id })) ) };
}
export const siteBase = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
