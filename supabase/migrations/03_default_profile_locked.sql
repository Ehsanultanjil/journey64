-- Migration 03: Make profile locked by default
ALTER TABLE public.user_profiles 
ALTER COLUMN is_locked SET DEFAULT true;

UPDATE public.user_profiles 
SET is_locked = true 
WHERE is_locked IS NULL;
