-- Add subscription_id column for Stripe subscriptions
ALTER TABLE usage_tracking
ADD COLUMN IF NOT EXISTS subscription_id TEXT;

-- Add index for faster lookups by subscription
CREATE INDEX IF NOT EXISTS idx_usage_tracking_subscription_id
ON usage_tracking(subscription_id)
WHERE subscription_id IS NOT NULL;
