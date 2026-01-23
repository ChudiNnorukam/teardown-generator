# Tech Detection Accuracy Strategy

## Decision
Adopt a hybrid detection approach that combines current heuristic scanning with an external enrichment source.
Use BuiltWith (primary) or Wappalyzer (fallback) for authoritative stack signals when available.

## Target Benchmark
- Recall: 85%+ (techs detected vs known ground truth)
- Precision: 70%+
- Sample size: 25+ sites, updated quarterly

## Implementation Plan
1. Add an enrichment step after HTML/header parsing:
   - Fetch BuiltWith/Wappalyzer data keyed by domain
   - Merge signals with heuristics (prefer API confidence over weak heuristics)
2. Keep a deterministic “heuristics-only” mode for cost control and offline testing.
3. Record source attribution for each detected tech (heuristic vs API).

## Rollout Notes
- Start with a small allowlist of domains to control API spend.
- Log missing detections to refine heuristic patterns over time.
