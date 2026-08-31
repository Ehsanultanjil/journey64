-- ==============================================================================
-- JOURNEY64 SUPABASE DATABASE SCHEMA
-- Execute this SQL script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gdqcjcogpymuwfivoeok/sql
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY DEFAULT 'default_user',
  name TEXT NOT NULL DEFAULT 'Ehsanul Tanjil',
  display_name TEXT NOT NULL DEFAULT 'Ehsanul Tanjil',
  bio TEXT DEFAULT 'Explorer of Bangladesh — one district at a time.',
  avatar_url TEXT,
  joined_date TEXT DEFAULT '2023-01-01',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. District User Data (Visited, Wishlist, Notes, Ratings)
CREATE TABLE IF NOT EXISTS public.district_user_data (
  id TEXT PRIMARY KEY, -- usually 'district_id' or 'user_id:district_id'
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
  id TEXT PRIMARY KEY DEFAULT 'default_settings',
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
  name TEXT NOT NULL DEFAULT 'Auto Backup',
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
-- ==============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_backups ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access with the anon key
CREATE POLICY "Allow all read user_profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow all insert user_profiles" ON public.user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update user_profiles" ON public.user_profiles FOR UPDATE USING (true);
CREATE POLICY "Allow all delete user_profiles" ON public.user_profiles FOR DELETE USING (true);

CREATE POLICY "Allow all read district_user_data" ON public.district_user_data FOR SELECT USING (true);
CREATE POLICY "Allow all insert district_user_data" ON public.district_user_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update district_user_data" ON public.district_user_data FOR UPDATE USING (true);
CREATE POLICY "Allow all delete district_user_data" ON public.district_user_data FOR DELETE USING (true);

CREATE POLICY "Allow all read visits" ON public.visits FOR SELECT USING (true);
CREATE POLICY "Allow all insert visits" ON public.visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update visits" ON public.visits FOR UPDATE USING (true);
CREATE POLICY "Allow all delete visits" ON public.visits FOR DELETE USING (true);

CREATE POLICY "Allow all read trips" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Allow all insert trips" ON public.trips FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update trips" ON public.trips FOR UPDATE USING (true);
CREATE POLICY "Allow all delete trips" ON public.trips FOR DELETE USING (true);

CREATE POLICY "Allow all read app_settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Allow all insert app_settings" ON public.app_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update app_settings" ON public.app_settings FOR UPDATE USING (true);
CREATE POLICY "Allow all delete app_settings" ON public.app_settings FOR DELETE USING (true);

CREATE POLICY "Allow all read journey_backups" ON public.journey_backups FOR SELECT USING (true);
CREATE POLICY "Allow all insert journey_backups" ON public.journey_backups FOR INSERT WITH CHECK (true);
