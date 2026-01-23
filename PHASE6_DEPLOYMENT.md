# Phase 6: Deployment

**Goal**: Deploy to Vercel and go live.

**Estimated Time**: 45-60 minutes (mostly waiting for DNS/deploys)

---

## 6.1 - Vercel Project Setup

### Step 1: Push Code to GitHub

If not already pushed:

```bash
# Check current status
git status

# Stage all changes
git add .

# Commit
git commit -m "Complete MVP ready for launch

- Phase 0-4: Complete teardown analysis engine
- Auth: Email + Google OAuth via Supabase
- Payments: Stripe subscription checkout
- Rate limiting: 3/day anon, 10/day free, 1000/day pro
- UI: Linear-inspired design system
- All tests passing"

# Push to main
git push origin main
```

### Step 2: Import to Vercel

1. **Go to**: https://vercel.com/new
2. **Sign in** with GitHub
3. **Import** your repository
4. **Configure**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (or adjust if nested)
   - Build Command: `pnpm build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

### Step 3: Environment Variables

Add all variables from `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe - USE TEST KEYS FIRST FOR VERIFICATION
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx (will update after webhook created)
STRIPE_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

**⚠️ Important**: Start with TEST keys to verify deployment works before switching to LIVE keys.

### Step 4: Deploy

Click **Deploy** and wait for build to complete (~2-3 minutes).

---

## 6.2 - Post-Deploy Configuration

### Step 1: Test Deployment

Visit your Vercel URL (e.g., `teardown-xxx.vercel.app`):

- [ ] Landing page loads
- [ ] Can submit a teardown
- [ ] Analysis completes
- [ ] Auth works (test email signup)

### Step 2: Custom Domain (Optional)

If you own a domain:

**In Vercel Dashboard:**
1. Project → **Settings** → **Domains**
2. Add your domain (e.g., `teardown.dev`)
3. Follow DNS configuration instructions

**Common DNS Providers:**
- **Vercel Domains**: Automatic
- **Cloudflare**: Add CNAME record
- **Namecheap/GoDaddy**: Add CNAME or A record as instructed

**Wait for DNS propagation** (5-60 minutes).

### Step 3: Update Supabase URLs

In **Supabase Dashboard** → Authentication → URL Configuration:

```
Site URL: https://your-production-url.vercel.app
(or https://teardown.dev if using custom domain)

Redirect URLs:
https://your-production-url.vercel.app/auth/callback
https://your-production-url.vercel.app/**
```

**Save** changes.

### Step 4: Update Google OAuth

In **Google Cloud Console** → APIs & Services → Credentials:

Edit your OAuth 2.0 Client ID:

**Authorized JavaScript origins:**
- Add: `https://your-production-url.vercel.app`

**Authorized redirect URIs:**
- Add: `https://your-production-url.vercel.app/auth/callback`
- Keep existing localhost URLs for local dev

**Save** changes.

### Step 5: Create Production Stripe Webhook

**⚠️ Still using TEST mode for now**

In **Stripe Dashboard** (TEST MODE):

1. Navigate to: **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-production-url.vercel.app/api/stripe/webhook`
4. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. **Add endpoint**
6. Click the webhook to view details
7. **Copy Signing Secret** (`whsec_...`)
8. Update in **Vercel** → Project → **Settings** → **Environment Variables**:
   - Update `STRIPE_WEBHOOK_SECRET` with new value
   - **Redeploy** (Vercel Dashboard → Deployments → three dots → Redeploy)

### Step 6: Test Production with Test Keys

Verify everything works with Stripe TEST keys:

- [ ] Can sign up
- [ ] Can upgrade to Pro (use test card `4242 4242 4242 4242`)
- [ ] Webhook fires correctly (check Vercel logs)
- [ ] Plan upgrades in database
- [ ] Settings page shows Pro
- [ ] Rate limit updates to 1000/day

---

## 6.3 - Switch to Stripe LIVE Mode (Revenue Time!)

### Step 1: Create Live Product

In **Stripe Dashboard** (switch to **LIVE MODE**):

1. Go to **Products** → **Add product**
2. Create same product as test:
   - Name: `Teardown Pro`
   - Price: `$19.00 USD`
   - Billing: Monthly, Recurring
3. **Save** and copy **Price ID** (`price_xxx`)

### Step 2: Get Live API Keys

In **Stripe Dashboard** (LIVE MODE):

- Navigate to: **Developers** → **API keys**
- **Copy**:
  - Secret key: `sk_live_...`
  - Publishable key: `pk_live_...`

### Step 3: Create Live Webhook

In **Stripe Dashboard** (LIVE MODE):

1. **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://your-production-url.vercel.app/api/stripe/webhook`
3. Events: Same as before
4. **Save** and copy **Signing Secret** (`whsec_...`)

### Step 4: Update Vercel Environment Variables

In **Vercel Dashboard** → Project → **Settings** → **Environment Variables**:

Update these to LIVE values:
```bash
STRIPE_SECRET_KEY=sk_live_xxx (replace)
STRIPE_WEBHOOK_SECRET=whsec_xxx (replace with live webhook secret)
STRIPE_PRICE_ID=price_xxx (replace with live price ID)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx (replace)
```

### Step 5: Redeploy

**Vercel Dashboard** → Deployments → Latest → Three dots → **Redeploy**

Wait for deployment to complete.

### Step 6: Test with Real Card (Optional)

**⚠️ This will charge your actual card**

Test the flow with a real card to verify:
- Checkout works
- Webhook fires
- Plan upgrades
- Customer portal works

**Then immediately cancel** the subscription in Stripe Customer Portal.

---

## 6.4 - Production Verification Checklist

Visit production URL and test:

```
[ ] Landing page loads correctly
[ ] Can submit teardown analysis
[ ] Analysis completes successfully
[ ] Sign up works (email confirmation received)
[ ] Login works
[ ] Google OAuth works
[ ] Password reset works
[ ] Stripe checkout works (LIVE MODE)
[ ] Plan upgrades after payment
[ ] /settings shows correct plan
[ ] Customer portal accessible
[ ] Rate limiting works
[ ] Anonymous: 3/day
[ ] Free: 10/day
[ ] Pro: 1000/day
```

---

## 6.5 - Launch Announcement

### You Now Have:
- ✅ Working product at public URL
- ✅ Revenue capability (Stripe live)
- ✅ Content for announcement

### Suggested Launch Post

**Short Version (Twitter/X):**
```
Built a SaaS teardown tool in [X] hours with @AnthropicAI Claude Code

Paste any URL → Get:
- Tech stack breakdown
- Pricing analysis
- SEO audit
- Build time estimate

Try it: [your-url]

Free tier: 10 analyses/day
Pro: $19/mo unlimited

Built using the MicroSaaSBot skill stack validation.
```

**Long Version (LinkedIn):**
```
I built [Product Name] in [X] hours using Claude Code

What it does:
Paste any SaaS URL and instantly get:
• Full tech stack detection (Next.js, React, Tailwind, etc.)
• Pricing page analysis
• SEO audit with recommendations
• Clone estimate breakdown

Why I built it:
[1-2 sentences on problem/motivation]

What I learned:
• Authentication flows with Supabase
• Stripe subscription payments
• Real-time streaming analysis
• Rate limiting patterns
• Modern design system implementation

Stack:
• Next.js 16 + React Server Components
• Supabase (auth + database)
• Stripe (payments)
• Tailwind v4
• TypeScript

Try it: [your-url]

Free: 10 analyses/day
Pro: $19/month unlimited

This was built as part of validating my MicroSaaSBot skill stack.

[engagement question, e.g.: "What SaaS tools are you curious about?"]
```

### Launch Channels

**Recommended:**
1. **Twitter/X** - Tech community, quick feedback
2. **LinkedIn** - Professional network, potential customers
3. **r/SideProject** - Supportive community
4. **r/SaaS** - Niche-relevant
5. **Hacker News** (Show HN) - High-quality feedback
6. **Product Hunt** - If you want broader reach

**Show HN Template:**
```
Title: Show HN: [Product] – Reverse engineer any SaaS in 60 seconds

Body:
Hi HN,

I built [Product], a tool that analyzes any SaaS website and tells you:
- What tech stack they use
- How they price their product
- Their SEO strategy
- How long it would take to clone

Live demo: [url]

I built this in [X] hours using Claude Code to validate a skill stack for rapid MicroSaaS development. The entire codebase was generated through conversation.

Free tier: 10 analyses per day
Pro: $19/month for unlimited

Tech: Next.js 16, Supabase, Stripe, Tailwind v4

Would love feedback on the analysis quality and what other insights would be useful!
```

---

## 6.6 - Post-Launch Monitoring

### Watch These Metrics (First Week)

**Vercel Dashboard:**
- Error rate (should be <1%)
- Response times (p95 should be <2s)
- Bandwidth usage

**Supabase Dashboard:**
- Database connections
- API request count
- Auth success rate

**Stripe Dashboard:**
- Checkout conversion rate
- Subscription MRR
- Failed payments

### Set Up Alerts

**Vercel:**
- Project → Settings → Notifications
- Enable: Failed deployments, high error rate

**Supabase:**
- Project → Settings → Notifications
- Enable: Database issues, auth failures

**Stripe:**
- Settings → Notifications
- Enable: Payment failures, subscription cancellations

---

## 6.7 - Next Steps (Post-Launch)

**Week 1:**
- Monitor errors, fix critical bugs
- Respond to user feedback
- Tweet/post about interesting findings from users

**Week 2:**
- Add waitlist for features users request
- Improve SEO based on search console data
- Consider adding blog content

**Long-term:**
- Implement requested features
- Build email list
- Consider API access tier
- Add historical tracking
- Explore partnerships

---

## Phase 6 Completion Checklist

```
[ ] Code pushed to GitHub
[ ] Deployed to Vercel
[ ] Custom domain configured (optional)
[ ] Supabase URLs updated
[ ] Google OAuth production URLs added
[ ] Stripe production webhook created
[ ] Environment variables set to LIVE
[ ] Production verification passed (all tests)
[ ] Launch post drafted
[ ] Posted to launch channels
[ ] Monitoring/alerts configured
```

---

## 🎉 Congratulations!

You've built and launched a complete SaaS product with:
- Authentication (email + OAuth)
- Payments (Stripe subscriptions)
- Real-time analysis
- Rate limiting
- Professional UI
- Production monitoring

**Total build time**: ~4-6 hours across 6 phases

**What's next?**
- Iterate based on user feedback
- Add requested features
- Scale as needed
- Launch next product using this validated skill stack

---

**Return to validation**: Document friction points, time spent, and lessons learned in your MicroSaaSBot validation report.
