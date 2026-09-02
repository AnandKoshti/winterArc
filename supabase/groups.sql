-- Friend groups + group leaderboard support
-- Run in Supabase SQL Editor after schema.sql

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON groups(invite_code);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Helper: is current user a member of a group?
CREATE OR REPLACE FUNCTION is_group_member(p_group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id AND user_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS "Members can view groups" ON groups;
CREATE POLICY "Members can view groups" ON groups
  FOR SELECT USING (is_group_member(id) OR creator_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated can create groups" ON groups;
CREATE POLICY "Authenticated can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Owner can update groups" ON groups;
CREATE POLICY "Owner can update groups" ON groups
  FOR UPDATE USING (creator_id = auth.uid());

DROP POLICY IF EXISTS "Owner can delete groups" ON groups;
CREATE POLICY "Owner can delete groups" ON groups
  FOR DELETE USING (creator_id = auth.uid());

-- Allow lookup by invite code so users can join
DROP POLICY IF EXISTS "Anyone authenticated can find group by invite" ON groups;
CREATE POLICY "Anyone authenticated can find group by invite" ON groups
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Members can view group members" ON group_members;
CREATE POLICY "Members can view group members" ON group_members
  FOR SELECT USING (is_group_member(group_id));

DROP POLICY IF EXISTS "Users can join groups" ON group_members;
CREATE POLICY "Users can join groups" ON group_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = group_id AND g.creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can leave or owner can remove" ON group_members;
CREATE POLICY "Members can leave or owner can remove" ON group_members
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = group_id AND g.creator_id = auth.uid()
    )
  );
