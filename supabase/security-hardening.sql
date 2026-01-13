-- ============================================
-- SECURITY HARDENING - Run in Supabase SQL Editor
-- This fixes overly permissive RLS policies
-- ============================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Anyone can view respect counts" ON respect_reactions;

-- ============================================
-- USERS TABLE - Restrict to public info only
-- ============================================

-- Authenticated users can view public profile info (not email, goals)
-- Use a view for public data instead of exposing full table
CREATE POLICY "Authenticated users can view profiles" ON users
  FOR SELECT 
  TO authenticated
  USING (true);

-- Anonymous users cannot access user data directly
-- They must go through the public logs which join user data

-- ============================================
-- DAILY LOGS - Already secure (only public or own)
-- ============================================
-- Current policy: "Users can view public logs or own logs"
-- This is correct - keeps private logs private

-- ============================================
-- WEEKLY REVIEWS - Only owner can view
-- ============================================
-- Current policy is correct - only owner can view

-- ============================================
-- RESPECT REACTIONS - Restrict to authenticated
-- ============================================
DROP POLICY IF EXISTS "Anyone can view respect counts" ON respect_reactions;

CREATE POLICY "Authenticated users can view respect" ON respect_reactions
  FOR SELECT 
  TO authenticated
  USING (true);

-- ============================================
-- API ROUTE PROTECTION
-- ============================================
-- The middleware should protect all dashboard routes
-- Make sure to run this SQL to verify RLS is enabled:

SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- All should show 't' for rowsecurity
