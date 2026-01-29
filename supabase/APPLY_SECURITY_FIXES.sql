-- SECURITY FIXES - Apply to Production Database
-- Created: 2026-01-28
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/kjypnepbcymxzzjgzmob/sql
--
-- CRITICAL: These fixes address:
-- 1. RLS data leakage (24h public access window)
-- 2. Webhook race conditions (duplicate processing)

-- ============================================================================
-- MIGRATION 003: Fix RLS Data Leakage
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own teardowns" ON teardowns;
DROP POLICY IF EXISTS "Users can view results for accessible teardowns" ON teardown_results;

-- Recreate teardowns SELECT policy WITHOUT 24h public access
CREATE POLICY "Users can view own teardowns"
  ON teardowns FOR SELECT
  USING (
    -- Authenticated users see their own teardowns
    auth.uid() = user_id
    -- Anonymous users see their own session's teardowns only
    OR session_id = current_setting('app.session_id', true)
    -- REMOVED: OR (user_id IS NULL AND created_at > NOW() - INTERVAL '24 hours')
    -- This was allowing ALL anonymous teardowns to be visible to ALL users for 24h
  );

-- Recreate teardown_results SELECT policy to match
CREATE POLICY "Users can view results for accessible teardowns"
  ON teardown_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teardowns
      WHERE teardowns.id = teardown_results.teardown_id
      AND (
        teardowns.user_id = auth.uid()
        OR teardowns.session_id = current_setting('app.session_id', true)
        -- REMOVED: 24h public access window
      )
    )
  );

-- Add comment explaining security decision
COMMENT ON POLICY "Users can view own teardowns" ON teardowns IS
  'Security: Anonymous users can only view their own session teardowns. No public 24h window to prevent URL leakage.';

-- ============================================================================
-- MIGRATION 004: Webhook Idempotency Tracking
-- ============================================================================

-- Table: webhook_events
-- Tracks processed Stripe webhook events for idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  CONSTRAINT webhook_events_stripe_event_id_unique UNIQUE(stripe_event_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id
  ON webhook_events(stripe_event_id);

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at
  ON webhook_events(processed_at DESC);

-- RLS: Service role only (webhooks are server-side)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage webhook events"
  ON webhook_events FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant permissions
GRANT ALL ON webhook_events TO anon, authenticated;

-- Add cleanup function for old webhook events (30 days retention)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS void AS $$
BEGIN
  DELETE FROM webhook_events
  WHERE processed_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment
COMMENT ON TABLE webhook_events IS
  'Tracks processed Stripe webhook events for idempotency. Prevents duplicate processing if Stripe retries.';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify RLS policies updated
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('teardowns', 'teardown_results')
ORDER BY tablename, policyname;

-- Verify webhook_events table created
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'webhook_events'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Security fixes applied successfully!';
  RAISE NOTICE '1. RLS policies updated (removed 24h public access)';
  RAISE NOTICE '2. Webhook idempotency table created';
  RAISE NOTICE 'Run verification queries above to confirm.';
END $$;
