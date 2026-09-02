-- Fix day streak: was incrementing on every goal completion.
-- Run this in Supabase SQL Editor (safe to re-run).

CREATE OR REPLACE FUNCTION compute_day_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := (NOW() AT TIME ZONE 'UTC')::date;
  v_dates DATE[];
  v_streak INTEGER := 0;
  v_cursor DATE;
  i INTEGER;
BEGIN
  SELECT ARRAY_AGG(d ORDER BY d DESC)
  INTO v_dates
  FROM (
    SELECT DISTINCT completed_date AS d
    FROM goal_completions
    WHERE user_id = p_user_id
  ) s;

  IF v_dates IS NULL OR COALESCE(array_length(v_dates, 1), 0) = 0 THEN
    RETURN 0;
  END IF;

  IF v_dates[1] < (v_today - 1) THEN
    RETURN 0;
  END IF;

  v_streak := 1;
  v_cursor := v_dates[1];
  FOR i IN 2..array_length(v_dates, 1) LOOP
    IF v_dates[i] = (v_cursor - 1) THEN
      v_streak := v_streak + 1;
      v_cursor := v_dates[i];
    ELSE
      EXIT;
    END IF;
  END LOOP;

  RETURN v_streak;
END;
$$;

-- Repair inflated streaks now
UPDATE profiles p
SET
  streak = compute_day_streak(p.id),
  longest_streak = GREATEST(p.longest_streak, compute_day_streak(p.id));

-- Re-apply complete_goal with correct day-streak logic
-- (full function body matches supabase/rpc.sql)
CREATE OR REPLACE FUNCTION complete_goal(p_goal_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_goal goals%ROWTYPE;
  v_profile profiles%ROWTYPE;
  v_multiplier NUMERIC;
  v_xp_boost NUMERIC := 1;
  v_xp INTEGER;
  v_coins INTEGER;
  v_total_xp INTEGER;
  v_total_coins INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_old_level INTEGER;
  v_leveled_up BOOLEAN := FALSE;
  v_perfect_day BOOLEAN := FALSE;
  v_active_goals INTEGER;
  v_completed_today INTEGER;
  v_bonus_xp INTEGER := 0;
  v_bonus_coins INTEGER := 0;
  v_level_bonus_xp INTEGER := 0;
  v_level_bonus_coins INTEGER := 0;
  v_new_streak INTEGER;
  v_streak_updated BOOLEAN := FALSE;
  v_already_today INTEGER;
  v_today DATE := (NOW() AT TIME ZONE 'UTC')::date;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO v_goal FROM goals WHERE id = p_goal_id AND user_id = v_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Goal not found'; END IF;
  IF v_goal.is_paused THEN RAISE EXCEPTION 'Goal is paused'; END IF;

  IF EXISTS (
    SELECT 1 FROM goal_completions
    WHERE goal_id = p_goal_id AND user_id = v_user_id
      AND completed_date = v_today
  ) THEN
    RAISE EXCEPTION 'Goal already completed today';
  END IF;

  SELECT * INTO v_profile FROM profiles WHERE id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;

  IF v_profile.xp_boost_until IS NOT NULL AND v_profile.xp_boost_until > NOW() THEN
    v_xp_boost := 2;
  END IF;

  v_multiplier := get_streak_multiplier(v_profile.streak);
  v_xp := ROUND(v_goal.xp_reward * v_multiplier * v_xp_boost);
  v_coins := v_goal.coin_reward;

  SELECT COUNT(*) INTO v_active_goals FROM goals WHERE user_id = v_user_id AND is_paused = FALSE;
  SELECT COUNT(*) INTO v_completed_today FROM goal_completions
    WHERE user_id = v_user_id AND completed_date = v_today;
  v_already_today := v_completed_today;
  v_completed_today := v_completed_today + 1;
  IF v_completed_today >= v_active_goals THEN
    v_perfect_day := TRUE;
    v_bonus_xp := 100;
    v_bonus_coins := 50;
  END IF;

  v_total_xp := v_xp + v_bonus_xp;
  v_total_coins := v_coins + v_bonus_coins;
  v_old_level := v_profile.level;
  v_new_xp := v_profile.xp + v_total_xp;
  v_new_level := get_level_from_xp(v_new_xp);

  IF v_new_level > v_old_level THEN
    v_leveled_up := TRUE;
    v_level_bonus_xp := 250;
    v_level_bonus_coins := 100;
    v_new_xp := v_new_xp + v_level_bonus_xp;
    v_new_level := get_level_from_xp(v_new_xp);
  END IF;

  INSERT INTO goal_completions (goal_id, user_id, xp_earned, coins_earned, multiplier)
  VALUES (p_goal_id, v_user_id, v_total_xp + v_level_bonus_xp, v_total_coins + v_level_bonus_coins, v_multiplier);

  UPDATE goals SET streak = streak + 1 WHERE id = p_goal_id;

  v_new_streak := compute_day_streak(v_user_id);
  v_streak_updated := (v_already_today = 0);

  UPDATE profiles SET
    xp = v_new_xp,
    coins = v_profile.coins + v_total_coins + v_level_bonus_coins,
    level = v_new_level,
    title = get_title_for_level(v_new_level),
    streak = v_new_streak,
    longest_streak = GREATEST(v_profile.longest_streak, v_new_streak)
  WHERE id = v_user_id;

  INSERT INTO xp_transactions (user_id, amount, reason)
  VALUES (v_user_id, v_total_xp + v_level_bonus_xp, v_goal.name || ' completed');

  INSERT INTO coin_transactions (user_id, amount, reason)
  VALUES (v_user_id, v_total_coins + v_level_bonus_coins, v_goal.name || ' completed');

  RETURN jsonb_build_object(
    'xpEarned', v_total_xp + v_level_bonus_xp,
    'coinsEarned', v_total_coins + v_level_bonus_coins,
    'multiplier', v_multiplier,
    'leveledUp', v_leveled_up,
    'levelUpInfo', CASE WHEN v_leveled_up THEN jsonb_build_object(
      'newLevel', v_new_level,
      'newTitle', get_title_for_level(v_new_level),
      'bonusXp', 250,
      'bonusCoins', 100
    ) ELSE NULL END,
    'perfectDay', v_perfect_day,
    'streakUpdated', v_streak_updated,
    'newStreak', v_new_streak,
    'newBadges', '[]'::jsonb
  );
END;
$$;

GRANT EXECUTE ON FUNCTION complete_goal(UUID) TO authenticated;
