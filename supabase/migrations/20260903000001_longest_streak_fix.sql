-- Fix longest_streak: overwrite inflated per-goal counts with consecutive day runs.

CREATE OR REPLACE FUNCTION compute_best_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dates DATE[];
  v_best INTEGER := 0;
  v_current INTEGER := 0;
  i INTEGER;
BEGIN
  SELECT ARRAY_AGG(d ORDER BY d ASC)
  INTO v_dates
  FROM (
    SELECT DISTINCT completed_date AS d
    FROM goal_completions
    WHERE user_id = p_user_id
  ) s;

  IF v_dates IS NULL OR COALESCE(array_length(v_dates, 1), 0) = 0 THEN
    RETURN 0;
  END IF;

  v_best := 1;
  v_current := 1;
  FOR i IN 2..array_length(v_dates, 1) LOOP
    IF v_dates[i] = (v_dates[i - 1] + 1) THEN
      v_current := v_current + 1;
      IF v_current > v_best THEN
        v_best := v_current;
      END IF;
    ELSE
      v_current := 1;
    END IF;
  END LOOP;

  RETURN v_best;
END;
$$;

UPDATE profiles p
SET
  streak = compute_day_streak(p.id),
  longest_streak = GREATEST(compute_day_streak(p.id), compute_best_streak(p.id));

GRANT EXECUTE ON FUNCTION compute_best_streak(UUID) TO authenticated;
