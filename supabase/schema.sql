-- ============================================================
--  AppNex — Complete Database Schema v2
--  Project: cdpbwcdyreqecmkypqab
--
--  Run this ENTIRE file in:
--  Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";


-- ============================================================
--  HELPER: auto-update updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
--  1. PROFILES
--     Mirrors auth.users — created automatically on signup.
-- ============================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  avatar_url    text,
  bio           text,
  website       text,
  plan          text not null default 'free'
                  check (plan in ('free','pro','team','enterprise')),
  app_count     int  not null default 0,
  is_verified   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
--  2. APPS
-- ============================================================
create table if not exists public.apps (
  id            uuid primary key default uuid_generate_v4(),
  owner_id      uuid references public.profiles(id) on delete set null,
  name          text not null check (char_length(name) between 1 and 100),
  description   text not null default ''
                  check (char_length(description) <= 1000),
  type          text not null check (type in ('pwa', 'apk', 'web')),
  url           text not null unique check (url ~* '^https?://'),
  icon          text not null default '',
  icon_storage_path text,          -- path inside Supabase Storage bucket
  screenshots   text[] not null default '{}',
  theme_color   text,
  install_count bigint not null default 0,
  view_count    bigint not null default 0,
  is_featured   boolean not null default false,
  is_published  boolean not null default true,
  tags          text[] not null default '{}',
  version       text,
  size_bytes    bigint,
  min_os        text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists apps_updated_at on public.apps;
create trigger apps_updated_at
  before update on public.apps
  for each row execute procedure public.set_updated_at();

-- Keep profile.app_count in sync
create or replace function public.sync_app_count()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' and new.owner_id is not null then
    update public.profiles
    set app_count = app_count + 1
    where id = new.owner_id;
  elsif TG_OP = 'DELETE' and old.owner_id is not null then
    update public.profiles
    set app_count = greatest(app_count - 1, 0)
    where id = old.owner_id;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists apps_count_sync on public.apps;
create trigger apps_count_sync
  after insert or delete on public.apps
  for each row execute procedure public.sync_app_count();

-- Atomic view count increment (called via RPC)
create or replace function public.increment_view_count(app_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.apps
  set view_count = view_count + 1
  where id = app_id;
end;
$$;


-- ============================================================
--  3. REVIEWS
-- ============================================================
create table if not exists public.reviews (
  id         uuid primary key default uuid_generate_v4(),
  app_id     uuid not null references public.apps(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  rating     smallint not null check (rating between 1 and 5),
  body       text check (char_length(body) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_id, user_id)
);

drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at
  before update on public.reviews
  for each row execute procedure public.set_updated_at();


-- ============================================================
--  4. INSTALL EVENTS  (realtime analytics)
-- ============================================================
create table if not exists public.install_events (
  id         bigserial primary key,
  app_id     uuid not null references public.apps(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete set null,
  platform   text check (platform in ('web','android','ios','desktop','unknown')),
  ip_hash    text,
  created_at timestamptz not null default now()
);

-- Increment install_count atomically
create or replace function public.increment_install_count()
returns trigger language plpgsql security definer as $$
begin
  update public.apps
  set install_count = install_count + 1
  where id = new.app_id;
  return new;
end;
$$;

drop trigger if exists on_install_event on public.install_events;
create trigger on_install_event
  after insert on public.install_events
  for each row execute procedure public.increment_install_count();


-- ============================================================
--  5. SAVED / BOOKMARKED APPS
-- ============================================================
create table if not exists public.saved_apps (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  app_id     uuid not null references public.apps(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, app_id)
);


-- ============================================================
--  6. NOTIFICATIONS  (realtime)
-- ============================================================
create table if not exists public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null
               check (type in ('review','install','system','welcome','app_approved')),
  title      text not null,
  body       text,
  is_read    boolean not null default false,
  meta       jsonb,
  created_at timestamptz not null default now()
);

-- Welcome notification on first sign-up
create or replace function public.send_welcome_notification()
returns trigger language plpgsql security definer as $$
begin
  insert into public.notifications (user_id, type, title, body)
  values (
    new.id,
    'welcome',
    'Welcome to AppNex! 🚀',
    'Start by submitting your first app — it takes less than 30 seconds.'
  );
  return new;
end;
$$;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.send_welcome_notification();

-- Notify app owner when someone reviews their app
create or replace function public.notify_on_review()
returns trigger language plpgsql security definer as $$
declare
  v_app_name text;
  v_owner_id uuid;
  v_reviewer_name text;
begin
  select name, owner_id into v_app_name, v_owner_id
  from public.apps where id = new.app_id;

  select coalesce(full_name, email) into v_reviewer_name
  from public.profiles where id = new.user_id;

  if v_owner_id is not null and v_owner_id <> new.user_id then
    insert into public.notifications (user_id, type, title, body, meta)
    values (
      v_owner_id,
      'review',
      'New review on ' || v_app_name,
      v_reviewer_name || ' left a ' || new.rating || '-star review.',
      jsonb_build_object('app_id', new.app_id, 'review_id', new.id, 'rating', new.rating)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_review_created on public.reviews;
create trigger on_review_created
  after insert on public.reviews
  for each row execute procedure public.notify_on_review();


-- ============================================================
--  7. INDEXES
-- ============================================================
create index if not exists apps_created_at_idx    on public.apps (created_at desc);
create index if not exists apps_owner_idx          on public.apps (owner_id);
create index if not exists apps_type_idx           on public.apps (type);
create index if not exists apps_featured_idx       on public.apps (is_featured) where is_featured = true;
create index if not exists apps_published_idx      on public.apps (is_published) where is_published = true;
create index if not exists apps_name_trgm_idx      on public.apps using gin (name gin_trgm_ops);
create index if not exists apps_desc_trgm_idx      on public.apps using gin (description gin_trgm_ops);
create index if not exists apps_tags_idx           on public.apps using gin (tags);
create index if not exists install_events_app_idx  on public.install_events (app_id, created_at desc);
create index if not exists notifications_user_idx  on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications (user_id) where is_read = false;
create index if not exists reviews_app_idx         on public.reviews (app_id);
create index if not exists saved_apps_user_idx     on public.saved_apps (user_id);


-- ============================================================
--  8. ROW LEVEL SECURITY
-- ============================================================

-- profiles
alter table public.profiles enable row level security;
drop policy if exists "Public profiles viewable" on public.profiles;
create policy "Public profiles viewable"
  on public.profiles for select using (true);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- apps
alter table public.apps enable row level security;
drop policy if exists "Published apps viewable" on public.apps;
create policy "Published apps viewable"
  on public.apps for select using (is_published = true);
drop policy if exists "Owners view own apps" on public.apps;
create policy "Owners view own apps"
  on public.apps for select using (auth.uid() = owner_id);

-- Allow anyone to submit apps (no artificial limits — AppNex stores metadata only)
drop policy if exists "Auth users submit apps" on public.apps;
drop policy if exists "Anon submit apps" on public.apps;
drop policy if exists "Anyone can submit apps" on public.apps;
create policy "Anyone can submit apps"
  on public.apps for insert
  with check (true);

drop policy if exists "Owners update apps" on public.apps;
create policy "Owners update apps"
  on public.apps for update
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "Owners delete apps" on public.apps;
create policy "Owners delete apps"
  on public.apps for delete using (auth.uid() = owner_id);

-- reviews
alter table public.reviews enable row level security;
drop policy if exists "Reviews public" on public.reviews;
create policy "Reviews public" on public.reviews for select using (true);
drop policy if exists "Auth write reviews" on public.reviews;
create policy "Auth write reviews"
  on public.reviews for insert to authenticated
  with check (auth.uid() = user_id);
drop policy if exists "Users update own reviews" on public.reviews;
create policy "Users update own reviews"
  on public.reviews for update using (auth.uid() = user_id);
drop policy if exists "Users delete own reviews" on public.reviews;
create policy "Users delete own reviews"
  on public.reviews for delete using (auth.uid() = user_id);

-- install_events
alter table public.install_events enable row level security;
drop policy if exists "Anyone record install" on public.install_events;
create policy "Anyone record install"
  on public.install_events for insert with check (true);
drop policy if exists "Owners view installs" on public.install_events;
create policy "Owners view installs"
  on public.install_events for select
  using (exists (
    select 1 from public.apps
    where apps.id = install_events.app_id
      and apps.owner_id = auth.uid()
  ));

-- saved_apps
alter table public.saved_apps enable row level security;
drop policy if exists "Users view saved" on public.saved_apps;
create policy "Users view saved"
  on public.saved_apps for select using (auth.uid() = user_id);
drop policy if exists "Users save apps" on public.saved_apps;
create policy "Users save apps"
  on public.saved_apps for insert to authenticated
  with check (auth.uid() = user_id);
drop policy if exists "Users unsave apps" on public.saved_apps;
create policy "Users unsave apps"
  on public.saved_apps for delete using (auth.uid() = user_id);

-- notifications
alter table public.notifications enable row level security;
drop policy if exists "Users view own notifs" on public.notifications;
create policy "Users view own notifs"
  on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "Users mark notifs read" on public.notifications;
create policy "Users mark notifs read"
  on public.notifications for update using (auth.uid() = user_id);


-- ============================================================
--  9. STORAGE BUCKETS
--     Run these separately if the SQL editor doesn't support
--     storage schema — or use the Supabase Dashboard UI.
-- ============================================================

-- App icons bucket (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'app-icons',
  'app-icons',
  true,
  2097152,   -- 2 MB
  array['image/png','image/jpeg','image/webp','image/gif','image/svg+xml']
)
on conflict (id) do nothing;

-- App screenshots bucket (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'app-screenshots',
  'app-screenshots',
  true,
  5242880,   -- 5 MB
  array['image/png','image/jpeg','image/webp']
)
on conflict (id) do nothing;

-- APK files bucket (public read, larger limit)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'apk-files',
  'apk-files',
  true,
  104857600,  -- 100 MB
  array['application/vnd.android.package-archive','application/octet-stream']
)
on conflict (id) do nothing;

-- Storage RLS policies
drop policy if exists "Public read app-icons" on storage.objects;
create policy "Public read app-icons"
  on storage.objects for select
  using (bucket_id = 'app-icons');

drop policy if exists "Auth upload app-icons" on storage.objects;
create policy "Auth upload app-icons"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'app-icons');

drop policy if exists "Owners delete app-icons" on storage.objects;
create policy "Owners delete app-icons"
  on storage.objects for delete to authenticated
  using (bucket_id = 'app-icons' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Public read screenshots" on storage.objects;
create policy "Public read screenshots"
  on storage.objects for select
  using (bucket_id = 'app-screenshots');

drop policy if exists "Auth upload screenshots" on storage.objects;
create policy "Auth upload screenshots"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'app-screenshots');

drop policy if exists "Public read apk-files" on storage.objects;
create policy "Public read apk-files"
  on storage.objects for select
  using (bucket_id = 'apk-files');

drop policy if exists "Auth upload apk-files" on storage.objects;
create policy "Auth upload apk-files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'apk-files');


-- ============================================================
--  10. REALTIME
-- ============================================================
alter publication supabase_realtime add table public.apps;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.install_events;
alter publication supabase_realtime add table public.reviews;


-- ============================================================
--  11. STATS VIEW
-- ============================================================
create or replace view public.apps_with_stats as
select
  a.*,
  p.full_name   as owner_name,
  p.avatar_url  as owner_avatar,
  coalesce(round(avg(r.rating)::numeric, 1), 0) as avg_rating,
  count(r.id)::int                               as review_count
from public.apps a
left join public.profiles p on p.id = a.owner_id
left join public.reviews  r on r.app_id = a.id
where a.is_published = true
group by a.id, p.full_name, p.avatar_url;


-- ============================================================
--  DONE ✓
--  Next: Enable Email auth in Dashboard → Auth → Providers
--        Set Site URL to http://localhost:3000 (dev)
-- ============================================================
