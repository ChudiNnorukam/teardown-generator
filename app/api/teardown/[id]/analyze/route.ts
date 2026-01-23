// GET /api/teardown/[id]/analyze - Stream analysis progress
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { analyzeTechStack } from '@/lib/analyzer/tech-stack';
import { analyzePricing } from '@/lib/analyzer/pricing';
import { analyzeSEO } from '@/lib/analyzer/seo';
import { analyzeCloneEstimate } from '@/lib/analyzer/clone-estimate';
import { createHash } from 'crypto';
import type { Database } from '@/types/database';

interface StreamMessage {
  step: string;
  status: 'in_progress' | 'complete' | 'failed';
  message: string;
  preview?: any;
  teardownId?: string;
}

/**
 * Fetch HTML with timeout
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
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Verify teardown exists
  const { data: teardown, error: fetchError } = (await supabaseAdmin
    .from('teardowns')
    .select('*')
    .eq('id', id)
    .single()) as { data: Database['public']['Tables']['teardowns']['Row'] | null; error: any };

  if (fetchError || !teardown) {
    return new Response(
      JSON.stringify({ error: 'not_found', message: 'Teardown not found' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Create Server-Sent Events stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (data: StreamMessage) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Step 1: Update status to processing
        await (supabaseAdmin
          .from('teardowns') as any)
          .update({ status: 'processing' })
          .eq('id', id);

        // Step 2: Fetch website
        send({
          step: 'fetching',
          status: 'in_progress',
          message: 'Fetching website...',
        });

        const { html, headers } = await fetchWithTimeout(teardown.target_url);

        send({
          step: 'fetching',
          status: 'complete',
          message: 'Website fetched successfully',
        });

        // Step 3: Tech stack analysis
        send({
          step: 'tech_stack',
          status: 'in_progress',
          message: 'Detecting technologies...',
        });

        const techStack = await analyzeTechStack(html, headers);

        send({
          step: 'tech_stack',
          status: 'complete',
          message: `Found ${techStack.length} technologies`,
          preview: techStack.slice(0, 3),
        });

        // Step 4: Pricing analysis
        send({
          step: 'pricing',
          status: 'in_progress',
          message: 'Analyzing pricing...',
        });

        const pricing = await analyzePricing(html, teardown.target_url);

        send({
          step: 'pricing',
          status: 'complete',
          message: pricing.found
            ? `Found ${pricing.tiers?.length || 0} pricing tier${pricing.tiers?.length !== 1 ? 's' : ''}`
            : 'No pricing page found',
        });

        // Step 5: SEO audit
        send({
          step: 'seo',
          status: 'in_progress',
          message: 'Running SEO audit...',
        });

        const seo = await analyzeSEO(html, teardown.target_url);

        send({
          step: 'seo',
          status: 'complete',
          message: `SEO score: ${seo.score}/100`,
        });

        // Step 6: Clone estimate
        send({
          step: 'clone',
          status: 'in_progress',
          message: 'Calculating clone estimate...',
        });

        const clone = await analyzeCloneEstimate(techStack, pricing, seo);

        send({
          step: 'clone',
          status: 'complete',
          message: `Estimated ${clone.totalHours} hours (${clone.complexity} complexity)`,
        });

        // Step 7: Save results
        const htmlHash = createHash('sha256').update(html).digest('hex').substring(0, 16);

        await (supabaseAdmin.from('teardown_results') as any).insert({
          teardown_id: id,
          tech_stack: techStack,
          pricing_analysis: pricing,
          seo_audit: seo,
          clone_estimate: clone,
          raw_html_hash: htmlHash,
        });

        await (supabaseAdmin
          .from('teardowns') as any)
          .update({ status: 'completed' })
          .eq('id', id);

        // Final message
        send({
          step: 'done',
          status: 'complete',
          message: 'Analysis complete',
          teardownId: id,
        });
      } catch (error) {
        console.error('Analysis error:', error);

        // Store full error internally for debugging
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        await (supabaseAdmin
          .from('teardowns') as any)
          .update({
            status: 'failed',
            error_message: errorMessage,
          })
          .eq('id', id);

        // Send user-friendly error message to client (never expose internals)
        send({
          step: 'error',
          status: 'failed',
          message: 'Analysis failed. Please try again with a different URL.',
        });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
