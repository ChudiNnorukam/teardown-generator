// Tech stack detection from HTML and headers
import type { TechStackItem } from '@/types/database';
import { getTechEnrichment } from './tech-enrichment';

interface DetectionPattern {
  name: string;
  category: string;
  patterns: {
    html?: RegExp[];
    scripts?: RegExp[];
    meta?: RegExp[];
    headers?: Record<string, RegExp>;
  };
}

const DETECTION_PATTERNS: DetectionPattern[] = [
  // Frameworks - order matters (more specific first)
  {
    name: 'Next.js',
    category: 'Framework',
    patterns: {
      scripts: [/_next\//i, /next\/dist/i],
      html: [/<script id="__NEXT_DATA__"/i, /data-nscript/i, /__NEXT_DATA__/i],
      meta: [/name="next-head-count"/i],
      headers: { 'x-nextjs-cache': /./, 'x-nextjs-matched-path': /./ },
    },
  },
  {
    name: 'Nuxt',
    category: 'Framework',
    patterns: {
      scripts: [/_nuxt\//i],
      html: [/id="__nuxt"/i, /__NUXT__/i],
    },
  },
  {
    name: 'React',
    category: 'Framework',
    patterns: {
      // Modern React detection patterns - bundled code often contains these
      scripts: [
        /react(-dom)?\.production/i,
        /react\.development/i,
        /\/react@/i,
        /unpkg\.com\/react/i,
        /cdn\.jsdelivr\.net\/npm\/react/i,
        /esm\.sh\/react/i,
      ],
      html: [
        /data-reactroot/i,
        /data-reactid/i,
        /__REACT_DEVTOOLS_GLOBAL_HOOK__/i,
        /_reactRootContainer/i,
        /react-app/i,
        // React 18+ patterns
        /\$RC="?function/i,  // React Client component marker in RSC
        /createRoot\(/i,     // React 18 createRoot
        /hydrateRoot\(/i,    // React 18 hydrateRoot
      ],
    },
  },
  {
    name: 'Vue',
    category: 'Framework',
    patterns: {
      scripts: [/vue\.global/i, /vue\.esm/i, /\/vue@/i, /vue\.runtime/i],
      html: [/data-v-[a-f0-9]/i, /v-if=/i, /v-for=/i, /v-model=/i, /:class="\{/i],
    },
  },
  {
    name: 'Svelte',
    category: 'Framework',
    patterns: {
      scripts: [/__sveltekit/i],
      html: [/data-sveltekit/i, /data-svelte-h/i],
    },
  },
  {
    name: 'Astro',
    category: 'Framework',
    patterns: {
      // Very specific Astro markers only
      html: [/astro-island/i, /data-astro-source-file/i],
      meta: [/name="generator" content="Astro/i],
    },
  },

  // CSS Frameworks - stricter patterns
  {
    name: 'Tailwind CSS',
    category: 'CSS',
    patterns: {
      // Look for Tailwind-specific class combinations (not just single utilities)
      html: [
        /class="[^"]*\b(sm:|md:|lg:|xl:|2xl:)[a-z]/i,  // Responsive prefixes
        /class="[^"]*\b(hover:|focus:|active:)[a-z]/i, // State prefixes
        /class="[^"]*\bspace-(x|y)-\d/i,               // Space utilities
        /class="[^"]*\b(tracking|leading)-/i,          // Typography utilities
        /class="[^"]*\binset-/i,                       // Position utilities
        /class="[^"]*\b(ring|outline)-/i,              // Ring utilities
      ],
    },
  },
  {
    name: 'Bootstrap',
    category: 'CSS',
    patterns: {
      scripts: [/bootstrap(\.bundle)?(\.min)?\.js/i, /cdn\.jsdelivr\.net\/npm\/bootstrap/i],
      html: [
        /class="[^"]*\b(btn-primary|btn-secondary|btn-success)/i, // Bootstrap button classes
        /class="[^"]*\bnavbar-expand/i,                           // Bootstrap navbar
        /class="[^"]*\bcard-body/i,                               // Bootstrap card
        /class="[^"]*\bmodal-dialog/i,                            // Bootstrap modal
        /data-bs-toggle/i,                                         // Bootstrap 5 data attributes
      ],
    },
  },
  {
    name: 'Chakra UI',
    category: 'CSS',
    patterns: {
      scripts: [/@chakra-ui/i, /chakra-ui\.cjs/i],
      html: [/class="[^"]*chakra-/i],
    },
  },

  // Hosting/CDN - stricter patterns
  {
    name: 'Vercel',
    category: 'Hosting',
    patterns: {
      headers: { 'x-vercel-id': /./ },
      // Don't just look for "vercel" anywhere - too many false positives
    },
  },
  {
    name: 'Netlify',
    category: 'Hosting',
    patterns: {
      headers: { 'x-nf-request-id': /./ },
      html: [/netlify-identity-widget/i],
    },
  },
  // Cloudflare is used by ~80% of sites as CDN - not useful as tech indicator
  // {
  //   name: 'Cloudflare',
  //   category: 'CDN',
  //   patterns: {
  //     headers: { 'cf-ray': /./ },
  //   },
  // },

  // Auth - stricter patterns
  {
    name: 'Clerk',
    category: 'Auth',
    patterns: {
      scripts: [/clerk\.browser\.js/i, /cdn\.clerk\.dev/i, /@clerk\/clerk-js/i],
      html: [/clerk-root/i, /data-clerk/i],
    },
  },
  {
    name: 'Auth0',
    category: 'Auth',
    patterns: {
      scripts: [/cdn\.auth0\.com/i, /auth0-js/i, /@auth0\/auth0-spa-js/i],
    },
  },
  {
    name: 'Supabase',
    category: 'Backend',
    patterns: {
      scripts: [/supabase\.co/i, /@supabase\/supabase-js/i, /supabase-js/i],
    },
  },
  {
    name: 'Firebase',
    category: 'Backend',
    patterns: {
      scripts: [/firebaseapp\.com/i, /firebase-app/i, /gstatic\.com\/firebasejs/i],
    },
  },

  // Analytics - stricter patterns
  {
    name: 'Google Analytics',
    category: 'Analytics',
    patterns: {
      scripts: [/googletagmanager\.com\/gtag/i, /google-analytics\.com\/analytics/i, /gtag\('config'/i],
    },
  },
  {
    name: 'Plausible',
    category: 'Analytics',
    patterns: {
      scripts: [/plausible\.io\/js/i],
    },
  },
  {
    name: 'PostHog',
    category: 'Analytics',
    patterns: {
      scripts: [/posthog\.com\/static/i, /app\.posthog\.com/i, /us\.i\.posthog\.com/i],
    },
  },
  {
    name: 'Mixpanel',
    category: 'Analytics',
    patterns: {
      scripts: [/cdn\.mxpnl\.com/i, /mixpanel\.com\/libs/i],
    },
  },

  // Payments - stricter patterns
  {
    name: 'Stripe',
    category: 'Payments',
    patterns: {
      scripts: [/js\.stripe\.com/i, /stripe\.com\/v3/i],
    },
  },
  {
    name: 'Paddle',
    category: 'Payments',
    patterns: {
      scripts: [/cdn\.paddle\.com/i, /paddle\.js/i],
    },
  },
  {
    name: 'Lemon Squeezy',
    category: 'Payments',
    patterns: {
      scripts: [/lemonsqueezy\.com\/js/i, /assets\.lemonsqueezy\.com/i],
    },
  },
];

// Framework inference rules (e.g., Next.js implies React)
const FRAMEWORK_INFERENCES: Record<string, { implies: string; category: string }[]> = {
  'Next.js': [{ implies: 'React', category: 'Framework' }],
  'Nuxt': [{ implies: 'Vue', category: 'Framework' }],
  'SvelteKit': [{ implies: 'Svelte', category: 'Framework' }],
  'Remix': [{ implies: 'React', category: 'Framework' }],
  'Gatsby': [{ implies: 'React', category: 'Framework' }],
};

// Technologies that require multiple pattern matches to avoid false positives
const MULTI_MATCH_REQUIRED: Record<string, number> = {
  'Tailwind CSS': 2,  // Require at least 2 Tailwind patterns to match
  'Astro': 1,         // Require at least 1 very specific pattern
};

const CONFIDENCE_RANK: Record<TechStackItem['confidence'], number> = {
  low: 0,
  medium: 1,
  high: 2,
};

function mergeTechStack(base: TechStackItem[], enrichment: TechStackItem[]): TechStackItem[] {
  const merged = new Map<string, TechStackItem>();

  for (const item of base) {
    merged.set(item.name.toLowerCase(), { ...item });
  }

  for (const item of enrichment) {
    const key = item.name.toLowerCase();
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, { ...item });
      continue;
    }

    const confidence =
      CONFIDENCE_RANK[item.confidence] > CONFIDENCE_RANK[existing.confidence]
        ? item.confidence
        : existing.confidence;

    const evidenceParts = new Set(
      [existing.evidence, item.evidence].filter(Boolean)
    );

    const category =
      existing.category === 'Other' && item.category !== 'Other'
        ? item.category
        : existing.category;

    merged.set(key, {
      ...existing,
      category,
      confidence,
      evidence: Array.from(evidenceParts).join('; '),
    });
  }

  return Array.from(merged.values());
}

export async function analyzeTechStack(
  html: string,
  headers: Record<string, string>,
  targetUrl?: string
): Promise<TechStackItem[]> {
  const detected: TechStackItem[] = [];
  const detectedNames = new Set<string>();

  for (const pattern of DETECTION_PATTERNS) {
    let confidence: 'high' | 'medium' | 'low' = 'low';
    const evidence: string[] = [];
    let matchCount = 0;

    // Check HTML patterns
    if (pattern.patterns.html) {
      for (const regex of pattern.patterns.html) {
        if (regex.test(html)) {
          evidence.push(`HTML pattern: ${regex.source.substring(0, 50)}`);
          confidence = 'high';
          matchCount++;
        }
      }
    }

    // Check script patterns
    if (pattern.patterns.scripts) {
      for (const regex of pattern.patterns.scripts) {
        if (regex.test(html)) {
          evidence.push(`Script reference: ${regex.source.substring(0, 50)}`);
          confidence = 'high';
          matchCount++;
        }
      }
    }

    // Check meta patterns
    if (pattern.patterns.meta) {
      for (const regex of pattern.patterns.meta) {
        if (regex.test(html)) {
          evidence.push(`Meta tag: ${regex.source.substring(0, 50)}`);
          confidence = 'medium';
          matchCount++;
        }
      }
    }

    // Check headers
    if (pattern.patterns.headers) {
      for (const [headerName, headerRegex] of Object.entries(pattern.patterns.headers)) {
        const headerValue = headers[headerName.toLowerCase()];
        if (headerValue && headerRegex.test(headerValue)) {
          evidence.push(`Header: ${headerName}`);
          confidence = 'high';
          matchCount++;
        }
      }
    }

    // Check if we meet the minimum match requirement
    const minMatches = MULTI_MATCH_REQUIRED[pattern.name] || 1;

    if (evidence.length > 0 && matchCount >= minMatches) {
      detected.push({
        name: pattern.name,
        category: pattern.category,
        confidence,
        evidence: evidence.join(', '),
      });
      detectedNames.add(pattern.name);
    }
  }

  // Apply framework inference rules
  for (const [framework, inferences] of Object.entries(FRAMEWORK_INFERENCES)) {
    if (detectedNames.has(framework)) {
      for (const { implies, category } of inferences) {
        if (!detectedNames.has(implies)) {
          detected.push({
            name: implies,
            category,
            confidence: 'medium',
            evidence: `Inferred from ${framework}`,
          });
          detectedNames.add(implies);
        }
      }
    }
  }

  let enriched: TechStackItem[] = [];

  if (targetUrl) {
    try {
      const domain = new URL(targetUrl).hostname;
      enriched = await getTechEnrichment(domain);
    } catch {
      enriched = [];
    }
  }

  const merged = mergeTechStack(detected, enriched);

  // Sort by category priority: Framework > CSS > Backend > Analytics > Payments > Hosting > CDN
  const categoryOrder = ['Framework', 'CSS', 'Backend', 'Auth', 'Analytics', 'Payments', 'Hosting', 'CDN', 'Other'];
  merged.sort((a, b) => {
    const aOrder = categoryOrder.indexOf(a.category);
    const bOrder = categoryOrder.indexOf(b.category);
    const normalizedA = aOrder === -1 ? categoryOrder.length : aOrder;
    const normalizedB = bOrder === -1 ? categoryOrder.length : bOrder;
    return normalizedA - normalizedB;
  });

  return merged;
}
