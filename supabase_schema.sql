-- ==============================================================================
-- JOURNEY64 SUPABASE DATABASE SCHEMA (With Auth & User Multi-tenancy)
-- Execute this SQL script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gdqcjcogpymuwfivoeok/sql
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Explorer',
  display_name TEXT NOT NULL DEFAULT 'Explorer',
  bio TEXT DEFAULT 'Explorer of Bangladesh — one district at a time.',
  avatar_url TEXT,
  joined_date TEXT DEFAULT '2024-01-01',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. District User Data (Visited, Wishlist, Notes, Ratings)
CREATE TABLE IF NOT EXISTS public.district_user_data (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  district_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_visited', 'want_to_visit', 'visited')),
  rating INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  notes TEXT DEFAULT '',
  first_visited_date TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Travel Visits & District Memories
CREATE TABLE IF NOT EXISTS public.visits (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  district_id TEXT NOT NULL,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  story TEXT DEFAULT '',
  companions TEXT DEFAULT '',
  places_visited JSONB DEFAULT '[]'::jsonb,
  weather TEXT DEFAULT '',
  favorite_food TEXT DEFAULT '',
  photos JSONB DEFAULT '[]'::jsonb,
  rating INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Multi-district Trips & Expeditions
CREATE TABLE IF NOT EXISTS public.trips (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  district_ids JSONB DEFAULT '[]'::jsonb,
  cover_photo TEXT,
  highlight_color TEXT DEFAULT '#F27D26',
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('planned', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Application Settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system',
  show_district_labels BOOLEAN DEFAULT true,
  show_bengali_names BOOLEAN DEFAULT true,
  show_wishlist_on_map BOOLEAN DEFAULT true,
  division_highlight_mode BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Full Journey Backups & Sync Snapshots
CREATE TABLE IF NOT EXISTS public.journey_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Auto Backup',
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC/AUTH POLICIES
-- ==============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_backups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public & Auth user_profiles select" ON public.user_profiles;
DROP POLICY IF EXISTS "Public & Auth user_profiles insert" ON public.user_profiles;
DROP POLICY IF EXISTS "Public & Auth user_profiles update" ON public.user_profiles;
DROP POLICY IF EXISTS "Public & Auth user_profiles delete" ON public.user_profiles;

DROP POLICY IF EXISTS "Public & Auth district_user_data select" ON public.district_user_data;
DROP POLICY IF EXISTS "Public & Auth district_user_data insert" ON public.district_user_data;
DROP POLICY IF EXISTS "Public & Auth district_user_data update" ON public.district_user_data;
DROP POLICY IF EXISTS "Public & Auth district_user_data delete" ON public.district_user_data;

DROP POLICY IF EXISTS "Public & Auth visits select" ON public.visits;
DROP POLICY IF EXISTS "Public & Auth visits insert" ON public.visits;
DROP POLICY IF EXISTS "Public & Auth visits update" ON public.visits;
DROP POLICY IF EXISTS "Public & Auth visits delete" ON public.visits;

DROP POLICY IF EXISTS "Public & Auth trips select" ON public.trips;
DROP POLICY IF EXISTS "Public & Auth trips insert" ON public.trips;
DROP POLICY IF EXISTS "Public & Auth trips update" ON public.trips;
DROP POLICY IF EXISTS "Public & Auth trips delete" ON public.trips;

DROP POLICY IF EXISTS "Public & Auth app_settings select" ON public.app_settings;
DROP POLICY IF EXISTS "Public & Auth app_settings insert" ON public.app_settings;
DROP POLICY IF EXISTS "Public & Auth app_settings update" ON public.app_settings;
DROP POLICY IF EXISTS "Public & Auth app_settings delete" ON public.app_settings;

DROP POLICY IF EXISTS "Public & Auth journey_backups select" ON public.journey_backups;
DROP POLICY IF EXISTS "Public & Auth journey_backups insert" ON public.journey_backups;

-- Policies allowing authenticated users full access to their records + public anon fallback
CREATE POLICY "Public & Auth user_profiles select" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Public & Auth user_profiles insert" ON public.user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public & Auth user_profiles update" ON public.user_profiles FOR UPDATE USING (true);
CREATE POLICY "Public & Auth user_profiles delete" ON public.user_profiles FOR DELETE USING (true);

CREATE POLICY "Public & Auth district_user_data select" ON public.district_user_data FOR SELECT USING (true);
CREATE POLICY "Public & Auth district_user_data insert" ON public.district_user_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Public & Auth district_user_data update" ON public.district_user_data FOR UPDATE USING (true);
CREATE POLICY "Public & Auth district_user_data delete" ON public.district_user_data FOR DELETE USING (true);

CREATE POLICY "Public & Auth visits select" ON public.visits FOR SELECT USING (true);
CREATE POLICY "Public & Auth visits insert" ON public.visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Public & Auth visits update" ON public.visits FOR UPDATE USING (true);
CREATE POLICY "Public & Auth visits delete" ON public.visits FOR DELETE USING (true);

CREATE POLICY "Public & Auth trips select" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Public & Auth trips insert" ON public.trips FOR INSERT WITH CHECK (true);
CREATE POLICY "Public & Auth trips update" ON public.trips FOR UPDATE USING (true);
CREATE POLICY "Public & Auth trips delete" ON public.trips FOR DELETE USING (true);

CREATE POLICY "Public & Auth app_settings select" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Public & Auth app_settings insert" ON public.app_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public & Auth app_settings update" ON public.app_settings FOR UPDATE USING (true);
CREATE POLICY "Public & Auth app_settings delete" ON public.app_settings FOR DELETE USING (true);

CREATE POLICY "Public & Auth journey_backups select" ON public.journey_backups FOR SELECT USING (true);
CREATE POLICY "Public & Auth journey_backups insert" ON public.journey_backups FOR INSERT WITH CHECK (true);
