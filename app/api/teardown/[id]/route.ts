// GET /api/teardown/[id] - Get teardown status and results
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { TeardownWithResults, Database } from '@/types/database';

interface TeardownStatusResponse {
  teardown: TeardownWithResults;
}

interface ErrorResponse {
  error: string;
  message: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Fetch teardown with results
    const { data: teardown, error } = (await supabaseAdmin
      .from('teardowns')
      .select('*, results:teardown_results(*)')
      .eq('id', id)
      .single()) as { data: (Database['public']['Tables']['teardowns']['Row'] & { results: Database['public']['Tables']['teardown_results']['Row'][] | Database['public']['Tables']['teardown_results']['Row'] }) | null; error: unknown };

    if (error || !teardown) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'not_found',
          message: 'Teardown not found',
        },
        { status: 404 }
      );
    }

    // Transform results - handle array vs single object
    const transformedTeardown: TeardownWithResults = {
      ...teardown,
      results: Array.isArray(teardown.results)
        ? (teardown.results[0] || null)
        : teardown.results,
    };

    return NextResponse.json<TeardownStatusResponse>({
      teardown: transformedTeardown,
    });
  } catch (error) {
    console.error('Error fetching teardown:', error);
    return NextResponse.json<ErrorResponse>(
      {
        error: 'internal_error',
        message: 'Failed to fetch teardown',
      },
      { status: 500 }
    );
  }
}
