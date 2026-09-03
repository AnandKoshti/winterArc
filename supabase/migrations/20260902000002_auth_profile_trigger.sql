-- Run this in Supabase SQL Editor (fixes login/signup profile issues)

-- 1. Allow users to create and read profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
CREATE POLICY "Authenticated users can view profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

-- 2. Auto-create profile when a user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
BEGIN
  base_username := LOWER(COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1)
  ));
  base_username := REGEXP_REPLACE(base_username, '[^a-z0-9]', '', 'g');
  IF base_username = '' THEN base_username := 'user'; END IF;
  final_username := base_username || SUBSTR(REPLACE(NEW.id::TEXT, '-', ''), 1, 6);

  INSERT INTO public.profiles (id, name, username, onboarding_complete)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1), 'User'),
    final_username,
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill profiles for existing auth users missing a profile row
INSERT INTO public.profiles (id, name, username, onboarding_complete)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', SPLIT_PART(u.email, '@', 1), 'User'),
  LOWER(REGEXP_REPLACE(COALESCE(u.raw_user_meta_data->>'username', SPLIT_PART(u.email, '@', 1)), '[^a-z0-9]', '', 'g'))
    || SUBSTR(REPLACE(u.id::TEXT, '-', ''), 1, 6),
  FALSE
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
