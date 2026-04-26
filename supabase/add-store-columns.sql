-- ============================================================
--  AppNex — Add store link columns for native apps
--  Run in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- Add store link columns (safe to run multiple times)
alter table public.apps
  add column if not exists store_android text,
  add column if not exists store_ios     text,
  add column if not exists store_windows text;

-- Update the type check to include 'store'
alter table public.apps
  drop constraint if exists apps_type_check;

alter table public.apps
  add constraint apps_type_check
  check (type in ('pwa', 'apk', 'web', 'store'));

-- Verify
select column_name, data_type
from information_schema.columns
where table_name = 'apps'
  and column_name in ('type', 'store_android', 'store_ios', 'store_windows');
