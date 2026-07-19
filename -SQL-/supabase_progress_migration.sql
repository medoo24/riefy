-- ═══════════════════════════════════════════════════════════
--  User Progress, Streaks & Gamification Database Schema
--  Run in Supabase SQL Editor → New Query → Run without RLS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  xp FLOAT DEFAULT 0.0 NOT NULL,
  streak_days INT DEFAULT 0 NOT NULL,
  last_study_date DATE,
  total_study_minutes INT DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Allow reading all user progress rows (to calculate leaderboard ranks)
DROP POLICY IF EXISTS "Allow public read access to progress" ON public.user_progress;
CREATE POLICY "Allow public read access to progress" 
  ON public.user_progress 
  FOR SELECT 
  TO public 
  USING (true);

-- Allow individual users to insert or update their own progress rows
DROP POLICY IF EXISTS "Allow users to insert their own progress" ON public.user_progress;
CREATE POLICY "Allow users to insert their own progress" 
  ON public.user_progress 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own progress" ON public.user_progress;
CREATE POLICY "Allow users to update their own progress" 
  ON public.user_progress 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create profile sync trigger to automatically create a progress row on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_progress (user_id, xp, streak_days, total_study_minutes)
  VALUES (new.id, 0.0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created_progress
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_progress();

-- Function to dynamically fetch a user's rank and total user count
CREATE OR REPLACE FUNCTION public.get_user_rank(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  user_xp FLOAT;
  user_rank INT;
  total_count INT;
BEGIN
  -- Get target user's XP
  SELECT xp INTO user_xp FROM public.user_progress WHERE user_id = target_user_id;
  
  -- If user has no progress record, default to 0 XP
  IF user_xp IS NULL THEN
    user_xp := 0.0;
  END IF;

  -- Count users with higher XP + 1
  SELECT COUNT(*) + 1 INTO user_rank 
  FROM public.user_progress 
  WHERE xp > user_xp;

  -- Count total users
  SELECT COUNT(*) INTO total_count 
  FROM public.user_progress;

  -- Return as JSON
  RETURN json_build_object(
    'rank', user_rank,
    'total_users', GREATEST(total_count, 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
