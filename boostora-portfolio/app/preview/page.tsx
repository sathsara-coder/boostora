'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import PublicSite, { type PageKey } from '@/components/PublicSite';
import { getBrowserClient } from '@/lib/supabase';
import type { Project, SiteContent } from '@/lib/types';

function ProtectedPreview() {
  const search = useSearchParams();
  const page = (['home', 'about', 'portfolio', 'services', 'boostora', 'contact'].includes(search.get('page') || '') ? search.get('page') : 'home') as PageKey;
  const [state, setState] = useState<'loading' | 'forbidden' | 'ready'>('loading');
  const [content, setContent] = useState<SiteContent | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => { const db = getBrowserClient(); if (!db) { setState('forbidden'); return; }
    let live = true;
    (async () => {
      const { data: { user } } = await db.auth.getUser(); if (!live) return;
      if (!user) { setState('forbidden'); return; }
      const { data: admin } = await db.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
      if (!live) return; if (!admin) { setState('forbidden'); return; }
      const [siteRes, projectRes] = await Promise.all([db.from('site_content').select('draft').eq('id', 1).single(), db.from('projects').select('id,draft_data,draft_order,pending_delete').eq('pending_delete', false).order('draft_order')]);
      if (!live || siteRes.error || projectRes.error) { setState('forbidden'); return; }
      setContent(siteRes.data.draft as SiteContent); setProjects((projectRes.data || []).map(p => ({ ...(p.draft_data as Project), id: p.id }))); setState('ready');
    })(); return () => { live = false; };
  }, []);
  if (state === 'loading') return <div className="preview-state">Loading your unpublished draft...</div>;
  if (state === 'forbidden') return <div className="preview-state"><h1>Private preview</h1><p>Sign in as an authorized administrator to access this draft.</p><a href="/admin">Go to admin login</a></div>;
  return <PublicSite content={content} projects={projects} page={page} previewMode />;
}
export default function PreviewPage() { return <Suspense fallback={<div className="preview-state">Loading preview...</div>}><ProtectedPreview /></Suspense>; }
