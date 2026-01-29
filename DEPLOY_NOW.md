# Deploy Teardown Generator to Vercel (15 Minutes)

## Status: ✅ READY TO DEPLOY

- Code pushed to GitHub ✓
- Build successful ✓
- OAuth configured ✓
- Stripe configured ($19/mo product) ✓
- Environment variables ready ✓

---

## Step 1: Deploy to Vercel (5 minutes)

### Option A: Vercel CLI (Fastest)
```bash
cd ~/Projects/teardown-generator

# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy (will prompt for login first time)
vercel

# Follow prompts:
# - Link to existing project? NO (first time)
# - Project name: teardown-generator
# - Which directory? ./ (default)
# - Want to override settings? NO (use auto-detected)

# Deploy to production
vercel --prod
```

### Option B: Vercel Dashboard (More Control)
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select `ChudiNnorukam/teardown-generator`
4. Framework Preset: **Next.js** (auto-detected)
5. Root Directory: `./` (leave default)
6. Click **Deploy** (don't add env vars yet)

**First deployment will FAIL** - this is expected. We need to add environment variables.

---

## Step 2: Add Environment Variables (5 minutes)

### In Vercel Dashboard:
1. Go to your project → **Settings** → **Environment Variables**
2. Add these variables (copy from your `.env.local`):

**Required (Core Functionality):**
```
NEXT_PUBLIC_SUPABASE_URL = https://kjypnepbcymxzzjgzmob.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (from your .env.local)
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (from your .env.local)

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_... (from your .env.local)
STRIPE_SECRET_KEY = sk_test_... (from your .env.local)
STRIPE_PRICE_ID = price_1SsV2NGsh7YQTwqQ6OlwhsNA (from your .env.local)
STRIPE_WEBHOOK_SECRET = whsec_... (from your .env.local)

GOOGLE_CLIENT_ID = ... (from your .env.local)
GOOGLE_CLIENT_SECRET = ... (from your .env.local)
```

**Optional (Leave blank for now):**
```
BUILTWITH_API_KEY = (leave empty)
WAPPALYZER_API_KEY = (leave empty)
```

3. Click **Save**
4. Go to **Deployments** tab
5. Click **⋯** on latest deployment → **Redeploy**
6. Check **Use existing build cache** → **Redeploy**

---

## Step 3: Configure Stripe Webhook (3 minutes)

### Why This Matters:
Your Stripe webhook currently points to localhost. Production needs the real Vercel URL.

### Steps:
1. Copy your Vercel production URL (e.g., `https://teardown-generator.vercel.app`)
2. Go to https://dashboard.stripe.com/webhooks
3. Find your existing webhook (currently `http://localhost:3000/api/stripe/webhook`)
4. Click **⋯** → **Update details**
5. Change **Endpoint URL** to:
   ```
   https://teardown-generator.vercel.app/api/stripe/webhook
   ```
6. Verify **Events to send** includes:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
7. Click **Update endpoint**
8. Copy the **Signing secret** (starts with `whsec_`)
9. Go back to Vercel → Settings → Environment Variables
10. Update `STRIPE_WEBHOOK_SECRET` with the new value
11. Redeploy one more time

---

## Step 4: Test Payment Flow (2 minutes)

### Using Stripe Test Mode:
1. Go to your Vercel URL: `https://teardown-generator.vercel.app`
2. Sign up with your email
3. Click **Upgrade to Pro** ($19/month)
4. Use Stripe test card:
   ```
   Card: 4242 4242 4242 4242
   Expiry: Any future date (e.g., 12/25)
   CVC: Any 3 digits (e.g., 123)
   ZIP: Any 5 digits (e.g., 12345)
   ```
5. Complete checkout
6. Verify you're upgraded to **Pro** tier (check `/settings`)
7. Cancel subscription immediately:
   - Go to `/settings`
   - Click **Manage Subscription** (opens Stripe Customer Portal)
   - Click **Cancel subscription**
   - Verify you're downgraded to **Free** tier

✅ **If all 4 steps work, your payment flow is production-ready!**

---

## Step 5: Switch to LIVE Mode (When Ready for Real Revenue)

### Current State: TEST MODE
- Accepting test payments only
- Zero real revenue
- Safe to test and debug

### To Go LIVE (Get Real $$$):

1. **Stripe Dashboard** → Click **Test Mode** toggle (top right) → Switch to **LIVE MODE**

2. **Get LIVE credentials:**
   ```
   Publishable Key: pk_live_... (replace pk_test_)
   Secret Key: sk_live_... (replace sk_test_)
   ```

3. **Create LIVE webhook:**
   - Go to https://dashboard.stripe.com/webhooks
   - Click **Add endpoint**
   - URL: `https://teardown-generator.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`
   - Copy new signing secret: `whsec_...` (LIVE version)

4. **Update Vercel env vars:**
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_... (new)
   STRIPE_SECRET_KEY = sk_live_... (new)
   STRIPE_WEBHOOK_SECRET = whsec_... (new LIVE webhook secret)
   ```

5. **Redeploy**

6. **Test with real card** (optional - cancel immediately):
   - Use your actual credit card
   - Complete checkout ($19 charged)
   - Immediately cancel subscription (refund issued)
   - Verify refund appears in Stripe dashboard

✅ **Now accepting real payments!**

---

## Post-Deployment Checklist

### Immediate (After Deploy):
- [ ] Site loads at Vercel URL
- [ ] Can sign up with email
- [ ] Can sign in with Google OAuth
- [ ] Can upgrade to Pro (test card)
- [ ] Webhook processes subscription (check Stripe dashboard logs)
- [ ] Can cancel subscription (downgrades to Free)

### Before Marketing:
- [ ] Add custom domain (optional - e.g., teardowngenerator.com)
- [ ] Switch Stripe to LIVE mode
- [ ] Test real payment flow
- [ ] Add Privacy Policy page (generate with ChatGPT)
- [ ] Add Terms of Service page (generate with ChatGPT)
- [ ] Set up analytics (Vercel Analytics - free tier)

### Security Review:
- [ ] Supabase RLS policies enabled (already done per SETUP_PHASE4.md)
- [ ] API routes protected (already done)
- [ ] Rate limiting working (test: try 4 analyses anonymously, 4th should fail)
- [ ] Stripe webhook signature verified (already done)

---

## Troubleshooting

### Deployment Fails with Build Error
**Fix:** Check Vercel build logs for TypeScript errors. Our recent build had 18 warnings (non-blocking) - these are safe to ignore.

### OAuth Redirect Error
**Fix:**
1. Go to Google Cloud Console
2. Add Vercel URL to Authorized redirect URIs:
   ```
   https://teardown-generator.vercel.app/auth/callback
   ```

### Stripe Webhook Not Working
**Symptoms:** User upgrades but still shows as Free tier

**Fix:**
1. Check Stripe Dashboard → Webhooks → View logs
2. If 401/403: Webhook secret mismatch
   - Copy correct `whsec_` from Stripe
   - Update Vercel env var
   - Redeploy
3. If 404: Wrong webhook URL
   - Update Stripe webhook endpoint URL
   - Should match Vercel domain exactly

### Rate Limiting Not Working
**Fix:**
1. Check Supabase → Table Editor → `usage_tracking`
2. Verify rows are being created
3. If empty, check Supabase logs for errors

---

## Expected Timeline

| Task | Time | Status |
|------|------|--------|
| Push to GitHub | Done | ✅ |
| Deploy to Vercel | 5 min | ⏳ |
| Add env vars | 5 min | ⏳ |
| Configure webhook | 3 min | ⏳ |
| Test payment | 2 min | ⏳ |
| **Total to TEST MODE** | **15 min** | |
| Switch to LIVE | 10 min | Later |
| **Total to REVENUE** | **25 min** | |

---

## Current Status

**Code:** ✅ Pushed to GitHub (commit f192620)
**Build:** ✅ Compiles successfully
**Environment:** ✅ All variables ready in .env.local
**Auth:** ✅ OAuth configured
**Payments:** ✅ Stripe integrated ($19/mo product exists)
**Next Step:** Deploy to Vercel (follow Step 1 above)

---

## Quick Commands

```bash
# Deploy to Vercel
cd ~/Projects/teardown-generator && vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Open project in browser
vercel open
```

---

## After First Payment

**When you get your first $19/month customer:**

1. Kingsley will track it:
   ```bash
   python3 ~/clawd/scripts/mission-control-updater.py --add-mrr 19.00 --source "Teardown Generator"
   ```

2. You'll get Mac notification: 💰 "First Revenue!" (Blow sound)

3. Dashboard updates: $19/$500 MRR (3.8% to Kingsley sustainable)

4. 500 XP awarded (milestone achievement)

---

## Support

If deployment fails:
1. Check Vercel build logs (shows exact error)
2. Check Vercel environment variables (all required ones added?)
3. Check Stripe webhook logs (processing events?)
4. Check Supabase logs (database errors?)

**Most common issue:** Missing environment variable. Double-check all 10 required vars are in Vercel settings.

---

Ready to deploy? Run:
```bash
cd ~/Projects/teardown-generator && vercel --prod
```
