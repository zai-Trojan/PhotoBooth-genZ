create extension if not exists pgcrypto;

create type public.room_status as enum (
  'WAITING', 'READY', 'COUNTDOWN', 'CAPTURING', 'PROCESSING', 'FINISHED', 'EXPIRED'
);
create type public.participant_role as enum ('HOST', 'GUEST');
create type public.participant_status as enum ('JOINED', 'READY', 'DISCONNECTED');
create type public.session_status as enum ('CREATED', 'CAPTURING', 'PROCESSING', 'FINISHED', 'FAILED');
create type public.photo_kind as enum ('CAPTURE', 'COMPOSITE');

create table public.frames (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null default 'basic',
  config jsonb not null default '{}'::jsonb,
  active boolean not null default true
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9-]{4,20}$'),
  host_id uuid not null references auth.users(id) on delete cascade,
  max_participants smallint not null default 2 check (max_participants between 2 and 6),
  status public.room_status not null default 'WAITING',
  frame_id uuid references public.frames(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 minutes')
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  role public.participant_role not null,
  status public.participant_status not null default 'JOINED',
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (room_id, user_id)
);

create unique index one_host_per_room on public.participants(room_id) where role = 'HOST';

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  status public.session_status not null default 'CREATED',
  capture_count smallint not null default 4 check (capture_count between 1 and 8),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete set null,
  sequence smallint not null check (sequence between 1 and 8),
  object_path text not null unique,
  kind public.photo_kind not null default 'CAPTURE',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create index rooms_code_active_idx on public.rooms(code) where status <> 'EXPIRED';
create index participants_room_idx on public.participants(room_id);
create index sessions_room_idx on public.sessions(room_id);
create index photos_session_idx on public.photos(session_id);
create index photos_expiry_idx on public.photos(expires_at);

insert into public.frames (slug, name, category, config) values
  ('pink', 'Blush', 'basic', '{"background":"#edabb0"}'),
  ('black', 'Classic', 'basic', '{"background":"#292724"}'),
  ('cream', 'Vanilla', 'basic', '{"background":"#e9ddc8"}'),
  ('sage', 'Sage', 'basic', '{"background":"#aebc98"}'),
  ('blue', 'Cloud', 'basic', '{"background":"#aabecd"}'),
  ('toystory', 'Toy Story Inspired', 'character', '{"background":"#39a8df","accent":"#f1d13d"}'),
  ('avengers', 'Hero Team Inspired', 'character', '{"background":"#152f55","accent":"#cf2c3a"}'),
  ('spiderman', 'Spider Hero Inspired', 'character', '{"background":"#c8212c","accent":"#1262a3"}');

alter table public.frames enable row level security;
alter table public.rooms enable row level security;
alter table public.participants enable row level security;
alter table public.sessions enable row level security;
alter table public.photos enable row level security;

create or replace function public.is_room_member(target_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.participants
    where room_id = target_room_id and user_id = (select auth.uid())
  );
$$;

create or replace function public.is_room_host(target_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.rooms
    where id = target_room_id and host_id = (select auth.uid())
  );
$$;

grant execute on function public.is_room_member(uuid) to authenticated;
grant execute on function public.is_room_host(uuid) to authenticated;

create policy "active frames are public"
on public.frames for select to anon, authenticated using (active);

create policy "users create their own room"
on public.rooms for insert to authenticated with check (host_id = (select auth.uid()));
create policy "members read their room"
on public.rooms for select to authenticated using (
  host_id = (select auth.uid()) or public.is_room_member(id)
);
create policy "host updates room"
on public.rooms for update to authenticated using (host_id = (select auth.uid()))
with check (host_id = (select auth.uid()));

create policy "members read participants"
on public.participants for select to authenticated using (
  user_id = (select auth.uid()) or public.is_room_member(room_id) or public.is_room_host(room_id)
);
create policy "user joins room as self"
on public.participants for insert to authenticated with check (
  user_id = (select auth.uid()) and role = 'GUEST'
);
create policy "host registers self"
on public.participants for insert to authenticated with check (
  user_id = (select auth.uid()) and role = 'HOST' and public.is_room_host(room_id)
);
create policy "participant updates self"
on public.participants for update to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "members read sessions"
on public.sessions for select to authenticated using (public.is_room_member(room_id) or public.is_room_host(room_id));
create policy "host creates sessions"
on public.sessions for insert to authenticated with check (public.is_room_host(room_id));
create policy "host updates sessions"
on public.sessions for update to authenticated using (public.is_room_host(room_id));

create policy "members read photos"
on public.photos for select to authenticated using (
  exists (
    select 1 from public.sessions s
    where s.id = session_id and (public.is_room_member(s.room_id) or public.is_room_host(s.room_id))
  )
);
create policy "participants register captures"
on public.photos for insert to authenticated with check (
  exists (
    select 1 from public.sessions s
    where s.id = session_id and (public.is_room_member(s.room_id) or public.is_room_host(s.room_id))
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('booth-photos', 'booth-photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Object paths must begin with the room UUID: roomId/sessionId/filename.webp
create policy "room members upload booth photos"
on storage.objects for insert to authenticated with check (
  bucket_id = 'booth-photos'
  and public.is_room_member(((storage.foldername(name))[1])::uuid)
);
create policy "room host uploads booth photos"
on storage.objects for insert to authenticated with check (
  bucket_id = 'booth-photos'
  and public.is_room_host(((storage.foldername(name))[1])::uuid)
);
create policy "room members read booth photos"
on storage.objects for select to authenticated using (
  bucket_id = 'booth-photos'
  and (
    public.is_room_member(((storage.foldername(name))[1])::uuid)
    or public.is_room_host(((storage.foldername(name))[1])::uuid)
  )
);

-- Presence handles online/ready state; these tables broadcast durable changes.
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.participants;
alter publication supabase_realtime add table public.sessions;

create or replace function public.expire_old_rooms()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare affected integer;
begin
  update public.rooms set status = 'EXPIRED'
  where expires_at < now() and status <> 'EXPIRED';
  get diagnostics affected = row_count;
  return affected;
end;
$$;

-- Schedule expire_old_rooms() with Supabase Cron. Delete Storage objects through
-- the Storage API/Edge Function before deleting expired photo metadata.
