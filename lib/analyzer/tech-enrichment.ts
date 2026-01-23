import type { TechStackItem } from '@/types/database';

const DEFAULT_BUILTWITH_API_URL = 'https://api.builtwith.com/v20/api.json';
const DEFAULT_WAPPALYZER_API_URL = 'https://api.wappalyzer.com/v2/lookup/';

const CATEGORY_RULES: Array<{ pattern: RegExp; category: TechStackItem['category'] | 'Other' }> = [
  { pattern: /framework|javascript framework|web framework/i, category: 'Framework' },
  { pattern: /css|ui|design|component|style/i, category: 'CSS' },
  { pattern: /auth|authentication|identity|security/i, category: 'Auth' },
  { pattern: /analytics|tracking|monitoring|tag/i, category: 'Analytics' },
  { pattern: /payment|billing|checkout|ecommerce/i, category: 'Payments' },
  { pattern: /cdn|content delivery/i, category: 'CDN' },
  { pattern: /hosting|paas|infrastructure|cloud|server/i, category: 'Hosting' },
  { pattern: /database|backend|api|storage|queue/i, category: 'Backend' },
];

function parseAllowlist(): Set<string> {
  const raw = process.env.TEARDOWN_ENRICH_ALLOWLIST || '';
  const items = raw
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return new Set(items);
}

const ENRICH_ALLOWLIST = parseAllowlist();

function allowDomain(domain: string): boolean {
  if (ENRICH_ALLOWLIST.size === 0) {
    return true;
  }

  return ENRICH_ALLOWLIST.has(domain.toLowerCase());
}

function mapCategory(label?: string): TechStackItem['category'] | 'Other' {
  if (!label) {
    return 'Other';
  }

  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(label)) {
      return rule.category;
    }
  }

  return 'Other';
}

function normalizeName(name?: string): string | null {
  if (!name) {
    return null;
  }

  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function fetchBuiltWith(domain: string): Promise<TechStackItem[]> {
  const apiKey = process.env.BUILTWITH_API_KEY;
  if (!apiKey) {
    return [];
  }

  const baseUrl = process.env.BUILTWITH_API_URL || DEFAULT_BUILTWITH_API_URL;
  const url = new URL(baseUrl);
  url.searchParams.set('KEY', apiKey);
  url.searchParams.set('LOOKUP', domain);

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'TeardownBot/1.0',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as {
    Results?: Array<{
      Result?: {
        Paths?: Array<{
          Technologies?: Array<{
            Name?: string;
            Tag?: string;
            Categories?: Array<{ Name?: string; Tag?: string }>;
          }>;
        }>;
      };
    }>;
  };

  const results: TechStackItem[] = [];

  for (const result of payload.Results || []) {
    for (const path of result.Result?.Paths || []) {
      for (const tech of path.Technologies || []) {
        const name = normalizeName(tech.Name || tech.Tag);
        if (!name) {
          continue;
        }

        const categoryLabel = tech.Categories?.[0]?.Name || tech.Categories?.[0]?.Tag;
        const category = mapCategory(categoryLabel);

        results.push({
          name,
          category,
          confidence: 'high',
          evidence: 'BuiltWith API',
        });
      }
    }
  }

  return results;
}

async function fetchWappalyzer(domain: string): Promise<TechStackItem[]> {
  const apiKey = process.env.WAPPALYZER_API_KEY;
  if (!apiKey) {
    return [];
  }

  const baseUrl = process.env.WAPPALYZER_API_URL || DEFAULT_WAPPALYZER_API_URL;
  const url = new URL(baseUrl);
  const lookupUrl = domain.startsWith('http') ? domain : `https://${domain}`;
  url.searchParams.set('urls', lookupUrl);

  const response = await fetch(url.toString(), {
    headers: {
      'x-api-key': apiKey,
      'User-Agent': 'TeardownBot/1.0',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as Array<{
    technologies?: Array<{
      name?: string;
      categories?: Array<{ name?: string }>;
      confidence?: number;
    }>;
  }>;

  const results: TechStackItem[] = [];

  for (const entry of payload || []) {
    for (const tech of entry.technologies || []) {
      const name = normalizeName(tech.name);
      if (!name) {
        continue;
      }

      const category = mapCategory(tech.categories?.[0]?.name);
      const confidenceValue = tech.confidence ?? 100;

      results.push({
        name,
        category,
        confidence: confidenceValue >= 80 ? 'high' : confidenceValue >= 50 ? 'medium' : 'low',
        evidence: 'Wappalyzer API',
      });
    }
  }

  return results;
}

export async function getTechEnrichment(domain: string): Promise<TechStackItem[]> {
  if (!domain || !allowDomain(domain)) {
    return [];
  }

  const builtWithResults = await fetchBuiltWith(domain);
  if (builtWithResults.length > 0) {
    return builtWithResults;
  }

  const wappalyzerResults = await fetchWappalyzer(domain);
  if (wappalyzerResults.length > 0) {
    return wappalyzerResults;
  }

  return [];
}
