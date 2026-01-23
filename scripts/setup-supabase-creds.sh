#!/usr/bin/env bash
# Helper script for manual Supabase credential entry
# Uses microsaasbot vault for secure storage

set -euo pipefail

PROJECT="teardown-generator"
ENV="dev"

echo "=== Supabase Credential Setup ==="
echo ""
echo "Copy these values from:"
echo "https://supabase.com/dashboard/project/kjypnepbcymxzzjgzmob/settings/api-keys/legacy"
echo ""

# Project URL
echo -n "NEXT_PUBLIC_SUPABASE_URL (e.g., https://xxx.supabase.co): "
read -r supabase_url
echo "$supabase_url" | microsaasbot vault store NEXT_PUBLIC_SUPABASE_URL "$ENV" "$PROJECT"

# Anon key
echo -n "NEXT_PUBLIC_SUPABASE_ANON_KEY (eyJ... token): "
read -r anon_key
echo "$anon_key" | microsaasbot vault store NEXT_PUBLIC_SUPABASE_ANON_KEY "$ENV" "$PROJECT"

# Service role key
echo -n "SUPABASE_SERVICE_ROLE_KEY (eyJ... token): "
read -r -s service_key
echo ""
echo "$service_key" | microsaasbot vault store SUPABASE_SERVICE_ROLE_KEY "$ENV" "$PROJECT"

echo ""
echo "✓ All credentials stored in vault"
echo ""
echo "Generating .env.local..."
microsaasbot env generate "$ENV" .env.local "$PROJECT"

echo ""
echo "✓ Setup complete! Run: pnpm dev"
