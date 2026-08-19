-- ----------------------------------------------------
-- TogetherBooth Neon Schema Setup
-- Run this in your Neon SQL Editor.
-- ----------------------------------------------------

-- 1. Create Enums
CREATE TYPE room_status AS ENUM (
  'WAITING', 'READY', 'COUNTDOWN', 'CAPTURING', 'PROCESSING', 'FINISHED', 'EXPIRED'
);
CREATE TYPE participant_role AS ENUM ('HOST', 'GUEST');
CREATE TYPE participant_status AS ENUM ('JOINED', 'READY', 'DISCONNECTED');
CREATE TYPE session_status AS ENUM ('CREATED', 'CAPTURING', 'PROCESSING', 'FINISHED', 'FAILED');
CREATE TYPE photo_kind AS ENUM ('CAPTURE', 'COMPOSITE');

-- 2. Create Tables (without Supabase auth.users constraints)
CREATE TABLE public.frames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'basic',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (code ~ '^[A-Z0-9-]{4,20}$'),
  host_id uuid NOT NULL, -- Simplified: no foreign key to auth.users
  max_participants smallint NOT NULL DEFAULT 2 CHECK (max_participants BETWEEN 2 AND 6),
  status room_status NOT NULL DEFAULT 'WAITING',
  frame_id uuid REFERENCES public.frames(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes')
);

CREATE TABLE public.participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL, -- Simplified: no foreign key to auth.users
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
  role participant_role NOT NULL,
  status participant_status NOT NULL DEFAULT 'JOINED',
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, user_id)
);

CREATE UNIQUE INDEX one_host_per_room ON public.participants(room_id) WHERE role = 'HOST';

CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  status session_status NOT NULL DEFAULT 'CREATED',
  capture_count smallint NOT NULL DEFAULT 4 CHECK (capture_count BETWEEN 1 AND 8),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES public.participants(id) ON DELETE SET NULL,
  sequence smallint NOT NULL CHECK (sequence BETWEEN 1 AND 8),
  object_path text NOT NULL UNIQUE,
  kind photo_kind NOT NULL DEFAULT 'CAPTURE',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

-- 3. Create Indexes for optimization
CREATE INDEX rooms_code_active_idx ON public.rooms(code) WHERE status <> 'EXPIRED';
CREATE INDEX participants_room_idx ON public.participants(room_id);
CREATE INDEX sessions_room_idx ON public.sessions(room_id);
CREATE INDEX photos_session_idx ON public.photos(session_id);
CREATE INDEX photos_expiry_idx ON public.photos(expires_at);

-- 4. Seed initial frames
INSERT INTO public.frames (slug, name, category, config) VALUES
  ('pink', 'Blush', 'basic', '{"background":"#edabb0"}'),
  ('black', 'Classic', 'basic', '{"background":"#292724"}'),
  ('cream', 'Vanilla', 'basic', '{"background":"#e9ddc8"}'),
  ('sage', 'Sage', 'basic', '{"background":"#aebc98"}'),
  ('blue', 'Cloud', 'basic', '{"background":"#aabecd"}'),
  ('toystory', 'Toy Story Inspired', 'character', '{"background":"#39a8df","accent":"#f1d13d"}'),
  ('avengers', 'Hero Team Inspired', 'character', '{"background":"#152f55","accent":"#cf2c3a"}'),
  ('spiderman', 'Spider Hero Inspired', 'character', '{"background":"#c8212c","accent":"#1262a3"}');
