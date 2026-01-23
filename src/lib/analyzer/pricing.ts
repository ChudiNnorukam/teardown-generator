// Pricing page analysis
import type { PricingAnalysis, PricingTier } from '@/types/database';

const PRICING_LINK_PATTERNS = [
  /\/pricing\b/i,
  /\/plans?\b/i,
  /\/pro\b/i,
  /\/upgrade\b/i,
  /\/subscribe/i,
  /\/buy\b/i,
];

const PRICE_REGEX = /\$[\d,]+(?:\.\d{2})?(?:\/(?:mo|month|yr|year|user|seat))?/gi;

const PLAN_NAME_PATTERNS = [
  /\b(free|trial|basic|pro|premium|enterprise|starter|business|team|individual|standard|advanced|ultimate)\b/gi,
];

/**
 * Find pricing page links in HTML
 */
function findPricingLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match;

  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1];

    for (const pattern of PRICING_LINK_PATTERNS) {
      if (pattern.test(href)) {
        try {
          const url = new URL(href, baseUrl);
          links.push(url.href);
        } catch {
          // Invalid URL, skip
        }
        break;
      }
    }
  }

  return [...new Set(links)]; // Deduplicate
}

/**
 * Extract pricing tiers from HTML
 */
function extractPricingTiers(html: string): PricingTier[] {
  const tiers: PricingTier[] = [];

  // Find all prices
  const prices = html.match(PRICE_REGEX) || [];

  if (prices.length === 0) {
    return tiers;
  }

  // Try to find plan names near prices
  // This is a simple heuristic - in production you'd want more sophisticated parsing
  const sections = html.split(/<(?:div|section|article)[^>]*>/i);

  for (const section of sections) {
    const sectionPrices = section.match(PRICE_REGEX);
    if (!sectionPrices || sectionPrices.length === 0) continue;

    // Try to find plan name in this section
    let planName = 'Unknown Plan';
    for (const namePattern of PLAN_NAME_PATTERNS) {
      const nameMatch = section.match(namePattern);
      if (nameMatch && nameMatch[0]) {
        planName = nameMatch[0].charAt(0).toUpperCase() + nameMatch[0].slice(1).toLowerCase();
        break;
      }
    }

    // Extract features (very basic - look for bullet points or list items)
    const features: string[] = [];
    const featureRegex = /<li[^>]*>([^<]+)<\/li>/gi;
    let featureMatch;
    let featureCount = 0;

    while ((featureMatch = featureRegex.exec(section)) !== null && featureCount < 5) {
      const feature = featureMatch[1].trim().replace(/&[^;]+;/g, '');
      if (feature.length > 5 && feature.length < 100) {
        features.push(feature);
        featureCount++;
      }
    }

    const price = sectionPrices[0];
    const periodMatch = price.match(/\/(mo|month|yr|year|user|seat)/i);
    const period = periodMatch ? periodMatch[1].toLowerCase() : 'month';

    tiers.push({
      name: planName,
      price,
      period,
      features: features.length > 0 ? features : ['Details not extracted'],
    });

    // Limit to 5 tiers max
    if (tiers.length >= 5) break;
  }

  return tiers;
}

export async function analyzePricing(
  html: string,
  baseUrl: string
): Promise<PricingAnalysis> {
  // First, try to find pricing links in the main page
  const pricingLinks = findPricingLinks(html, baseUrl);

  if (pricingLinks.length === 0) {
    // No pricing page link found, try to extract from current page
    const tiers = extractPricingTiers(html);

    if (tiers.length > 0) {
      return {
        found: true,
        url: baseUrl,
        tiers,
      };
    }

    return {
      found: false,
    };
  }

  // Found pricing page links - fetch the first one
  const pricingUrl = pricingLinks[0];

  try {
    const response = await fetch(pricingUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TeardownBot/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return {
        found: true,
        url: pricingUrl,
        tiers: [],
      };
    }

    const pricingHtml = await response.text();
    const tiers = extractPricingTiers(pricingHtml);

    return {
      found: true,
      url: pricingUrl,
      tiers: tiers.length > 0 ? tiers : [],
    };
  } catch (error) {
    console.error('Error fetching pricing page:', error);
    return {
      found: true,
      url: pricingUrl,
      tiers: [],
    };
  }
}
