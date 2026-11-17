-- Run once in the Supabase SQL Editor. Review policies before production deployment.
-- No service-role key is required or permitted in the browser.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.site_content (
  id int primary key default 1 check (id = 1),
  draft jsonb not null,
  published jsonb not null,
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  draft_data jsonb not null,
  published_data jsonb,
  draft_order int not null default 0,
  published_order int not null default 0,
  is_published boolean not null default false,
  pending_delete boolean not null default false,
  updated_at timestamptz not null default now()
);
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  object_path text not null unique,
  url text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) between 3 and 200),
  service text not null default '' check (char_length(service) <= 120),
  message text not null check (char_length(message) between 10 and 3000),
  status text not null default 'new' check (status in ('new', 'read', 'replied')),
  created_at timestamptz not null default now()
);
create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists projects_published_order_idx on public.projects (published_order) where is_published = true;

alter table public.admin_users enable row level security;
alter table public.site_content enable row level security;
alter table public.projects enable row level security;
alter table public.media_assets enable row level security;
alter table public.enquiries enable row level security;

-- The owner adds admin users manually in the SQL editor; no self-sign-up privilege.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admin_users where user_id = (select auth.uid())); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

revoke all on public.admin_users, public.site_content, public.projects, public.media_assets, public.enquiries from anon;
revoke all on public.admin_users, public.site_content, public.projects, public.media_assets, public.enquiries from authenticated;
grant select on public.admin_users to authenticated;
grant select, update on public.site_content to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.media_assets to authenticated;
grant select, update, delete, insert on public.enquiries to authenticated;
grant insert on public.enquiries to anon;

create policy "Admins may view their own account" on public.admin_users for select to authenticated using (user_id = (select auth.uid()));
create policy "Admins manage site content" on public.site_content for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage projects" on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage media assets" on public.media_assets for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins view enquiries" on public.enquiries for select to authenticated using (public.is_admin());
create policy "Admins update enquiries" on public.enquiries for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete enquiries" on public.enquiries for delete to authenticated using (public.is_admin());
create policy "Visitors may submit enquiries" on public.enquiries for insert to anon, authenticated with check (status = 'new');

-- The two public views only project published columns. Neither contains drafts.
create or replace view public.published_site with (security_barrier = true) as
  select id, published as content from public.site_content where id = 1;
create or replace view public.live_projects with (security_barrier = true) as
  select id, published_data as data, published_order as position
  from public.projects where is_published = true and published_data is not null;
grant select on public.published_site, public.live_projects to anon, authenticated;

-- Atomic publishing. Only a real authorized admin can invoke it.
create or replace function public.publish_site() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  update public.site_content set published = draft, published_at = now();
  delete from public.projects where pending_delete = true;
  update public.projects set
    published_data = draft_data,
    published_order = draft_order,
    is_published = true,
    updated_at = now();
end; $$;
revoke all on function public.publish_site() from public, anon;
grant execute on function public.publish_site() to authenticated;

-- Assets are publicly readable by URL, but only an admin can modify the bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('website-media', 'website-media', true, 52428800,
  array['image/jpeg','image/png','image/webp','image/gif','image/avif','video/mp4','video/webm','application/pdf'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Admin list media" on storage.objects for select to authenticated
  using (bucket_id = 'website-media' and public.is_admin());
create policy "Admin upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'website-media' and public.is_admin());
create policy "Admin update media" on storage.objects for update to authenticated
  using (bucket_id = 'website-media' and public.is_admin())
  with check (bucket_id = 'website-media' and public.is_admin());
create policy "Admin remove media" on storage.objects for delete to authenticated
  using (bucket_id = 'website-media' and public.is_admin());

-- The seeded content is inserted in 002_seed.sql.
-- Then invite/create a user in Supabase Authentication > Users.
-- Add ONLY your desired account as admin via:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'YOUR-REAL-EMAIL@example.com';
