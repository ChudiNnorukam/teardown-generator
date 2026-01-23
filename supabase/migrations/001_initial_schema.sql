-- SaaS Teardown Generator - Initial Schema
-- Migration: 001
-- Created: 2026-01-21

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: teardowns
-- Stores teardown requests with status tracking
CREATE TABLE teardowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  target_url TEXT NOT NULL,
  target_domain TEXT GENERATED ALWAYS AS (
    regexp_replace(
      regexp_replace(target_url, '^https?://', ''),
      '/.*$', ''
    )
  ) STORED,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT teardowns_status_check
    CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Table: teardown_results
-- Stores analysis results for completed teardowns
CREATE TABLE teardown_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teardown_id UUID NOT NULL REFERENCES teardowns(id) ON DELETE CASCADE UNIQUE,
  tech_stack JSONB NOT NULL DEFAULT '[]'::jsonb,
  pricing_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo_audit JSONB NOT NULL DEFAULT '{}'::jsonb,
  clone_estimate JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_html_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: usage_tracking
-- Tracks daily usage for rate limiting
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  ip_hash TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  teardown_count INTEGER NOT NULL DEFAULT 0,
  plan TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,

  CONSTRAINT usage_tracking_plan_check
    CHECK (plan IN ('free', 'pro'))
);

-- Indexes for performance
CREATE INDEX idx_teardowns_user_id
  ON teardowns(user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX idx_teardowns_session_id
  ON teardowns(session_id)
  WHERE session_id IS NOT NULL;

CREATE INDEX idx_teardowns_target_domain
  ON teardowns(target_domain);

CREATE INDEX idx_teardowns_created_at
  ON teardowns(created_at DESC);

-- Partial unique indexes for usage_tracking (replaces inline unique constraints)
CREATE UNIQUE INDEX idx_usage_tracking_user_date_unique
  ON usage_tracking(user_id, date)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX idx_usage_tracking_ip_date_unique
  ON usage_tracking(ip_hash, date)
  WHERE user_id IS NULL;

CREATE INDEX idx_usage_tracking_ip_hash_date
  ON usage_tracking(ip_hash, date);

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at on teardowns
CREATE TRIGGER update_teardowns_updated_at
  BEFORE UPDATE ON teardowns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE teardowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE teardown_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies: teardowns
-- Users can see their own teardowns or those with matching session_id
CREATE POLICY "Users can view own teardowns"
  ON teardowns FOR SELECT
  USING (
    auth.uid() = user_id
    OR session_id = current_setting('app.session_id', true)
    OR (user_id IS NULL AND created_at > NOW() - INTERVAL '24 hours')
  );

-- Anyone can insert teardowns (rate limiting handled in app layer)
CREATE POLICY "Anyone can create teardowns"
  ON teardowns FOR INSERT
  WITH CHECK (true);

-- Users can only update their own teardowns
CREATE POLICY "Users can update own teardowns"
  ON teardowns FOR UPDATE
  USING (
    auth.uid() = user_id
    OR session_id = current_setting('app.session_id', true)
  );

-- Users can only delete their own teardowns
CREATE POLICY "Users can delete own teardowns"
  ON teardowns FOR DELETE
  USING (
    auth.uid() = user_id
    OR session_id = current_setting('app.session_id', true)
  );

-- RLS Policies: teardown_results
-- Inherits access from parent teardown
CREATE POLICY "Users can view results for accessible teardowns"
  ON teardown_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teardowns
      WHERE teardowns.id = teardown_results.teardown_id
      AND (
        teardowns.user_id = auth.uid()
        OR teardowns.session_id = current_setting('app.session_id', true)
        OR (teardowns.user_id IS NULL AND teardowns.created_at > NOW() - INTERVAL '24 hours')
      )
    )
  );

-- Service role can insert/update results
CREATE POLICY "Service role can manage results"
  ON teardown_results FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies: usage_tracking
-- Users can only see their own usage
CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  USING (
    auth.uid() = user_id
    OR session_id = current_setting('app.session_id', true)
  );

-- Service role only for insert/update (enforced in app layer)
CREATE POLICY "Service role can manage usage"
  ON usage_tracking FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
