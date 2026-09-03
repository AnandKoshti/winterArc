-- Undo today's goal completion

CREATE OR REPLACE FUNCTION uncomplete_goal(p_goal_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_goal goals%ROWTYPE;
  v_profile profiles%ROWTYPE;
  v_completion goal_completions%ROWTYPE;
  v_today DATE := (NOW() AT TIME ZONE 'UTC')::date;
  v_new_xp INTEGER;
  v_new_coins INTEGER;
  v_new_level INTEGER;
  v_new_streak INTEGER;
  v_best_streak INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_goal_id IS NULL THEN
    RAISE EXCEPTION 'Goal id is required';
  END IF;

  SELECT * INTO v_goal
  FROM goals
  WHERE id = p_goal_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Goal not found';
  END IF;

  SELECT * INTO v_completion
  FROM goal_completions
  WHERE goal_id = p_goal_id
    AND user_id = v_user_id
    AND completed_date >= (v_today - 1)
  ORDER BY completed_at DESC
  LIMIT 1;

  IF v_completion.id IS NULL THEN
    RAISE EXCEPTION 'No completion to undo for this goal today';
  END IF;

  SELECT * INTO v_profile FROM profiles WHERE id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  DELETE FROM goal_completions WHERE id = v_completion.id;

  UPDATE goals
  SET streak = GREATEST(0, streak - 1)
  WHERE id = p_goal_id;

  v_new_xp := GREATEST(0, v_profile.xp - COALESCE(v_completion.xp_earned, 0));
  v_new_coins := GREATEST(0, v_profile.coins - COALESCE(v_completion.coins_earned, 0));
  v_new_level := get_level_from_xp(v_new_xp);
  v_new_streak := compute_day_streak(v_user_id);
  v_best_streak := GREATEST(compute_best_streak(v_user_id), v_new_streak);

  UPDATE profiles SET
    xp = v_new_xp,
    coins = v_new_coins,
    level = v_new_level,
    title = get_title_for_level(v_new_level),
    streak = v_new_streak,
    longest_streak = GREATEST(COALESCE(v_profile.longest_streak, 0), v_best_streak)
  WHERE id = v_user_id;

  IF COALESCE(v_completion.xp_earned, 0) <> 0 THEN
    INSERT INTO xp_transactions (user_id, amount, reason)
    VALUES (v_user_id, -ABS(v_completion.xp_earned), v_goal.name || ' undone');
  END IF;

  IF COALESCE(v_completion.coins_earned, 0) <> 0 THEN
    INSERT INTO coin_transactions (user_id, amount, reason)
    VALUES (v_user_id, -ABS(v_completion.coins_earned), v_goal.name || ' undone');
  END IF;

  RETURN jsonb_build_object(
    'xpRemoved', COALESCE(v_completion.xp_earned, 0),
    'coinsRemoved', COALESCE(v_completion.coins_earned, 0),
    'newStreak', v_new_streak,
    'newXp', v_new_xp,
    'newCoins', v_new_coins,
    'newLevel', v_new_level
  );
END;
$$;

ALTER FUNCTION uncomplete_goal(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION uncomplete_goal(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION uncomplete_goal(UUID) TO service_role;
