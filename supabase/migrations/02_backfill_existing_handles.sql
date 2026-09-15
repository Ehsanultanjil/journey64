-- Migration 02: Backfill handles for existing users whose handle is currently NULL
UPDATE public.user_profiles
SET handle = lower(regexp_replace(display_name, '[^a-zA-Z0-9_]', '', 'g'))
WHERE handle IS NULL AND display_name IS NOT NULL;

UPDATE public.user_profiles
SET handle = lower(regexp_replace(name, '[^a-zA-Z0-9_]', '', 'g'))
WHERE handle IS NULL AND name IS NOT NULL;
