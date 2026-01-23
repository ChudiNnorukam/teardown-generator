# Teardown Generator - SaaS Analysis Tool

> Reverse-engineer any SaaS in 60 seconds. Built in ~6 hours using Claude Code.

![Status](https://img.shields.io/badge/status-MVP%20Complete-success)
![Phase](https://img.shields.io/badge/phase-4%20Testing-blue)

## 🎯 What It Does

Paste any SaaS URL and instantly get:
- **Tech Stack Detection**: Frameworks, hosting, auth, payments, analytics
- **Pricing Analysis**: Tiers, prices, features
- **SEO Audit**: Score + actionable recommendations
- **Clone Estimate**: Hours breakdown + complexity

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Add your Supabase and Stripe keys

# Apply database migrations
npx supabase db push

# Start development server
pnpm dev

# In another terminal: Start Stripe webhook listener
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Visit: http://localhost:3000

## 📚 Documentation

- **[Setup Guide](SETUP_PHASE4.md)** - Configure OAuth and Stripe (start here!)
- **[Phase 5: Polish](PHASE5_POLISH.md)** - Pre-launch checklist
- **[Phase 6: Deploy](PHASE6_DEPLOYMENT.md)** - Go live on Vercel

## 🏗️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Auth**: Supabase (email + Google OAuth)
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe (subscriptions)
- **Deployment**: Vercel

## 💰 Pricing

- **Free**: 10 analyses/day (3/day anonymous)
- **Pro**: $19/month - Unlimited analyses + API access

## 🔒 Features

### Authentication
- [x] Email signup/login
- [x] Google OAuth
- [x] Password reset
- [x] Session management

### Core Functionality
- [x] URL submission
- [x] Real-time streaming analysis
- [x] Tech stack detection
- [x] Pricing page scraping
- [x] SEO audit
- [x] Clone time estimation

### Payments
- [x] Stripe checkout
- [x] Subscription management
- [x] Customer portal
- [x] Webhook handling

### Rate Limiting
- [x] Anonymous users (3/day)
- [x] Free users (10/day)
- [x] Pro users (1000/day)
- [x] IP-based tracking
- [x] User-based tracking

## 📁 Project Structure

```
├── app/
│   ├── (auth)/          # Auth pages (login, signup, reset)
│   ├── (dashboard)/     # Settings page
│   ├── api/            # API routes
│   │   ├── teardown/   # Analysis endpoints
│   │   ├── stripe/     # Payment webhooks
│   │   └── user/       # User data
│   ├── teardown/       # Analysis results page
│   └── page.tsx        # Landing page
├── components/
│   ├── layout/         # Header, Footer
│   ├── ui/            # shadcn components
│   └── *.tsx          # Feature components
├── lib/
│   ├── analyzer/      # Tech, pricing, SEO, estimate logic
│   ├── supabase/      # DB clients
│   ├── stripe.ts      # Stripe client
│   └── rate-limit.ts  # Rate limiting logic
├── supabase/
│   └── migrations/    # Database schema
└── types/
    └── database.ts    # TypeScript types
```

## 🗄️ Database Schema

### Tables

**teardowns**
- Stores analysis requests
- Links to results and user

**teardown_results**
- Analysis output (tech, pricing, SEO, estimate)
- Cached by URL hash

**usage_tracking**
- Daily usage counts
- Plan tracking (free/pro)
- Stripe customer mapping

## 🔐 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Tech stack enrichment (optional)
BUILTWITH_API_KEY=
BUILTWITH_API_URL=https://api.builtwith.com/v20/api.json
WAPPALYZER_API_KEY=
WAPPALYZER_API_URL=https://api.wappalyzer.com/v2/lookup/
TEARDOWN_ENRICH_ALLOWLIST=

# Rate limit overrides (optional)
TEARDOWN_RATE_LIMIT_ANON=3
TEARDOWN_RATE_LIMIT_FREE=10
TEARDOWN_RATE_LIMIT_PRO=1000
```

## 🧪 Testing

Run Phase 4.6 verification tests:

```bash
# With server running, test these flows:
1. Email signup
2. Email login
3. Sign out
4. Google OAuth
5. Password reset
6. Anonymous rate limit
7. Free user rate limit
8. Stripe checkout
9. Pro plan verification
10. Customer portal
```

See [SETUP_PHASE4.md](SETUP_PHASE4.md) for detailed test procedures.

## 🚀 Deployment

See [PHASE6_DEPLOYMENT.md](PHASE6_DEPLOYMENT.md) for full deployment guide.

**Quick Deploy to Vercel:**

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Update Supabase URLs
5. Create production webhook
6. Switch to Stripe live mode
7. Test and launch

## 📊 Build Timeline

| Phase | Description | Time | Status |
|-------|-------------|------|--------|
| 0 | Next.js + Supabase setup | 50min | ✅ Complete |
| 1 | Database + basic UI | 40min | ✅ Complete |
| 2 | Analysis engine | 45min | ✅ Complete |
| 3 | Landing page | 55min | ✅ Complete |
| 4 | Auth + Stripe | 90min | ⏳ Testing |
| 5 | Polish | 45min | 📋 Ready |
| 6 | Deploy | 60min | 📋 Ready |
| **Total** | **MVP to Production** | **~6hrs** | |

## 🐛 Known Issues

### TypeScript Type Inference (18 warnings)
- **Impact**: None - code compiles and runs correctly
- **Cause**: Supabase client type inference with custom schemas
- **Status**: Resolved 70% of errors, remaining don't affect runtime

## 📝 License

MIT - Built as validation project for MicroSaaSBot skill stack

## 🤝 Contributing

This is a personal validation project, but suggestions welcome via issues.

---

**Current Status**: Phase 4 complete, awaiting manual configuration and testing.

**Next Steps**:
1. Follow [SETUP_PHASE4.md](SETUP_PHASE4.md) to configure OAuth and Stripe
2. Run 10 verification tests
3. Proceed to Phase 5 polish and Phase 6 deployment
