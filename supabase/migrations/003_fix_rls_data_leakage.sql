-- Fix RLS Data Leakage: Remove 24h Public Access Window
-- Migration: 003
-- Created: 2026-01-28
-- CRITICAL: Prevents anonymous teardown URLs from being visible to other users

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
