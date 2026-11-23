-- ResizePhotoInKB blog schema. Applied by `npm run db:setup` (or paste it into
-- Supabase → SQL Editor). Safe to re-run: every statement checks whether the object exists.

-- ---------------------------------------------------------------------------
-- Admins: only users listed here can write posts or upload images.
-- Add yourself after creating your login (see the bottom of this file).
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "Admins can see their own row" on public.admins;
create policy "Admins can see their own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- security definer so policies can check admin status without exposing the table
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Posts
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120),
  title           text not null check (length(title) between 1 and 200),
  seo_title       text check (seo_title is null or length(seo_title) <= 70),
  excerpt         text not null default '' check (length(excerpt) <= 300),
  content         text not null default '',
  cover_image_url text,
  cover_image_alt text,
  category        text not null default 'News',
  tags            text[] not null default '{}',
  lang            text not null default 'en' check (lang in ('en', 'hi')),
  status          text not null default 'draft' check (status in ('draft', 'published')),
  published_at    timestamptz,
  author_id       uuid references auth.users (id) on delete set null default auth.uid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint published_needs_date check (status = 'draft' or published_at is not null)
);

create index if not exists posts_published_idx on public.posts (status, published_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

alter table public.posts enable row level security;

-- Everyone can read published posts whose publish time has arrived (scheduled posts stay hidden).
drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts" on public.posts
  for select to anon, authenticated
  using ((status = 'published' and published_at <= now()) or public.is_admin());

drop policy if exists "Admins can insert posts" on public.posts;
create policy "Admins can insert posts" on public.posts
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can update posts" on public.posts;
create policy "Admins can update posts" on public.posts
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete posts" on public.posts;
create policy "Admins can delete posts" on public.posts
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Image storage: public bucket, only admins can upload / replace / delete.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-images', 'blog-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can upload blog images" on storage.objects;
create policy "Admins can upload blog images" on storage.objects
  for insert to authenticated with check (bucket_id = 'blog-images' and public.is_admin());

drop policy if exists "Admins can update blog images" on storage.objects;
create policy "Admins can update blog images" on storage.objects
  for update to authenticated using (bucket_id = 'blog-images' and public.is_admin());

drop policy if exists "Admins can delete blog images" on storage.objects;
create policy "Admins can delete blog images" on storage.objects
  for delete to authenticated using (bucket_id = 'blog-images' and public.is_admin());

-- ---------------------------------------------------------------------------
-- The admin login is NOT created here. It comes from ADMIN_EMAIL / ADMIN_PASSWORD
-- in .env and is synced by `npm run db:setup`, `npm run admin:sync` and on every
-- server start (see scripts/admin-sync.mjs).
-- ---------------------------------------------------------------------------
