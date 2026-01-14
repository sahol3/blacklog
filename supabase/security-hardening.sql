-- ============================================
-- COMPLETE SECURITY FIX - Run in Supabase SQL Editor
-- This properly secures your data while allowing public features
-- ============================================

-- ============================================
-- 1. FIX USERS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Only allow viewing own full profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- ============================================
-- 2. CREATE PUBLIC PROFILES VIEW
-- ============================================

DROP VIEW IF EXISTS public_profiles CASCADE;

CREATE VIEW public_profiles AS
SELECT 
  id,
  username,
  avatar_url,
  domain,
  current_streak,
  total_xp,
  created_at
FROM users;

GRANT SELECT ON public_profiles TO authenticated;

-- ============================================
-- 3. FIX DAILY_LOGS - Allow public OR own
-- ============================================

DROP POLICY IF EXISTS "Users can view public logs or own logs" ON daily_logs;
DROP POLICY IF EXISTS "View public logs or own logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can view own logs only" ON daily_logs;

-- Restore: Users can see PUBLIC logs OR their OWN logs
CREATE POLICY "View public or own logs" ON daily_logs
  FOR SELECT TO authenticated
  USING (is_public = TRUE OR auth.uid() = user_id);

-- ============================================
-- 4. CREATE SAFE PUBLIC LOGS VIEW (hides sensitive fields)
-- Use this view for Grid feed instead of direct table access
-- ============================================

DROP VIEW IF EXISTS public_logs CASCADE;

CREATE VIEW public_logs AS
SELECT 
  dl.id,
  dl.user_id,
  dl.date,
  dl.is_public,
  dl.body_energy,
  dl.mind_focus,
  dl.skill_difficulty,
  dl.war_log,
  dl.image_url,
  dl.created_at,
  -- Exclude: money_value, money_currency, money_speed, body_unhealthy_flag
  -- Include user info
  u.username,
  u.avatar_url,
  u.domain
FROM daily_logs dl
JOIN users u ON dl.user_id = u.id
WHERE dl.is_public = TRUE;

GRANT SELECT ON public_logs TO authenticated;

-- ============================================
-- 5. FIX RESPECT REACTIONS
-- ============================================

DROP POLICY IF EXISTS "Anyone can view respect counts" ON respect_reactions;
DROP POLICY IF EXISTS "Authenticated users can view respect" ON respect_reactions;
DROP POLICY IF EXISTS "View respect on public logs" ON respect_reactions;

-- Allow viewing respect on logs user can access
CREATE POLICY "View respect reactions" ON respect_reactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_logs 
      WHERE daily_logs.id = respect_reactions.log_id 
      AND (daily_logs.is_public = TRUE OR daily_logs.user_id = auth.uid())
    )
  );

-- ============================================
-- VERIFY: Check that RLS is enabled
-- ============================================

SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'daily_logs', 'weekly_reviews', 'respect_reactions');

-- All should show 't' (true)
