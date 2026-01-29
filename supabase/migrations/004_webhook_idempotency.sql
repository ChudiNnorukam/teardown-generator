-- Add Webhook Idempotency Tracking
-- Migration: 004
-- Created: 2026-01-28
-- CRITICAL: Prevents processing duplicate Stripe webhook events (double charges, race conditions)

-- Table: webhook_events
-- Tracks processed Stripe webhook events for idempotency
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  CONSTRAINT webhook_events_stripe_event_id_unique UNIQUE(stripe_event_id)
);

-- Index for fast lookups
CREATE INDEX idx_webhook_events_stripe_event_id
  ON webhook_events(stripe_event_id);

CREATE INDEX idx_webhook_events_processed_at
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
