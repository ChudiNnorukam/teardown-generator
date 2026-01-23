// SEO audit analyzer
import type { SEOAudit, SEOCheck } from '@/types/database';

interface SEOCheckConfig {
  name: string;
  weight: number; // 1-10, higher is more important
  check: (html: string, baseUrl: string) => Promise<SEOCheck> | SEOCheck;
}

const SEO_CHECKS: SEOCheckConfig[] = [
  {
    name: 'Title Tag',
    weight: 10,
    check: (html) => {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : null;
      const length = title?.length || 0;

      return {
        name: 'Title Tag',
        passed: !!title && length >= 30 && length <= 60,
        value: title || 'Missing',
        recommendation:
          !title
            ? 'Add a title tag'
            : length < 30
            ? 'Title is too short (< 30 chars)'
            : length > 60
            ? 'Title is too long (> 60 chars)'
            : 'Title length is optimal',
      };
    },
  },
  {
    name: 'Meta Description',
    weight: 9,
    check: (html) => {
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const description = descMatch ? descMatch[1].trim() : null;
      const length = description?.length || 0;

      return {
        name: 'Meta Description',
        passed: !!description && length >= 120 && length <= 160,
        value: description || 'Missing',
        recommendation:
          !description
            ? 'Add a meta description'
            : length < 120
            ? 'Description is too short (< 120 chars)'
            : length > 160
            ? 'Description is too long (> 160 chars)'
            : 'Description length is optimal',
      };
    },
  },
  {
    name: 'H1 Tag',
    weight: 8,
    check: (html) => {
      const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
      const count = h1Matches.length;

      return {
        name: 'H1 Tag',
        passed: count === 1,
        value: count,
        recommendation:
          count === 0
            ? 'Add an H1 tag'
            : count > 1
            ? 'Use only one H1 tag per page'
            : 'H1 usage is optimal',
      };
    },
  },
  {
    name: 'Heading Hierarchy',
    weight: 5,
    check: (html) => {
      const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
      const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
      const hasHierarchy = h2Count > 0;

      return {
        name: 'Heading Hierarchy',
        passed: hasHierarchy,
        value: `H2: ${h2Count}, H3: ${h3Count}`,
        recommendation: hasHierarchy
          ? 'Good heading structure'
          : 'Add H2/H3 headings for better structure',
      };
    },
  },
  {
    name: 'Canonical Tag',
    weight: 7,
    check: (html) => {
      const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
      const hasCanonical = !!canonicalMatch;

      return {
        name: 'Canonical Tag',
        passed: hasCanonical,
        value: canonicalMatch ? canonicalMatch[1] : 'Missing',
        recommendation: hasCanonical
          ? 'Canonical tag is set'
          : 'Add canonical tag to prevent duplicate content issues',
      };
    },
  },
  {
    name: 'Open Graph Tags',
    weight: 6,
    check: (html) => {
      const ogTitle = /<meta[^>]*property=["']og:title["']/i.test(html);
      const ogDescription = /<meta[^>]*property=["']og:description["']/i.test(html);
      const ogImage = /<meta[^>]*property=["']og:image["']/i.test(html);
      const count = [ogTitle, ogDescription, ogImage].filter(Boolean).length;

      return {
        name: 'Open Graph Tags',
        passed: count >= 2,
        value: `${count}/3 tags present`,
        recommendation:
          count === 3
            ? 'All essential OG tags present'
            : 'Add og:title, og:description, and og:image for better social sharing',
      };
    },
  },
  {
    name: 'Twitter Card',
    weight: 5,
    check: (html) => {
      const hasTwitterCard = /<meta[^>]*name=["']twitter:card["']/i.test(html);

      return {
        name: 'Twitter Card',
        passed: hasTwitterCard,
        value: hasTwitterCard,
        recommendation: hasTwitterCard
          ? 'Twitter Card meta tag is set'
          : 'Add twitter:card meta tag for Twitter sharing',
      };
    },
  },
  {
    name: 'Robots Meta',
    weight: 4,
    check: (html) => {
      const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i);
      const robotsContent = robotsMatch ? robotsMatch[1] : null;
      const hasNoindex = robotsContent?.includes('noindex');

      return {
        name: 'Robots Meta',
        passed: !hasNoindex,
        value: robotsContent || 'Not set (default: index, follow)',
        recommendation: hasNoindex
          ? 'Page has noindex - it will not be indexed by search engines'
          : 'Robots settings allow indexing',
      };
    },
  },
  {
    name: 'robots.txt',
    weight: 3,
    check: async (_, baseUrl) => {
      try {
        const robotsUrl = new URL('/robots.txt', baseUrl);
        const response = await fetch(robotsUrl.href, {
          signal: AbortSignal.timeout(5000),
        });

        const exists = response.ok;
        const content = exists ? await response.text() : '';
        const blocksAll = content.includes('Disallow: /');

        return {
          name: 'robots.txt',
          passed: exists && !blocksAll,
          value: exists,
          recommendation: !exists
            ? 'Add robots.txt file'
            : blocksAll
            ? 'robots.txt is blocking all crawlers'
            : 'robots.txt is accessible',
        };
      } catch {
        return {
          name: 'robots.txt',
          passed: false,
          value: false,
          recommendation: 'Could not check robots.txt',
        };
      }
    },
  },
  {
    name: 'sitemap.xml',
    weight: 3,
    check: async (_, baseUrl) => {
      try {
        const sitemapUrl = new URL('/sitemap.xml', baseUrl);
        const response = await fetch(sitemapUrl.href, {
          signal: AbortSignal.timeout(5000),
        });

        const exists = response.ok;

        return {
          name: 'sitemap.xml',
          passed: exists,
          value: exists,
          recommendation: exists
            ? 'sitemap.xml is accessible'
            : 'Add sitemap.xml for better crawling',
        };
      } catch {
        return {
          name: 'sitemap.xml',
          passed: false,
          value: false,
          recommendation: 'Could not check sitemap.xml',
        };
      }
    },
  },
];

export async function analyzeSEO(html: string, baseUrl: string): Promise<SEOAudit> {
  const checks: SEOCheck[] = [];
  let totalWeight = 0;
  let earnedWeight = 0;

  for (const config of SEO_CHECKS) {
    const result = await config.check(html, baseUrl);
    checks.push(result);

    totalWeight += config.weight;
    if (result.passed) {
      earnedWeight += config.weight;
    }
  }

  // Calculate score out of 100
  const score = Math.round((earnedWeight / totalWeight) * 100);

  // Generate summary
  const passedCount = checks.filter((c) => c.passed).length;
  const totalCount = checks.length;

  const summary =
    score >= 80
      ? `Excellent SEO (${passedCount}/${totalCount} checks passed)`
      : score >= 60
      ? `Good SEO (${passedCount}/${totalCount} checks passed)`
      : score >= 40
      ? `Fair SEO (${passedCount}/${totalCount} checks passed)`
      : `Poor SEO (${passedCount}/${totalCount} checks passed)`;

  return {
    score,
    checks,
    summary,
  };
}
