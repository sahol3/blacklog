-- ============================================
-- BULLETPROOF SECURITY FIX
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: DELETE ALL EXISTING POLICIES
-- ============================================

-- Users table
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Daily logs table
DROP POLICY IF EXISTS "Users can view public logs or own logs" ON daily_logs;
DROP POLICY IF EXISTS "View public logs or own logs" ON daily_logs;  
DROP POLICY IF EXISTS "View public or own logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can view own logs only" ON daily_logs;
DROP POLICY IF EXISTS "Users can insert own logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can update own logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can delete own logs" ON daily_logs;

-- Weekly reviews
DROP POLICY IF EXISTS "Users can view own reviews" ON weekly_reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON weekly_reviews;

-- Respect reactions
DROP POLICY IF EXISTS "Anyone can view respect counts" ON respect_reactions;
DROP POLICY IF EXISTS "Authenticated users can view respect" ON respect_reactions;
DROP POLICY IF EXISTS "View respect reactions" ON respect_reactions;
DROP POLICY IF EXISTS "View respect on public logs" ON respect_reactions;
DROP POLICY IF EXISTS "Authenticated users can give respect" ON respect_reactions;
DROP POLICY IF EXISTS "Users can remove own respect" ON respect_reactions;

-- ============================================
-- STEP 2: ENSURE RLS IS ENABLED
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE respect_reactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: USERS TABLE - STRICT POLICIES
-- Only view your OWN full profile
-- ============================================

CREATE POLICY "select_own_user" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "update_own_user" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "insert_own_user" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 4: CREATE PUBLIC_PROFILES VIEW
-- This is the ONLY way to see other users' info
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
  -- NO email, NO goals_json, NO bio
FROM users;

GRANT SELECT ON public_profiles TO authenticated;
GRANT SELECT ON public_profiles TO anon;

-- ============================================
-- STEP 5: DAILY_LOGS - PUBLIC OR OWN ONLY
-- ============================================

CREATE POLICY "select_public_or_own_logs" ON daily_logs
  FOR SELECT TO authenticated
  USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "insert_own_logs" ON daily_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_logs" ON daily_logs
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "delete_own_logs" ON daily_logs
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 6: CREATE PUBLIC_LOGS VIEW
-- Hides money_value and sensitive fields
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
  -- NO money_value, money_currency, money_speed, body_unhealthy_flag
  u.username,
  u.avatar_url,
  u.domain
FROM daily_logs dl
JOIN users u ON dl.user_id = u.id
WHERE dl.is_public = TRUE;

GRANT SELECT ON public_logs TO authenticated;

-- ============================================
-- STEP 7: WEEKLY_REVIEWS - OWN ONLY
-- ============================================

CREATE POLICY "select_own_reviews" ON weekly_reviews
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "insert_own_reviews" ON weekly_reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STEP 8: RESPECT_REACTIONS
-- ============================================

CREATE POLICY "select_respect" ON respect_reactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_logs 
      WHERE daily_logs.id = respect_reactions.log_id 
      AND (daily_logs.is_public = TRUE OR daily_logs.user_id = auth.uid())
    )
  );

CREATE POLICY "insert_respect" ON respect_reactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_respect" ON respect_reactions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- VERIFY RLS IS ENABLED
-- ============================================

SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'daily_logs', 'weekly_reviews', 'respect_reactions');

-- ALL MUST SHOW 't' (true)!

-- ============================================
-- TEST: Try querying users table directly
-- Should ONLY return your own row
-- ============================================
-- Run this as a test after applying:
-- SELECT * FROM users;
-- You should ONLY see YOUR row, not others
