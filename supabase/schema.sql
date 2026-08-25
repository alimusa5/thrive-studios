-- Thrive Studios — audit request storage
--
-- Run this ONCE in the Supabase SQL Editor (Dashboard -> SQL Editor -> New
-- query -> paste -> Run). It is safe to re-run: every statement is guarded.
--
-- What this is for: the contact form emails you AND writes a row here, so a
-- lead survives an email outage or an archived inbox. The status column tracks
-- the funnel — new -> audit sent -> DM'd -> call booked.

create table if not exists public.audit_requests (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  -- Exactly the four fields the form collects. Deliberately NOT stored:
  -- IP address and user agent. The privacy line on the page promises the
  -- details are used only to prepare and follow up the audit, and keeping
  -- request metadata would go past that promise.
  name        text not null,
  email       text not null,
  instagram   text not null,
  message     text not null,

  -- ⚠️ Widen this CHECK whenever you add a status. A value the constraint
  -- does not know is rejected at insert time, which is the point: a typo'd
  -- status would otherwise become a silent new bucket that never matches.
  status      text not null default 'new'
              check (status in ('new', 'audit_sent', 'dm_sent', 'call_booked', 'client', 'declined')),

  -- Your own working notes. Nothing in the app writes this.
  notes       text
);

-- Newest first is the only way this table is ever read.
create index if not exists audit_requests_created_at_idx
  on public.audit_requests (created_at desc);

-- Find every request from one person across submissions.
create index if not exists audit_requests_instagram_idx
  on public.audit_requests (lower(instagram));

-- ⚠️ RLS ON, with NO POLICIES. That combination is DENY-ALL, and it is
-- correct here rather than an oversight: the anon key is public — it ships in
-- any browser that ever touches your project — and this table holds strangers'
-- names, email addresses and what they told you about their business.
--
-- The service-role key used by the contact route bypasses RLS entirely, so
-- inserts still work. You read the table through the Supabase dashboard,
-- which also uses a privileged connection.
--
-- Do NOT add a policy "so I can read it from the browser". If you ever build a
-- logged-in admin view, gate it on an authenticated role explicitly.
alter table public.audit_requests enable row level security;
