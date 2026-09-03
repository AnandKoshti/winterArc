-- In-app notifications: friend request / accept triggers + helper.
-- Safe to re-run.

-- Allow users to insert their own reminders (streak / battle)
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION notify_user(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_user_id IS NULL OR p_title IS NULL OR p_message IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO notifications (user_id, type, title, message, read)
  VALUES (p_user_id, COALESCE(p_type, 'goal'), p_title, p_message, FALSE)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION notify_user(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- Friend request → notify addressee; accept → notify requester
CREATE OR REPLACE FUNCTION friendship_notify()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_requester_name TEXT;
  v_addressee_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    SELECT name INTO v_requester_name FROM profiles WHERE id = NEW.requester_id;
    PERFORM notify_user(
      NEW.addressee_id,
      'friend',
      'Friend Request',
      COALESCE(v_requester_name, 'Someone') || ' sent you a friend request.'
    );
  ELSIF TG_OP = 'UPDATE'
    AND NEW.status = 'accepted'
    AND COALESCE(OLD.status, '') = 'pending'
  THEN
    SELECT name INTO v_addressee_name FROM profiles WHERE id = NEW.addressee_id;
    PERFORM notify_user(
      NEW.requester_id,
      'friend',
      'Friend Request Accepted',
      COALESCE(v_addressee_name, 'Someone') || ' accepted your friend request.'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS friendships_notify ON friendships;
CREATE TRIGGER friendships_notify
  AFTER INSERT OR UPDATE OF status ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION friendship_notify();
