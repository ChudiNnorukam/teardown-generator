# Phase 4.6 - Configuration & Testing Guide

## Prerequisites Completed ✓
- Database migration created: `002_add_subscription_id.sql`
- Setup script ready: `scripts/setup-credentials.sh`

---

## Step 1: Stripe Setup (10 minutes)

### A. Create Product & Get Keys

1. **Open Stripe Dashboard**: https://dashboard.stripe.com
   - Ensure you're in **TEST MODE** (toggle in top right)

2. **Create Product**:
   - Navigate to: **Products** → **Add product**
   - Fill in:
     - Name: `Teardown Pro`
     - Description: `Unlimited SaaS analyses, PDF export, API access`
     - Pricing model: **Standard pricing**
     - Price: `$19.00 USD`
     - Billing period: **Monthly**
     - Payment type: **Recurring**
   - Click **Save product**
   - **Copy the Price ID** (starts with `price_`)

3. **Get API Keys**:
   - Navigate to: **Developers** → **API keys**
   - **Copy**:
     - Publishable key: `pk_test_...`
     - Secret key: `sk_test_...` (click "Reveal test key")

### B. Setup Webhook (Local Testing)

**Option 1: Stripe CLI (Recommended for local dev)**

```bash
# Install Stripe CLI (if not installed)
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Start webhook listener (keep this running in a terminal)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The command will output a **webhook signing secret** (`whsec_...`) - copy this.

**Option 2: Stripe Dashboard (For deployed sites)**

- Navigate to: **Developers** → **Webhooks** → **Add endpoint**
- Endpoint URL: `https://your-domain.com/api/stripe/webhook`
- Events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.deleted`
  - `customer.subscription.updated`

---

## Step 2: Google OAuth Setup (15 minutes)

### A. Create OAuth Credentials

1. **Open Google Cloud Console**: https://console.cloud.google.com
   - Create a new project or select existing

2. **Configure OAuth Consent Screen**:
   - Navigate to: **APIs & Services** → **OAuth consent screen**
   - User Type: **External**
   - Fill in:
     - App name: `Teardown`
     - User support email: `[your email]`
     - Developer contact: `[your email]`
   - Click **Save and Continue** (skip scopes, test users optional)

3. **Create OAuth Client ID**:
   - Navigate to: **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: `Teardown Web`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/callback`
     - `https://[your-supabase-project].supabase.co/auth/v1/callback`
       _(Get your Supabase URL from Supabase Dashboard → Project Settings → API)_
   - Click **Create**
   - **Copy Client ID and Client Secret**

### B. Configure in Supabase

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
   - Select your project

2. **Enable Google Provider**:
   - Navigate to: **Authentication** → **Providers**
   - Find **Google** and toggle **Enable**
   - Paste:
     - **Client ID**: `[from Google Cloud Console]`
     - **Client Secret**: `[from Google Cloud Console]`
   - Click **Save**

---

## Step 3: Supabase Configuration

### A. URL Configuration

- Navigate to: **Authentication** → **URL Configuration**
- Set:
  - **Site URL**: `http://localhost:3000`
  - **Redirect URLs**:
    ```
    http://localhost:3000/auth/callback
    http://localhost:3000/**
    ```

### B. Apply Database Migration

```bash
# If using Supabase CLI
npx supabase db push

# Or manually via SQL Editor in Supabase Dashboard:
# Copy contents of supabase/migrations/002_add_subscription_id.sql
# Paste into SQL Editor and run
```

---

## Step 4: Update Environment Variables

### Option A: Interactive Script

```bash
./scripts/setup-credentials.sh
```

### Option B: Manual Update

Edit `.env.local` and replace placeholder values:

```bash
# Stripe (from Step 1)
STRIPE_SECRET_KEY=sk_test_[your_secret_key]
STRIPE_WEBHOOK_SECRET=whsec_[your_webhook_secret]
STRIPE_PRICE_ID=price_[your_price_id]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[your_publishable_key]

# Supabase (should already be configured)
NEXT_PUBLIC_SUPABASE_URL=[your_supabase_url]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your_supabase_anon_key]
SUPABASE_SERVICE_ROLE_KEY=[your_service_role_key]
```

---

## Step 5: Start Development Environment

### Terminal 1: Dev Server

```bash
pnpm dev
```

Server should start at: http://localhost:3000

### Terminal 2: Stripe Webhook Listener

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Keep this running to receive webhook events.

---

## Step 6: Run Verification Tests

Test each flow in order and verify functionality:

### Test 1: Email Signup ✓
- Navigate to: http://localhost:3000/signup
- Create account with new email
- Check email for confirmation (or use Supabase Dashboard to confirm manually)
- **Expected**: Account created, redirected to homepage

### Test 2: Email Login ✓
- Navigate to: http://localhost:3000/login
- Sign in with email from Test 1
- **Expected**: Signed in, user dropdown visible in header

### Test 3: Sign Out ✓
- Click user avatar dropdown
- Click "Sign out"
- **Expected**: Signed out, redirected to homepage

### Test 4: Google OAuth ✓
- Navigate to: http://localhost:3000/login
- Click "Continue with Google"
- Complete Google sign-in flow
- **Expected**: OAuth successful, redirected to homepage, user logged in

### Test 5: Password Reset ✓
- Sign out
- Navigate to: http://localhost:3000/forgot-password
- Enter email, submit
- Check email for reset link
- Click link, set new password
- **Expected**: Password reset successful, can log in with new password

### Test 6: Anonymous Rate Limit ✓
- Ensure signed out
- Submit 4 teardown analyses (paste any URL)
- **Expected**: First 3 succeed, 4th shows rate limit error

### Test 7: Free User Rate Limit ✓
- Sign in
- Check rate limit display
- **Expected**: Shows "X/10 analyses used today"

### Test 8: Stripe Checkout ✓
- Navigate to: http://localhost:3000/#pricing
- Click "Upgrade to Pro"
- Complete checkout with test card: `4242 4242 4242 4242`
  - Expiry: Any future date
  - CVC: Any 3 digits
  - ZIP: Any 5 digits
- **Expected**: Redirected to /settings with success message

### Test 9: Pro Plan Verification ✓
- Check /settings page
- **Expected**: Shows "Pro" plan badge
- Submit a teardown
- **Expected**: Rate limit shows "X/1000 analyses used today"

### Test 10: Customer Portal ✓
- Navigate to: http://localhost:3000/settings
- Click "Manage Subscription"
- **Expected**: Redirected to Stripe Customer Portal, can view/cancel subscription

---

## Verification Checklist

After completing all tests:

```
[ ] Email signup working
[ ] Email login working
[ ] Sign out working
[ ] Google OAuth working
[ ] Password reset working
[ ] Anonymous rate limit enforced (3/day)
[ ] Free user rate limit enforced (10/day)
[ ] Stripe checkout completes successfully
[ ] Pro plan activated after payment
[ ] Pro rate limit active (1000/day)
[ ] Customer portal accessible
```

---

## Troubleshooting

### Stripe Webhook Not Receiving Events
- Ensure `stripe listen` is running in Terminal 2
- Check webhook secret matches in .env.local
- Look for webhook events in Stripe CLI output

### Google OAuth Fails
- Verify redirect URIs exactly match in Google Cloud Console
- Check Supabase project URL is correct
- Ensure Google provider is enabled in Supabase

### Database Errors
- Verify migration was applied successfully
- Check Supabase logs in Dashboard → Database → Logs
- Ensure RLS policies allow authenticated users

### Rate Limit Not Working
- Check browser console for API errors
- Verify session cookie is being set
- Check Supabase `usage_tracking` table has records

---

## Report Results

Once testing is complete, report back with:

```
X/10 tests passing
Issues encountered:
- [List any errors or failures]
```

**Next Steps After Passing All Tests:**
- Phase 5: Polish & Launch Prep
- Phase 6: Deployment to production
