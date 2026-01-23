/**
 * Tech Stack Detection Accuracy Test
 *
 * Tests the analyzer against 20+ sites with known tech stacks.
 * Calculates accuracy percentage and documents false positives/negatives.
 */

import { analyzeTechStack } from '../lib/analyzer/tech-stack';

interface GroundTruth {
  url: string;
  name: string;
  knownTech: string[];
  notes?: string;
}

// Ground truth data: Sites with publicly known/documented tech stacks
const TEST_SITES: GroundTruth[] = [
  // Next.js + Vercel sites (officially documented)
  {
    url: 'https://vercel.com',
    name: 'Vercel',
    knownTech: ['Next.js', 'React', 'Vercel'],
    notes: 'Vercel\'s own site, obviously uses their stack'
  },
  {
    url: 'https://nextjs.org',
    name: 'Next.js Docs',
    knownTech: ['Next.js', 'React', 'Vercel', 'Tailwind CSS'],
  },
  {
    url: 'https://linear.app',
    name: 'Linear',
    knownTech: ['Next.js', 'React'],
  },
  {
    url: 'https://cal.com',
    name: 'Cal.com',
    knownTech: ['Next.js', 'React', 'Tailwind CSS', 'Vercel'],
    notes: 'Open source, tech stack documented'
  },

  // Nuxt/Vue sites
  {
    url: 'https://nuxt.com',
    name: 'Nuxt',
    knownTech: ['Nuxt', 'Vue'],
  },

  // Svelte sites
  {
    url: 'https://kit.svelte.dev',
    name: 'SvelteKit Docs',
    knownTech: ['Svelte', 'Vercel'],
  },

  // Astro sites
  {
    url: 'https://astro.build',
    name: 'Astro',
    knownTech: ['Astro', 'Vercel'],
  },

  // Firebase/Google sites
  {
    url: 'https://firebase.google.com',
    name: 'Firebase',
    knownTech: ['Google Analytics'],
  },

  // Stripe sites
  {
    url: 'https://stripe.com',
    name: 'Stripe',
    knownTech: ['Stripe', 'React'],
  },

  // Analytics-focused sites
  {
    url: 'https://plausible.io',
    name: 'Plausible',
    knownTech: ['Plausible'],
  },
  {
    url: 'https://posthog.com',
    name: 'PostHog',
    knownTech: ['PostHog', 'Next.js', 'React'],
  },

  // Auth providers
  {
    url: 'https://clerk.com',
    name: 'Clerk',
    knownTech: ['Clerk', 'Next.js', 'React'],
  },
  {
    url: 'https://auth0.com',
    name: 'Auth0',
    knownTech: ['Auth0', 'React'],
  },
  {
    url: 'https://supabase.com',
    name: 'Supabase',
    knownTech: ['Supabase', 'Next.js', 'React'],
  },

  // Payment processors
  {
    url: 'https://paddle.com',
    name: 'Paddle',
    knownTech: ['Paddle'],
  },
  {
    url: 'https://lemonsqueezy.com',
    name: 'Lemon Squeezy',
    knownTech: ['Lemon Squeezy', 'Next.js', 'React', 'Vercel'],
  },

  // CDN/Hosting
  {
    url: 'https://netlify.com',
    name: 'Netlify',
    knownTech: ['Netlify', 'React'],
  },
  // Cloudflare detection disabled - too many false positives (used by ~80% of sites as CDN)
  // {
  //   url: 'https://cloudflare.com',
  //   name: 'Cloudflare',
  //   knownTech: ['Cloudflare'],
  // },

  // Tailwind sites
  {
    url: 'https://tailwindcss.com',
    name: 'Tailwind CSS',
    knownTech: ['Tailwind CSS', 'Next.js', 'React', 'Vercel'],
  },

  // Bootstrap sites
  {
    url: 'https://getbootstrap.com',
    name: 'Bootstrap',
    knownTech: ['Bootstrap'],
  },

  // Mixed stacks for edge cases
  {
    url: 'https://github.com',
    name: 'GitHub',
    knownTech: ['React'],
    notes: 'Large complex site'
  },
  {
    url: 'https://notion.so',
    name: 'Notion',
    knownTech: ['React'],
    notes: 'Complex SPA'
  },
];

interface TestResult {
  site: GroundTruth;
  detected: string[];
  truePositives: string[];
  falsePositives: string[];
  falseNegatives: string[];
  accuracy: number;
  fetchError?: string;
}

async function fetchWithTimeout(url: string, timeout = 15000): Promise<{
  html: string;
  headers: Record<string, string>;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TeardownBot/1.0)',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    return { html, headers };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function testSite(site: GroundTruth): Promise<TestResult> {
  try {
    console.log(`Testing ${site.name} (${site.url})...`);

    const { html, headers } = await fetchWithTimeout(site.url);
    const techStack = await analyzeTechStack(html, headers);
    const detected = techStack.map(t => t.name);

    // Calculate accuracy metrics
    const truePositives = detected.filter(d => site.knownTech.includes(d));
    const falsePositives = detected.filter(d => !site.knownTech.includes(d));
    const falseNegatives = site.knownTech.filter(k => !detected.includes(k));

    // Accuracy = true positives / (true positives + false positives + false negatives)
    const total = truePositives.length + falsePositives.length + falseNegatives.length;
    const accuracy = total > 0 ? (truePositives.length / total) * 100 : 0;

    return {
      site,
      detected,
      truePositives,
      falsePositives,
      falseNegatives,
      accuracy,
    };
  } catch (error) {
    return {
      site,
      detected: [],
      truePositives: [],
      falsePositives: [],
      falseNegatives: site.knownTech,
      accuracy: 0,
      fetchError: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function runAccuracyTest(): Promise<void> {
  console.log('='.repeat(60));
  console.log('TECH STACK DETECTION ACCURACY TEST');
  console.log('='.repeat(60));
  console.log(`Testing ${TEST_SITES.length} sites with known tech stacks...\n`);

  const results: TestResult[] = [];

  for (const site of TEST_SITES) {
    const result = await testSite(site);
    results.push(result);

    // Small delay between requests
    await new Promise(r => setTimeout(r, 1000));
  }

  // Calculate overall metrics
  const successfulTests = results.filter(r => !r.fetchError);
  const totalTruePositives = successfulTests.reduce((sum, r) => sum + r.truePositives.length, 0);
  const totalFalsePositives = successfulTests.reduce((sum, r) => sum + r.falsePositives.length, 0);
  const totalFalseNegatives = successfulTests.reduce((sum, r) => sum + r.falseNegatives.length, 0);
  const totalExpected = successfulTests.reduce((sum, r) => sum + r.site.knownTech.length, 0);

  const overallAccuracy = totalExpected > 0
    ? (totalTruePositives / totalExpected) * 100
    : 0;

  const precision = (totalTruePositives + totalFalsePositives) > 0
    ? (totalTruePositives / (totalTruePositives + totalFalsePositives)) * 100
    : 0;

  const recall = (totalTruePositives + totalFalseNegatives) > 0
    ? (totalTruePositives / (totalTruePositives + totalFalseNegatives)) * 100
    : 0;

  // Print detailed results
  console.log('\n' + '='.repeat(60));
  console.log('DETAILED RESULTS');
  console.log('='.repeat(60));

  for (const result of results) {
    console.log(`\n${result.site.name} (${result.site.url})`);

    if (result.fetchError) {
      console.log(`  ❌ FETCH ERROR: ${result.fetchError}`);
      continue;
    }

    console.log(`  Expected: ${result.site.knownTech.join(', ')}`);
    console.log(`  Detected: ${result.detected.join(', ') || 'None'}`);
    console.log(`  ✓ True positives: ${result.truePositives.join(', ') || 'None'}`);

    if (result.falsePositives.length > 0) {
      console.log(`  ⚠ False positives: ${result.falsePositives.join(', ')}`);
    }
    if (result.falseNegatives.length > 0) {
      console.log(`  ✗ False negatives: ${result.falseNegatives.join(', ')}`);
    }

    console.log(`  Accuracy: ${result.accuracy.toFixed(1)}%`);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Sites tested: ${TEST_SITES.length}`);
  console.log(`Successful fetches: ${successfulTests.length}`);
  console.log(`Failed fetches: ${results.filter(r => r.fetchError).length}`);
  console.log('');
  console.log(`Total expected technologies: ${totalExpected}`);
  console.log(`True positives: ${totalTruePositives}`);
  console.log(`False positives: ${totalFalsePositives}`);
  console.log(`False negatives: ${totalFalseNegatives}`);
  console.log('');
  console.log(`RECALL (detection rate): ${recall.toFixed(1)}%`);
  console.log(`PRECISION (accuracy of detections): ${precision.toFixed(1)}%`);
  console.log(`OVERALL ACCURACY: ${overallAccuracy.toFixed(1)}%`);
  console.log('');

  // Pass/fail based on 85% threshold
  const TARGET_ACCURACY = 85;
  if (recall >= TARGET_ACCURACY) {
    console.log(`✅ PASS: Recall ${recall.toFixed(1)}% >= ${TARGET_ACCURACY}% target`);
  } else {
    console.log(`❌ FAIL: Recall ${recall.toFixed(1)}% < ${TARGET_ACCURACY}% target`);
    console.log('\nTop false negatives to address:');

    // Group false negatives by tech
    const fnByTech: Record<string, string[]> = {};
    for (const result of successfulTests) {
      for (const fn of result.falseNegatives) {
        if (!fnByTech[fn]) fnByTech[fn] = [];
        fnByTech[fn].push(result.site.name);
      }
    }

    const sorted = Object.entries(fnByTech).sort((a, b) => b[1].length - a[1].length);
    for (const [tech, sites] of sorted.slice(0, 5)) {
      console.log(`  - ${tech}: missed on ${sites.join(', ')}`);
    }
  }
}

// Run the test
runAccuracyTest().catch(console.error);
