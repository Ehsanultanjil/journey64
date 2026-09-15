-- Migration 01: Add handle, profile lock, cover, and location to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS handle TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cover_url TEXT,
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'বাংলাদেশ';

CREATE INDEX IF NOT EXISTS idx_user_profiles_handle ON public.user_profiles (lower(handle));
