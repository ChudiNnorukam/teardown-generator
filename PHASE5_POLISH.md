# Phase 5: Polish & Launch Prep

**Goal**: Final polish before deployment. Focus on error handling, performance, and launch readiness.

**Estimated Time**: 30-45 minutes

---

## 5.1 - Error Handling Hardening

Review and improve error states:

### API Error Responses
Ensure consistent format across all routes:
```typescript
{ error: string, code?: string, details?: any }
```

**Check these files:**
- `app/api/teardown/route.ts`
- `app/api/teardown/[id]/route.ts`
- `app/api/teardown/[id]/analyze/route.ts`
- `app/api/stripe/*/route.ts`
- `app/api/user/plan/route.ts`

### Async Operation Coverage
Add try/catch to any uncaught async operations (already mostly covered).

### Root Error Boundary
Create `app/global-error.tsx`:
```typescript
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="text-muted-foreground">
              We're sorry, but something unexpected happened.
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-primary text-white rounded"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

### User-Facing Error Messages
Verify all user-facing errors are friendly:
- ✓ No stack traces exposed
- ✓ No technical jargon
- ✓ Actionable error messages

### Debug Logging
Ensure `console.error` logging for debugging (already in place):
- All API catch blocks log errors
- Helps post-launch debugging

---

## 5.2 - Performance Check

### Run Lighthouse Audit

1. Start dev server: `pnpm dev`
2. Open Chrome → DevTools → Lighthouse
3. Run audit for:
   - Performance
   - Accessibility
   - Best Practices
   - SEO
4. **Target**: 90+ on all four metrics

### Quick Performance Fixes (if needed)

**Images:**
- Add `loading="lazy"` to below-fold images
- Check image sizes are optimized

**Fonts:**
- Verify fonts have `display=swap` (should be automatic with next/font)

**Layout Shift (CLS):**
- Check for layout shift on form submission
- Ensure skeleton states have proper dimensions

**Render-Blocking:**
- Verify no render-blocking resources in critical path

---

## 5.3 - Pre-Launch Checklist

### Verify Existing Files

**public/robots.txt** (should exist from Phase 3):
```txt
User-agent: *
Allow: /
Sitemap: https://teardown.dev/sitemap.xml
```

**app/sitemap.ts** (should exist):
- Test at: http://localhost:3000/sitemap.xml
- Verify valid XML output

### Add Missing Assets

**Favicon** (if not exists):
```bash
# Option 1: Use emoji favicon
npx create-favicon "🔍"

# Option 2: Create simple favicon at public/favicon.ico
# Use any online favicon generator
```

**Open Graph Image** (`public/og-image.png`):
- Size: 1200x630px
- Content: Logo + tagline on brand color
- Tools: Figma, Canva, or https://www.opengraph.xyz

**Update metadata** in `app/layout.tsx`:
```typescript
export const metadata = {
  // ... existing metadata
  openGraph: {
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
};
```

---

## 5.4 - Security Review

Quick security checklist:

### Client-Side Secrets
```bash
# Check for exposed secrets in browser bundle
pnpm build
grep -r "sk_" .next/static/ || echo "✓ No secret keys in bundle"
```

### Database Security
- [ ] RLS enabled on all tables (check Supabase Dashboard)
- [ ] Service role key only used server-side
- [ ] Auth policies tested

### Stripe Security
- [ ] Webhook signature verified in `app/api/stripe/webhook/route.ts`
- [ ] No price tampering possible (prices from Stripe, not client)

### Rate Limiting
- [ ] Anonymous users limited (3/day)
- [ ] Free users limited (10/day)
- [ ] Pro users have high limit (1000/day)

### Error Messages
- [ ] No sensitive data exposed in error responses
- [ ] Stack traces only in server logs, not sent to client

---

## 5.5 - Analytics Setup (Optional but Recommended)

### Option 1: Vercel Analytics (Recommended)

**Install:**
```bash
pnpm add @vercel/analytics
```

**Update `app/layout.tsx`:**
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Benefits:**
- Free tier included with Vercel
- Zero config
- Privacy-friendly
- Real user metrics

### Option 2: Plausible Analytics

```bash
pnpm add next-plausible
```

**Update `app/layout.tsx`:**
```typescript
import PlausibleProvider from 'next-plausible';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PlausibleProvider domain="teardown.dev">
          {children}
        </PlausibleProvider>
      </body>
    </html>
  );
}
```

### Option 3: PostHog

```bash
pnpm add posthog-js
```

Good for product analytics, feature flags, session replay.

---

## 5.6 - Final Pre-Launch Checks

### Functionality
- [ ] Landing page loads
- [ ] Teardown submission works
- [ ] Analysis streams correctly
- [ ] Results display properly
- [ ] Auth flows work (email + OAuth)
- [ ] Stripe checkout completes
- [ ] Settings page shows correct plan
- [ ] Rate limiting enforces correctly

### Content
- [ ] All copy is polished
- [ ] No "Lorem ipsum" or placeholder text
- [ ] Links work (social, footer, etc.)
- [ ] 404 page exists and is styled

### Legal (if launching publicly)
- [ ] Privacy Policy (required if collecting emails)
- [ ] Terms of Service (recommended)
- [ ] Can use generators like https://www.termsfeed.com

---

## Phase 5 Completion Checklist

```
[ ] Error handling reviewed and improved
[ ] Global error boundary added
[ ] Lighthouse audit passed (90+ all metrics)
[ ] Favicon added
[ ] Open Graph image created
[ ] Security review passed
[ ] Analytics installed (optional)
[ ] All pre-launch checks complete
```

---

**Next**: Phase 6 - Deployment
