-- ============================================================
--  AppNex — Fix: Remove 5-app limit, allow unlimited submissions
--
--  Run this in Supabase Dashboard → SQL Editor → New query → Run
--  This fixes the RLS policies so anyone can submit apps without limit.
-- ============================================================

-- Drop the old restrictive policies
drop policy if exists "Auth users submit apps" on public.apps;
drop policy if exists "Anon submit apps" on public.apps;
drop policy if exists "Anyone can submit apps" on public.apps;

-- Create a single open insert policy — no limits
-- AppNex only stores metadata (name, URL, icon), not actual app files
create policy "Anyone can submit apps"
  on public.apps for insert
  with check (true);

-- Verify the fix
select policyname, cmd, qual
from pg_policies
where tablename = 'apps'
order by cmd;
