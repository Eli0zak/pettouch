CREATE OR REPLACE FUNCTION award_article_points(
  p_user_id UUID,
  p_article_id UUID,
  p_points INTEGER DEFAULT 10
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_date DATE := CURRENT_DATE;
  v_last_activity_date DATE;
  v_current_streak INTEGER;
BEGIN
  -- Start transaction
  BEGIN
    -- Check if already read with points
    IF EXISTS (
      SELECT 1 FROM public.user_read_articles 
      WHERE user_id = p_user_id 
      AND article_id = p_article_id 
      AND points_awarded > 0
    ) THEN
      RETURN FALSE;
    END IF;

    -- Get current streak info
    SELECT last_activity_date, current_streak 
    INTO v_last_activity_date, v_current_streak
    FROM public.user_streaks 
    WHERE user_id = p_user_id;

    -- Insert or update user_read_articles
    INSERT INTO public.user_read_articles (
      user_id,
      article_id,
      points_awarded,
      read_at
    ) VALUES (
      p_user_id,
      p_article_id,
      p_points,
      NOW()
    ) ON CONFLICT (user_id, article_id) 
    DO UPDATE SET 
      points_awarded = p_points,
      read_at = NOW();

    -- Record points transaction
    INSERT INTO public.user_points (
      user_id,
      points,
      transaction_type,
      description
    ) VALUES (
      p_user_id,
      p_points,
      'article_read',
      'Read article: ' || p_article_id::text
    );

    -- Update user's total points
    UPDATE public.users 
    SET total_points = total_points + p_points
    WHERE id = p_user_id;

    -- Update user streak
    IF v_last_activity_date IS NULL OR v_last_activity_date < v_current_date THEN
      INSERT INTO public.user_streaks (
        user_id,
        current_streak,
        last_activity_date,
        longest_streak
      ) VALUES (
        p_user_id,
        1,
        v_current_date,
        1
      ) ON CONFLICT (user_id) 
      DO UPDATE SET 
        current_streak = 
          CASE 
            WHEN user_streaks.last_activity_date = v_current_date - INTERVAL '1 day' 
            THEN user_streaks.current_streak + 1
            ELSE 1
          END,
        last_activity_date = v_current_date,
        longest_streak = 
          CASE 
            WHEN user_streaks.last_activity_date = v_current_date - INTERVAL '1 day' 
            THEN GREATEST(user_streaks.longest_streak, user_streaks.current_streak + 1)
            ELSE GREATEST(user_streaks.longest_streak, 1)
          END;
    END IF;

    RETURN TRUE;
  EXCEPTION 
    WHEN OTHERS THEN
      -- Rollback transaction on any error
      RAISE NOTICE 'Error in award_article_points: %', SQLERRM;
      RETURN FALSE;
  END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION award_article_points TO authenticated;
