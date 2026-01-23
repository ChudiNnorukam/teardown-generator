# Load Testing Setup

**Date:** 2026-01-22
**Tool:** k6 (https://k6.io)

## Installation

```bash
# macOS
brew install k6

# Other platforms: https://k6.io/docs/get-started/installation/
```

## Running Tests

```bash
# Full test suite (smoke → load → stress)
pnpm test:load

# Smoke test only (quick check)
k6 run --config '{"scenarios":{"smoke":{}}}' scripts/load-test.js

# Custom base URL (e.g., local dev)
k6 run -e BASE_URL=http://localhost:3000 scripts/load-test.js
```

## Test Scenarios

### 1. Smoke Test
- **Users:** 1
- **Duration:** 30 seconds
- **Purpose:** Verify basic functionality

### 2. Load Test
- **Users:** 10 concurrent
- **Duration:** 2 minutes
- **Stages:** Ramp up → Steady → Ramp down
- **Purpose:** Normal traffic simulation

### 3. Stress Test
- **Users:** Up to 100 concurrent
- **Duration:** 4 minutes
- **Stages:** 50 → 100 → ramp down
- **Purpose:** Find breaking points

## Pass/Fail Thresholds

| Metric | Threshold | Description |
|--------|-----------|-------------|
| http_req_duration p(95) | < 3000ms | 95th percentile under 3s |
| http_req_failed | < 10% | Less than 10% failures |
| homepage_latency p(95) | < 2000ms | Homepage loads under 2s |

## Results Location

Results are saved to: `.feedback/load-test-results.json`

## Pre-Launch Checklist

Before Product Hunt launch:

```bash
# 1. Run full test suite against production
k6 run -e BASE_URL=https://teardown-generator.vercel.app scripts/load-test.js

# 2. Verify thresholds pass
# Check output for: ✓ All thresholds passed

# 3. Review metrics
cat .feedback/load-test-results.json
```

## Expected Results

For a Vercel-hosted Next.js app:

| Scenario | Expected Requests/sec | Expected Latency |
|----------|----------------------|------------------|
| Smoke | N/A | < 500ms |
| Load (10 users) | ~5-10 | < 1000ms |
| Stress (100 users) | ~30-50 | < 3000ms |

## Rate Limiting Behavior

The API has rate limits:
- Anonymous: 3/day
- Signed in: 10/day

During load tests, expect 429 responses after limits are hit.
This is expected behavior and tests handle it gracefully.

## Vercel Considerations

Vercel has:
- 10-second function timeout (hobby)
- 60-second function timeout (pro)
- Edge caching for static assets

For launch day:
- Monitor Vercel Analytics
- Consider enabling ISR for landing page
- Use Edge Runtime for API routes if needed
