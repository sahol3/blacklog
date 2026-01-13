-- ============================================
-- CLEAN SLATE (RESET)
-- WARNING: This will delete existing V2 tables involving these names
-- ============================================
DROP TABLE IF EXISTS respect_reactions CASCADE;
DROP TABLE IF EXISTS weekly_reviews CASCADE;
DROP TABLE IF EXISTS daily_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP FUNCTION IF EXISTS update_user_stats_on_log() CASCADE;
DROP FUNCTION IF EXISTS calculate_log_xp(daily_logs) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================
-- USERS TABLE (Enhanced)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  goals_json JSONB NOT NULL DEFAULT '{"main_quest": "", "financial_target": "", "the_enemy": ""}',
  current_streak INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  bio TEXT,
  domain TEXT CHECK (domain IN ('Dev', 'Designer', 'Agency', 'Student', 'Other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_total_xp ON users(total_xp DESC);
CREATE INDEX idx_users_domain ON users(domain);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- DAILY LOGS TABLE (Core - V2 Modified)
-- ============================================
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  
  -- Pillar 1: BODY
  body_unhealthy_flag BOOLEAN DEFAULT FALSE,
  body_energy INTEGER CHECK (body_energy BETWEEN 1 AND 5),
  
  -- Pillar 2: MIND
  mind_read_flag BOOLEAN DEFAULT FALSE,
  mind_focus INTEGER CHECK (mind_focus BETWEEN 1 AND 5),
  
  -- Pillar 3: FINANCIAL (V2 Pivot)
  money_value NUMERIC(12, 2) DEFAULT 0,
  money_currency TEXT DEFAULT 'BDT' CHECK (money_currency IN ('BDT', 'USD')),
  money_speed INTEGER CHECK (money_speed BETWEEN 1 AND 5),
  
  -- Pillar 4: SKILL
  skill_practice_flag BOOLEAN DEFAULT FALSE,
  skill_difficulty INTEGER CHECK (skill_difficulty BETWEEN 1 AND 5),
  
  -- The Soul
  war_log TEXT CHECK (char_length(war_log) <= 5000),
  image_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Indexes for high-performance queries
CREATE INDEX idx_daily_logs_user_id ON daily_logs(user_id);
CREATE INDEX idx_daily_logs_date ON daily_logs(date DESC);
CREATE INDEX idx_daily_logs_public_feed ON daily_logs(is_public, created_at DESC) 
  WHERE is_public = TRUE;
CREATE INDEX idx_daily_logs_money_value ON daily_logs(money_value) 
  WHERE money_value > 0;

-- RLS Policies
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public logs or own logs" ON daily_logs
  FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can insert own logs" ON daily_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs" ON daily_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs" ON daily_logs
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- WEEKLY REVIEWS TABLE
-- ============================================
CREATE TABLE weekly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  ai_review TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, week_start)
);

CREATE INDEX idx_weekly_reviews_user_week ON weekly_reviews(user_id, week_start DESC);

ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reviews" ON weekly_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews" ON weekly_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- RESPECT REACTIONS TABLE (V2 Social Layer)
-- ============================================
CREATE TABLE respect_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(log_id, user_id)
);

CREATE INDEX idx_respect_log_id ON respect_reactions(log_id);

ALTER TABLE respect_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view respect counts" ON respect_reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can give respect" ON respect_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own respect" ON respect_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON daily_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate XP for a log
CREATE OR REPLACE FUNCTION calculate_log_xp(log_record daily_logs)
RETURNS INTEGER AS $$
DECLARE
  xp INTEGER := 10; -- Base XP for logging
  scale_bonus INTEGER;
BEGIN
  -- Pillar bonuses
  IF log_record.mind_read_flag THEN
    xp := xp + 5;
  END IF;
  
  IF log_record.skill_practice_flag THEN
    xp := xp + 5;
  END IF;
  
  -- Financial XP
  IF log_record.money_value > 0 THEN
    xp := xp + 20; -- Flat bonus
    
    -- Scale bonus based on amount (cap at +30 extra)
    scale_bonus := LEAST(FLOOR(LOG(log_record.money_value) * 5), 30);
    xp := xp + scale_bonus;
  END IF;
  
  -- Speed multiplier
  IF log_record.money_speed >= 4 THEN
    xp := xp + 10;
  END IF;
  
  -- Difficulty multiplier
  IF log_record.skill_difficulty >= 4 THEN
    xp := xp + 5;
  END IF;
  
  -- Penalties
  IF log_record.body_unhealthy_flag THEN
    xp := xp - 10;
  END IF;
  
  RETURN GREATEST(xp, 0); -- Minimum 0 XP
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update user XP and streak
CREATE OR REPLACE FUNCTION update_user_stats_on_log()
RETURNS TRIGGER AS $$
DECLARE
  calculated_xp INTEGER;
  previous_log_date DATE;
  new_streak INTEGER;
BEGIN
  -- Calculate XP for this log
  calculated_xp := calculate_log_xp(NEW);
  
  -- Get the most recent log before this one
  SELECT date INTO previous_log_date
  FROM daily_logs
  WHERE user_id = NEW.user_id AND date < NEW.date
  ORDER BY date DESC
  LIMIT 1;
  
  -- Calculate streak
  IF previous_log_date IS NULL THEN
    new_streak := 1;
  ELSIF NEW.date - previous_log_date = 1 THEN
    SELECT current_streak + 1 INTO new_streak FROM users WHERE id = NEW.user_id;
  ELSIF NEW.date = previous_log_date + INTERVAL '1 day' THEN
    SELECT current_streak + 1 INTO new_streak FROM users WHERE id = NEW.user_id;
  ELSE
    new_streak := 1; -- Streak broken
  END IF;
  
  -- Update user stats
  UPDATE users
  SET 
    total_xp = total_xp + calculated_xp,
    current_streak = new_streak,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_after_log
  AFTER INSERT OR UPDATE ON daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_log();
