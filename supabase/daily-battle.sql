-- Daily battle XP for friends/groups (run in Supabase SQL Editor)

CREATE OR REPLACE FUNCTION get_daily_battle_xp(p_user_ids UUID[])
RETURNS TABLE(user_id UUID, xp_today INTEGER)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id AS user_id,
    COALESCE(SUM(t.amount), 0)::INTEGER AS xp_today
  FROM unnest(p_user_ids) AS u(id)
  LEFT JOIN xp_transactions t
    ON t.user_id = u.id
   AND (t.created_at AT TIME ZONE 'UTC')::date = (NOW() AT TIME ZONE 'UTC')::date
  GROUP BY u.id;
$$;

GRANT EXECUTE ON FUNCTION get_daily_battle_xp(UUID[]) TO authenticated;
