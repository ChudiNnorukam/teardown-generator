// Main teardown analysis orchestrator
import { supabaseAdmin } from '../supabase/server';
import { analyzeTechStack } from './tech-stack';
import { analyzePricing } from './pricing';
import { analyzeSEO } from './seo';
import { analyzeCloneEstimate } from './clone-estimate';
import { createHash } from 'crypto';
import type { Database } from '@/types/database';

/**
 * Fetch HTML with timeout and error handling
 */
async function fetchWithTimeout(url: string, timeout = 15000): Promise<{
  html: string;
  headers: Record<string, string>;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; TeardownBot/1.0; +https://teardown-generator.vercel.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract headers
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    return { html, headers };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - website took too long to respond');
      }
      throw error;
    }

    throw new Error('Failed to fetch website');
  }
}

/**
 * Main analysis function - analyzes a teardown by ID
 */
export async function analyzeTeardown(teardownId: string): Promise<void> {
  try {
    // Get teardown record
    const { data: teardown, error: fetchError } = (await supabaseAdmin
      .from('teardowns')
      .select('*')
      .eq('id', teardownId)
      .single()) as { data: Database['public']['Tables']['teardowns']['Row'] | null; error: any };

    if (fetchError || !teardown) {
      throw new Error(`Teardown not found: ${teardownId}`);
    }

    // Update status to processing
    await (supabaseAdmin
      .from('teardowns') as any)
      .update({ status: 'processing' })
      .eq('id', teardownId);

    // Fetch website HTML
    console.log(`Fetching ${teardown.target_url}...`);
    const { html, headers } = await fetchWithTimeout(teardown.target_url);

    // Calculate HTML hash for cache detection
    const htmlHash = createHash('sha256').update(html).digest('hex').substring(0, 16);

    // Run analyzers in parallel
    console.log('Running analyzers...');
    const [techStack, pricing, seo] = await Promise.all([
      analyzeTechStack(html, headers),
      analyzePricing(html, teardown.target_url),
      analyzeSEO(html, teardown.target_url),
    ]);

    // Run clone estimate (depends on other analyzers)
    const cloneEstimate = await analyzeCloneEstimate(techStack, pricing, seo);

    // Save results to database
    console.log('Saving results...');
    const { error: resultsError } = await (supabaseAdmin.from('teardown_results') as any).insert({
      teardown_id: teardownId,
      tech_stack: techStack,
      pricing_analysis: pricing,
      seo_audit: seo,
      clone_estimate: cloneEstimate,
      raw_html_hash: htmlHash,
    });

    if (resultsError) {
      throw new Error(`Failed to save results: ${resultsError.message}`);
    }

    // Update teardown status to completed
    await (supabaseAdmin
      .from('teardowns') as any)
      .update({ status: 'completed' })
      .eq('id', teardownId);

    console.log(`Analysis complete for ${teardownId}`);
  } catch (error) {
    console.error(`Analysis failed for ${teardownId}:`, error);

    // Update teardown status to failed
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await (supabaseAdmin
      .from('teardowns') as any)
      .update({
        status: 'failed',
        error_message: errorMessage,
      })
      .eq('id', teardownId);

    throw error;
  }
}
