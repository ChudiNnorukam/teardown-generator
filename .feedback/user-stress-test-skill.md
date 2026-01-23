---
name: user-stress-test-framework
description: Critical pre-launch stress testing for Product Hunt, G2, and real user exposure. Identifies every potential failure point, bad review trigger, and competitive weakness before public launch. Use when preparing any product for public release, marketplace listing, or review site submission.
---

# User Stress Test Framework

Identify every way your product will receive negative reviews BEFORE launch.

## When to Use

- "stress test my app"
- "Product Hunt launch readiness"
- "will this survive user testing"
- "audit before launch"
- "find failure points"
- "prevent bad reviews"
- "competitive weakness analysis"
- "G2 review preparation"

## Framework Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER STRESS TEST FRAMEWORK                    │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 1: Platform Requirements Audit                           │
│  ├── Product Hunt 2025 featuring criteria                       │
│  ├── G2 Grid eligibility requirements                           │
│  └── Marketplace-specific rules                                  │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 2: Technical Failure Analysis                            │
│  ├── Performance stress scenarios                                │
│  ├── Error state handling                                        │
│  ├── Mobile responsiveness audit                                 │
│  └── Load/timeout failure modes                                  │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 3: Accuracy & Data Quality                               │
│  ├── Core functionality accuracy                                 │
│  ├── Edge case handling                                          │
│  ├── False positive/negative analysis                            │
│  └── Confidence level transparency                               │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 4: UX Friction Points                                    │
│  ├── First-run experience gaps                                   │
│  ├── Onboarding failure modes                                    │
│  ├── Error message quality                                       │
│  └── Value demonstration speed                                   │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 5: Competitive Positioning                               │
│  ├── Direct competitor comparison                                │
│  ├── Free alternative analysis                                   │
│  ├── Differentiation clarity                                     │
│  └── Value proposition gaps                                      │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 6: Trust & Credibility                                   │
│  ├── Social proof assessment                                     │
│  ├── Legal/compliance gaps                                       │
│  ├── Privacy concerns                                            │
│  └── About/contact information                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## PHASE 1: Platform Requirements Audit

### Product Hunt 2025 Featuring Requirements

**CRITICAL**: Only ~10% of submissions get featured since January 2024.

Products are manually evaluated on 4 criteria:

| Criterion | What They Check | Red Flags |
|-----------|-----------------|-----------|
| **Useful** | Practical benefit to users | "Solution looking for a problem" |
| **Novel** | Differentiated from existing | "Just another X" |
| **Well-made** | Professional execution | Bugs, slow load, broken features |
| **Interesting** | Compelling story/approach | Generic positioning |

**Pre-Launch Checklist**:
```
ASSETS REQUIRED:
- [ ] 240x240 thumbnail (GIF optional, <3MB)
- [ ] 2+ gallery images (1270x760 recommended)
- [ ] Product video (optional but +40% engagement)
- [ ] Maker's first comment ready (300-400 words)

COMMUNITY PREP (2-3 weeks before):
- [ ] Teaser page with "Coming Soon" status
- [ ] 50-100 committed supporters
- [ ] Engaged in PH community (comment history)
- [ ] Promo code for community

LAUNCH TIMING:
- [ ] Launch at 12:01 AM PST for max exposure
- [ ] Tuesday-Thursday recommended
- [ ] Avoid major competing launches
```

### G2 Requirements

**Grid Eligibility**:
- Minimum 10 reviews to appear on Grid
- Reviews must be from verified business users
- Requires business email (no Gmail/personal)
- LinkedIn verification recommended

**Best Software Awards** (2025 criteria):
- At least 10 reviews from calendar year
- Must appear on at least one G2 Grid
- Scores based on Satisfaction + Market Presence

**Review Quality Standards**:
- Minimum 150+ words per review
- Must include pros, cons, and use cases
- Reviews from guests don't count toward score
- Incentivized reviews are labeled

---

## PHASE 2: Technical Failure Analysis

### Performance Stress Scenarios

Run these tests BEFORE any public launch:

```
LOAD TIME TESTS:
□ Initial page load < 3 seconds (target LCP)
□ Time to Interactive < 5 seconds
□ Core feature responds < 2 seconds
□ Mobile 3G simulation passes
□ Lighthouse Performance score > 90

CONCURRENT USER TESTS:
□ 10 simultaneous users - no degradation
□ 50 simultaneous users - graceful queue
□ 100 simultaneous users - clear messaging

FAILURE HANDLING:
□ Network timeout shows clear message
□ Server error allows retry
□ Partial results save progress
□ Session loss doesn't lose data
```

### Critical Failure Modes

| Scenario | What Fails | User Impact | Prevention |
|----------|------------|-------------|------------|
| **Launch Day Surge** | Server overload | "Doesn't work" reviews | Load test for 10x expected traffic |
| **Slow Analysis** | Timeout during processing | User abandonment | Queue system with position indicator |
| **Mobile User** | Unresponsive design | 60% of PH traffic bounces | Mobile-first design |
| **JS-Heavy Sites** | Analysis misses dynamic content | "Inaccurate results" | Headless browser rendering |
| **Blocked Scraping** | Cloudflare/bot detection | "Doesn't work on X" | Proxy rotation, graceful failure |

### Error State Audit

Every error must answer:
1. **What** happened?
2. **Why** did it happen?
3. **What** can the user do now?

```
BAD ERROR:
"Something went wrong. Please try again."

GOOD ERROR:
"We couldn't reach example.com - the site may be blocking 
automated access. You can:
• Try again in a few minutes
• Report this site for manual review
• Analyze a different URL"
```

---

## PHASE 3: Accuracy & Data Quality

### Accuracy Benchmarking

Before launch, test against 20+ known sites:

```
ACCURACY TEST PROTOCOL:
1. Select 20 diverse sites with KNOWN tech stacks
2. Run your analysis on each
3. Compare against ground truth
4. Calculate accuracy percentage
5. Document false positives/negatives

MINIMUM THRESHOLDS:
- Tech detection: 85%+ accuracy
- Pricing extraction: 70%+ when page exists
- SEO metrics: 90%+ (objective measures)
- Clone estimates: N/A (set expectations instead)
```

### Common Accuracy Complaints

| Issue | User Complaint | Fix |
|-------|----------------|-----|
| False positives | "Said I use WordPress, I use Next.js" | Improve detection patterns |
| Missing tech | "Missed Stripe, Auth0 - critical tools" | Add backend inference |
| Wrong prices | "Extracted random numbers as prices" | Structured data validation |
| Confidence unclear | "Got 85/100, no idea what's wrong" | Show calculation breakdown |

### Confidence Level Transparency

Always show confidence for uncertain data:

```
GOOD PRACTICE:
"Tech Stack (94% confidence)"
├── Next.js - High confidence (detected in HTML)
├── Vercel - Medium confidence (inferred from headers)
└── Stripe - Low confidence (script reference only)

"Pricing (extracted from /pricing page)"
├── Starter: $9/mo ✓ Verified
├── Pro: $29/mo ✓ Verified
└── Enterprise: Contact sales (no price found)
```

---

## PHASE 4: UX Friction Points

### First-Run Experience Audit

User arrives → User gets value. Map every step:

```
STEP 1: Landing Page
□ Value proposition clear in 5 seconds?
□ What to do next is obvious?
□ Trust signals visible above fold?

STEP 2: First Action
□ Can act without signup?
□ Input validation is helpful?
□ Example shown before they try?

STEP 3: Processing
□ Progress feedback during wait?
□ Time estimate shown?
□ Can they do something else?

STEP 4: Results
□ Value obvious immediately?
□ Can share/export easily?
□ Clear path to more value?
```

### Friction Point Checklist

| Friction | Symptom | Solution |
|----------|---------|----------|
| No example | User doesn't know what to expect | Show sample output first |
| Rate limit too low | "Wasted my free try" | Show limit before first use |
| Results hidden | "Too many tabs, couldn't find X" | Summary view first, details on demand |
| No history | "Closed tab, lost everything" | Session storage + shareable links |
| No comparison | "Can't compare my analyses" | Side-by-side view for power users |

### Value Demonstration Speed

**Critical metric**: Time from landing to "aha moment"

```
TARGET: < 60 seconds to first value

MEASURE:
- Landing → First action: < 10 seconds
- First action → Results: < 30-45 seconds
- Results → Understanding value: < 15 seconds

IF LONGER:
- Remove required signup
- Reduce required inputs
- Show partial results faster
```

---

## PHASE 5: Competitive Positioning

### Direct Competitor Analysis Template

```
COMPETITOR: [Name]
- Users: [Number]
- Pricing: [Range]
- Strengths: [List]
- Weaknesses: [List]
- User complaints: [From reviews]

YOUR ADVANTAGE:
- What do you do better?
- What do you do differently?
- What do you NOT do (by design)?

POSITIONING STATEMENT:
"Unlike [competitor] which [weakness], 
[your product] [your strength] for [target user]."
```

### Free Alternatives Test

Users will always ask: "Why not just use free tools?"

```
FREE ALTERNATIVE CHECK:
1. List all free tools that solve part of this problem
2. Calculate total time to use all free tools
3. Identify what free tools CAN'T do
4. Your value = (time saved) + (unique features)

IF VALUE UNCLEAR:
- Your product may be too similar to free options
- Consider unique features or better UX as differentiator
```

### Differentiation Clarity

Ask 5 people: "What makes this different?"

```
IF ANSWERS VARY WIDELY:
→ Your positioning is unclear

IF ANSWERS ARE "I don't know":
→ Your differentiation isn't visible

IF ANSWERS MATCH YOUR INTENT:
→ Ready for launch
```

---

## PHASE 6: Trust & Credibility

### Social Proof Assessment

| Element | Status | Impact |
|---------|--------|--------|
| User count | Real & verifiable? | High |
| Testimonials | Named, with photos? | High |
| Company logos | With permission? | Medium |
| Media mentions | Linked to source? | Medium |
| Product Hunt badge | Legitimate? | Low-Medium |

### Legal/Compliance Gaps

```
REQUIRED PAGES:
- [ ] Privacy Policy (GDPR if EU users)
- [ ] Terms of Service
- [ ] Cookie consent (if applicable)
- [ ] Data retention policy

SCRAPING-SPECIFIC:
- [ ] Robots.txt compliance
- [ ] Rate limiting implemented
- [ ] Clear disclaimer about public data only
```

### Trust Signals Audit

```
CREDIBILITY CHECKLIST:
- [ ] About page with maker story
- [ ] Contact information visible
- [ ] Physical address (if required)
- [ ] Response time for support
- [ ] Social media presence
- [ ] Blog or content showing expertise
```

---

## Stress Test Scenario Templates

### Scenario 1: Product Hunt Launch Day

```
PERSONA: Excited founder, discovers via PH
ACTION: Submits competitor URL at 9 AM PST (peak traffic)

FAILURE CHAIN:
1. Server overload → 60 second timeout
2. Generic error message → User confusion
3. User comments "Doesn't work" → Social proof damage
4. 50 others see comment → Skip trying

PREVENTION:
- Load test for 100 concurrent users
- Queue system with wait time
- Graceful degradation messaging
```

### Scenario 2: Tech-Savvy User

```
PERSONA: Senior developer analyzing competitor
ACTION: Submits modern Next.js app URL

FAILURE CHAIN:
1. Detects "React" but misses Next.js
2. Misses Vercel hosting (obvious from domain)
3. Says "No pricing" (it's on /plans)
4. Estimates "40 hours" (actually 400+)
5. User posts "Completely inaccurate"

PREVENTION:
- Improve detection to 85%+
- Show confidence levels
- Add disclaimers on estimates
```

### Scenario 3: Mobile User

```
PERSONA: Browsing Product Hunt on iPhone
ACTION: Clicks through to try tool

FAILURE CHAIN:
1. Input field too small to tap
2. Results page has horizontal scroll
3. Tabs don't work properly
4. Can't read badges (too small)
5. User bounces

PREVENTION:
- Mobile-first design
- Touch targets 44px minimum
- Responsive tables/grids
```

### Scenario 4: Comparison Shopper

```
PERSONA: Evaluating vs. established tool
ACTION: Tests same URL on both tools

FAILURE CHAIN:
1. Your tool: 8 technologies
2. Competitor: 23 technologies
3. Your tool: "No pricing found"
4. Competitor: Pricing detected
5. User: "X is way better"

PREVENTION:
- Use competitor APIs if possible
- Position as complementary
- Focus on unique value props
```

---

## GO / NO-GO Decision Matrix

### MUST PASS (All Required)

```
□ Core feature accuracy > 85%
□ Page load time < 3 seconds
□ Zero critical bugs in 50-user beta
□ Mobile responsive on 3 device sizes
□ Lighthouse Performance > 90
□ Lighthouse Accessibility > 90
□ Legal pages complete
□ 30+ committed launch supporters
```

### SHOULD PASS (3 of 5)

```
□ PDF/export working
□ Comparison feature live
□ 10+ testimonials collected
□ Referral program active
□ Annual pricing available
```

### LAUNCH TIMING RECOMMENDATIONS

| Readiness | Action | Timeline |
|-----------|--------|----------|
| All MUST + 3 SHOULD | Full Product Hunt launch | Immediate |
| All MUST, <3 SHOULD | Soft launch to community | 1-2 weeks |
| Missing MUST items | Private beta | 2-4 weeks |
| Multiple MUST failures | Not launch ready | 4+ weeks |

---

## Remediation Priority Framework

### Severity Levels

| Level | Definition | Response |
|-------|------------|----------|
| **P0 - Blocker** | Core feature broken | Fix before ANY launch |
| **P1 - Critical** | Major UX issue | Fix before public launch |
| **P2 - Important** | Affects satisfaction | Fix within first week |
| **P3 - Nice-to-have** | Polish items | Backlog for v2 |

### Time Estimates

| Fix Category | Typical Hours |
|--------------|---------------|
| Critical bug | 2-8 |
| UX improvement | 4-16 |
| New feature | 8-40 |
| Performance optimization | 8-24 |
| Mobile responsiveness | 8-16 |
| Legal/compliance | 4-8 |

---

## Output Format

When running a stress test, produce:

```markdown
# [Product Name] Stress Test Report

## Executive Summary
- Overall readiness: [READY / CONDITIONAL / NOT READY]
- Critical issues: [Count]
- Important issues: [Count]
- Launch recommendation: [Specific advice]

## Platform Compliance
### Product Hunt
- Featuring probability: [%]
- Missing requirements: [List]

### G2
- Eligibility status: [Yes/No]
- Review collection plan: [Required]

## Technical Audit
### Performance
- Load time: [X seconds] [✓/✗]
- Mobile score: [X/100] [✓/✗]
- Concurrent users tested: [X] [✓/✗]

### Accuracy
- Core function accuracy: [X%] [✓/✗]
- Known failure cases: [List]

## UX Analysis
- Time to value: [X seconds]
- Critical friction points: [List]
- Error handling: [Score/10]

## Competitive Position
- Primary competitors: [List]
- Differentiation clarity: [Score/10]
- Free alternative gap: [Defined/Unclear]

## Trust & Legal
- Required pages: [Complete/Missing X]
- Social proof: [Score/10]
- Compliance status: [Green/Yellow/Red]

## Issue Tracker

### P0 - Blockers
1. [Issue] - [Fix] - [Hours]

### P1 - Critical  
1. [Issue] - [Fix] - [Hours]

### P2 - Important
1. [Issue] - [Fix] - [Hours]

## Remediation Roadmap
- Week 1: [Focus]
- Week 2: [Focus]
- Launch date: [Conditional on X]
```
