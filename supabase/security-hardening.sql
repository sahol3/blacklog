-- ============================================
-- CRITICAL SECURITY FIX
-- Run this IMMEDIATELY in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. FIX USERS TABLE - Only allow viewing own profile
--    For leaderboard/grid, use a limited view
-- ============================================

DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON users;

-- Users can only view their own full profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

-- ============================================
-- 2. CREATE A PUBLIC PROFILES VIEW (Read-Only)
--    This exposes ONLY safe columns for leaderboard/grid
-- ============================================

DROP VIEW IF EXISTS public_profiles;

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

-- Grant access to the view
GRANT SELECT ON public_profiles TO authenticated;

-- ============================================
-- 3. FIX DAILY_LOGS - Ensure private logs stay private
-- ============================================

-- Current policy allows public logs OR own logs - this is correct
-- But verify it's working:
DROP POLICY IF EXISTS "Users can view public logs or own logs" ON daily_logs;

CREATE POLICY "View public logs or own logs" ON daily_logs
  FOR SELECT 
  TO authenticated
  USING (is_public = TRUE OR auth.uid() = user_id);

-- ============================================
-- 4. FIX WEEKLY_REVIEWS - Only owner can view
-- ============================================

DROP POLICY IF EXISTS "Users can view own reviews" ON weekly_reviews;

CREATE POLICY "Users can view own reviews" ON weekly_reviews
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 5. FIX RESPECT_REACTIONS
-- ============================================

DROP POLICY IF EXISTS "Anyone can view respect counts" ON respect_reactions;
DROP POLICY IF EXISTS "Authenticated users can view respect" ON respect_reactions;

CREATE POLICY "View respect on public logs" ON respect_reactions
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_logs 
      WHERE daily_logs.id = respect_reactions.log_id 
      AND (daily_logs.is_public = TRUE OR daily_logs.user_id = auth.uid())
    )
  );

-- ============================================
-- VERIFY RLS IS ENABLED ON ALL TABLES
-- ============================================

SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'daily_logs', 'weekly_reviews', 'respect_reactions');

-- All should show 't' (true) for rowsecurity
