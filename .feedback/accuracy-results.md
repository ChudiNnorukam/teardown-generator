# Tech Stack Detection Accuracy Results

**Date:** 2026-01-23
**Target:** 85% recall
**Result:** 68.8% recall, 55.9% precision

## Summary

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Recall (detection rate) | 68.8% | 85% | ❌ FAIL |
| Precision (accuracy of detections) | 55.9% | N/A | ⚠️ WARN |
| Sites tested | 21 | 20+ | ✅ PASS |
| True positives | 33 | - | - |
| False positives | 26 | - | - |
| False negatives | 15 | - | - |

## Notes

- Results reflect heuristic-only detection (no BuiltWith/Wappalyzer API keys configured).

## Known Limitations

### Sites Not Detected Properly

| Site | Expected Tech | Detected | Issue |
|------|---------------|----------|-------|
| Cal.com | Next.js, React, Tailwind, Vercel | None | Edge rendering, no client markers |
| Stripe | Stripe, React | None | Custom bundling, no Stripe.js visible |
| PostHog | Next.js, React | PostHog only | SSR without client hydration markers |
| Lemon Squeezy | Next.js, React, Vercel | Lemon Squeezy only | Edge rendering |

### Why These Sites Are Hard to Detect

1. **Modern Edge Rendering** - Next.js App Router with edge runtime doesn't include `__NEXT_DATA__` script
2. **Custom Bundling** - Stripe and other large sites use custom bundlers that minify/obfuscate framework references
3. **React Server Components** - RSC architecture doesn't expose traditional React markers
4. **CDN Proxying** - Some sites use CDN proxies that strip/modify headers

## Recommendations

### Short-term (Current State)
1. Add disclaimer to UI: "Tech detection may be incomplete for edge-rendered sites"
2. Show confidence levels more prominently
3. Allow users to report inaccurate results

### Long-term Improvements
1. **API Integration** - Use BuiltWith/Wappalyzer APIs for cross-reference
2. **Browser Extension** - Client-side detection has access to runtime globals
3. **DNS/TLS Analysis** - Check certificate, DNS records for hosting info
4. **Multiple Endpoint Probing** - Check /api, /_next, etc. for framework hints

## Detection Pattern Updates Made

1. Added framework inference (Next.js → React, Nuxt → Vue)
2. Required 2+ pattern matches for Tailwind to reduce false positives
3. Removed Cloudflare detection (too noisy - 80% of sites use CF)
4. Tightened Nuxt/Svelte/Astro patterns to be more specific
5. Added Next.js header detection (x-nextjs-cache, x-nextjs-matched-path)

## Conclusion

Current detection is suitable for initial launch with appropriate disclaimers. Most popular frameworks/tools are detected correctly. Edge cases involve advanced SSR patterns that require more sophisticated detection methods.
