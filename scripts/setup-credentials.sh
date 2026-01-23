#!/bin/bash
# Helper script to update .env.local with Stripe and OAuth credentials

echo "🔧 Teardown Generator - Credential Setup Helper"
echo "================================================"
echo ""
echo "This script will help you update .env.local with your Stripe and OAuth credentials."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local not found!"
  exit 1
fi

echo "Current placeholder values in .env.local:"
echo ""
grep "STRIPE" .env.local
echo ""

read -p "Do you want to update Stripe credentials? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo "📦 Stripe Credentials"
  echo "---------------------"
  echo "Get these from: https://dashboard.stripe.com/test/apikeys"
  echo ""

  read -p "Stripe Secret Key (sk_test_...): " stripe_secret
  read -p "Stripe Publishable Key (pk_test_...): " stripe_pub
  read -p "Stripe Price ID (price_...): " stripe_price
  read -p "Stripe Webhook Secret (whsec_...): " stripe_webhook

  # Update .env.local
  sed -i '' "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$stripe_secret|" .env.local
  sed -i '' "s|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$stripe_pub|" .env.local
  sed -i '' "s|STRIPE_PRICE_ID=.*|STRIPE_PRICE_ID=$stripe_price|" .env.local
  sed -i '' "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$stripe_webhook|" .env.local

  echo "✅ Stripe credentials updated!"
fi

echo ""
echo "✨ Setup complete! Your .env.local has been updated."
echo ""
echo "Next steps:"
echo "1. Apply database migration: npx supabase db push"
echo "2. Start dev server: pnpm dev"
echo "3. Start Stripe webhook listener: stripe listen --forward-to localhost:3000/api/stripe/webhook"
echo ""
