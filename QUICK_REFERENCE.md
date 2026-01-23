# Quick Reference Card

## 📋 Current Status

**Phase**: 4 Complete (Auth + Payments) → Awaiting Testing
**Build**: ✅ Compiles successfully
**TypeScript**: 18 warnings (runtime unaffected)
**Next**: Manual configuration → Testing → Polish → Deploy

---

## 🚀 What You Need to Do Now

### 1. Configure Services (25 min)

**Stripe Dashboard** → https://dashboard.stripe.com
- Create product: "Teardown Pro" - $19/month
- Copy: Price ID, Secret key, Publishable key
- Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Copy: Webhook secret

**Google Cloud Console** → https://console.cloud.google.com
- Create OAuth client
- Redirect URI: `http://localhost:3000/auth/callback`
- Copy: Client ID, Client Secret

**Supabase Dashboard** → https://supabase.com/dashboard
- Auth → Providers → Google → Enable
- Paste Google credentials
- URL Config: Set Site URL to `http://localhost:3000`

### 2. Update Environment

```bash
# Option 1: Interactive script
./scripts/setup-credentials.sh

# Option 2: Manually edit .env.local with real keys
```

### 3. Apply Database Migration

```bash
npx supabase db push
```

### 4. Start Development

```bash
# Terminal 1
pnpm dev

# Terminal 2
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 5. Run 10 Tests

See [SETUP_PHASE4.md](SETUP_PHASE4.md) for full test procedures.

Quick checklist:
- [ ] Email signup
- [ ] Email login
- [ ] Sign out
- [ ] Google OAuth
- [ ] Password reset
- [ ] Anonymous rate limit (3/day)
- [ ] Free rate limit (10/day)
- [ ] Stripe checkout (card: 4242 4242 4242 4242)
- [ ] Pro plan activated
- [ ] Customer portal

### 6. Report Results

```
X/10 tests passing
Issues: [list any failures]
```

---

## 📚 Documentation Index

| File | Purpose |
|------|---------|
| [README.md](README.md) | Project overview, tech stack, features |
| [SETUP_PHASE4.md](SETUP_PHASE4.md) | **START HERE** - Configure and test |
| [PHASE5_POLISH.md](PHASE5_POLISH.md) | Pre-launch checklist (30-45min) |
| [PHASE6_DEPLOYMENT.md](PHASE6_DEPLOYMENT.md) | Deploy to Vercel (45-60min) |

---

## ⚡ Quick Commands

```bash
# Development
pnpm dev                  # Start dev server
pnpm build                # Production build
pnpm lint                 # Lint code

# Database
npx supabase db push      # Apply migrations
npx supabase db reset     # Reset database

# Stripe
stripe login              # Authenticate CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Deployment
git push origin main      # Push to GitHub
vercel                    # Deploy to Vercel
```

---

## 🏗️ Architecture Quick View

```
User → Next.js → Supabase (auth + db)
               → Stripe (payments)
               → Analyzer (tech/pricing/SEO)
```

**Key Files:**
- `app/api/teardown/route.ts` - Analysis submission
- `app/api/stripe/webhook/route.ts` - Payment webhooks
- `lib/rate-limit.ts` - Usage tracking
- `lib/analyzer/index.ts` - Analysis orchestrator

---

## 🐛 Known Issues

**TypeScript Warnings (18)**: Supabase type inference - doesn't affect runtime

---

## 🎯 Remaining Timeline

| Phase | Time | Description |
|-------|------|-------------|
| **4.6 Testing** | 20-30min | You do: Configure and test |
| **Phase 5** | 30-45min | Error handling, performance, SEO |
| **Phase 6** | 45-60min | Deploy to Vercel, go live |
| **Total** | ~2hrs | To launched product |

---

## 💡 Tips

- Start with Stripe in **test mode**
- Use test card: `4242 4242 4242 4242`
- Keep webhook listener running while testing
- Check Vercel logs for deployment issues
- Monitor Supabase logs for auth problems

---

## 🆘 Troubleshooting

**Auth not working?**
- Check Supabase Site URL matches your localhost
- Verify redirect URIs in Google Cloud Console

**Stripe webhook failing?**
- Ensure `stripe listen` is running
- Check webhook secret matches in .env.local
- Look for events in Stripe CLI output

**Rate limit not working?**
- Check browser console for errors
- Verify session cookie is set
- Check `usage_tracking` table has records

**Build errors?**
- TypeScript warnings are expected (18 remain)
- If build fails, check Vercel logs
- Verify all env vars are set

---

## ✅ When All Tests Pass

Report: **"10/10 tests passing"**

Then proceed to:
1. **Phase 5**: Run polish checklist (30-45min)
2. **Phase 6**: Deploy to production (45-60min)
3. **Launch**: Post on Twitter, LinkedIn, Show HN

---

## 📊 Success Metrics

After launch, track:
- Signups per day
- Analyses completed
- Conversion rate (free → pro)
- MRR growth
- Errors/bugs reported

---

**Last Updated**: Phase 4 complete
**Next Action**: Follow [SETUP_PHASE4.md](SETUP_PHASE4.md) to configure and test
