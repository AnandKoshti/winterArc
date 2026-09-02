-- Run this in Supabase SQL Editor if onboarding keeps redirecting back

-- 1. Ensure the column exists (for projects created before it was added)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

-- 2. Allow users to update their own profile (required to set onboarding_complete)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. If you already finished onboarding in the app but got stuck, mark yourself complete:
-- UPDATE profiles SET onboarding_complete = true WHERE id = auth.uid();
