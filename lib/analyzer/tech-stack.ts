// Tech stack detection from HTML and headers
import type { TechStackItem } from '@/types/database';

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
  // Frameworks
  {
    name: 'Next.js',
    category: 'Framework',
    patterns: {
      scripts: [/_next\//i, /__NEXT_DATA__/i],
      meta: [/next\.js/i],
    },
  },
  {
    name: 'Nuxt',
    category: 'Framework',
    patterns: {
      scripts: [/_nuxt\//i, /__NUXT__/i],
    },
  },
  {
    name: 'React',
    category: 'Framework',
    patterns: {
      scripts: [/react(-dom)?\..*\.js/i],
      html: [/data-reactroot/i, /data-reactid/i],
    },
  },
  {
    name: 'Vue',
    category: 'Framework',
    patterns: {
      scripts: [/vue\..*\.js/i],
      html: [/v-if=/i, /v-for=/i, /v-model=/i],
    },
  },
  {
    name: 'Svelte',
    category: 'Framework',
    patterns: {
      scripts: [/svelte(-kit)?/i, /__sveltekit/i],
    },
  },
  {
    name: 'Astro',
    category: 'Framework',
    patterns: {
      meta: [/astro/i],
      scripts: [/astro/i],
    },
  },

  // CSS Frameworks
  {
    name: 'Tailwind CSS',
    category: 'CSS',
    patterns: {
      html: [/class="[^"]*\b(flex|grid|w-|h-|p-|m-|bg-|text-)/i],
    },
  },
  {
    name: 'Bootstrap',
    category: 'CSS',
    patterns: {
      scripts: [/bootstrap(\.min)?\.js/i],
      html: [/class="[^"]*\b(container|row|col-)/i],
    },
  },
  {
    name: 'Chakra UI',
    category: 'CSS',
    patterns: {
      scripts: [/chakra-ui/i],
    },
  },

  // Hosting/CDN
  {
    name: 'Vercel',
    category: 'Hosting',
    patterns: {
      headers: { 'x-vercel-id': /./, 'x-vercel-cache': /./ },
      scripts: [/vercel/i],
    },
  },
  {
    name: 'Netlify',
    category: 'Hosting',
    patterns: {
      headers: { 'x-nf-request-id': /./ },
    },
  },
  {
    name: 'Cloudflare',
    category: 'CDN',
    patterns: {
      headers: { 'cf-ray': /./, 'cf-cache-status': /./ },
    },
  },

  // Auth
  {
    name: 'Clerk',
    category: 'Auth',
    patterns: {
      scripts: [/clerk\..*\.js/i, /clerk\.com/i],
    },
  },
  {
    name: 'Auth0',
    category: 'Auth',
    patterns: {
      scripts: [/auth0/i],
    },
  },
  {
    name: 'Supabase',
    category: 'Backend',
    patterns: {
      scripts: [/supabase/i],
    },
  },
  {
    name: 'Firebase',
    category: 'Backend',
    patterns: {
      scripts: [/firebase/i, /firebaseapp\.com/i],
    },
  },

  // Analytics
  {
    name: 'Google Analytics',
    category: 'Analytics',
    patterns: {
      scripts: [/gtag|google-analytics|googletagmanager/i],
    },
  },
  {
    name: 'Plausible',
    category: 'Analytics',
    patterns: {
      scripts: [/plausible\.io/i],
    },
  },
  {
    name: 'PostHog',
    category: 'Analytics',
    patterns: {
      scripts: [/posthog/i],
    },
  },
  {
    name: 'Mixpanel',
    category: 'Analytics',
    patterns: {
      scripts: [/mixpanel/i],
    },
  },

  // Payments
  {
    name: 'Stripe',
    category: 'Payments',
    patterns: {
      scripts: [/stripe\.com\/v3|stripe\.js/i],
    },
  },
  {
    name: 'Paddle',
    category: 'Payments',
    patterns: {
      scripts: [/paddle\.js/i, /paddle\.com/i],
    },
  },
  {
    name: 'Lemon Squeezy',
    category: 'Payments',
    patterns: {
      scripts: [/lemonsqueezy/i],
    },
  },
];

export async function analyzeTechStack(
  html: string,
  headers: Record<string, string>
): Promise<TechStackItem[]> {
  const detected: TechStackItem[] = [];

  for (const pattern of DETECTION_PATTERNS) {
    let confidence: 'high' | 'medium' | 'low' = 'low';
    const evidence: string[] = [];

    // Check HTML patterns
    if (pattern.patterns.html) {
      for (const regex of pattern.patterns.html) {
        if (regex.test(html)) {
          evidence.push(`HTML pattern: ${regex.source.substring(0, 50)}`);
          confidence = 'high';
        }
      }
    }

    // Check script patterns
    if (pattern.patterns.scripts) {
      for (const regex of pattern.patterns.scripts) {
        if (regex.test(html)) {
          evidence.push(`Script reference: ${regex.source.substring(0, 50)}`);
          confidence = 'high';
        }
      }
    }

    // Check meta patterns
    if (pattern.patterns.meta) {
      for (const regex of pattern.patterns.meta) {
        if (regex.test(html)) {
          evidence.push(`Meta tag: ${regex.source.substring(0, 50)}`);
          confidence = 'medium';
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
        }
      }
    }

    if (evidence.length > 0) {
      detected.push({
        name: pattern.name,
        category: pattern.category,
        confidence,
        evidence: evidence.join(', '),
      });
    }
  }

  return detected;
}
