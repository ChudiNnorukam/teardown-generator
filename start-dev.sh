#!/bin/bash
# Start dev server in clean environment with only .env.local variables

# Unset any existing Supabase variables
unset NEXT_PUBLIC_SUPABASE_URL
unset NEXT_PUBLIC_SUPABASE_ANON_KEY
unset SUPABASE_SERVICE_ROLE_KEY

# Load .env.local
set -a
source .env.local
set +a

# Verify correct values are loaded
echo "Loaded NEXT_PUBLIC_SUPABASE_URL: $NEXT_PUBLIC_SUPABASE_URL"

exec bun run dev
