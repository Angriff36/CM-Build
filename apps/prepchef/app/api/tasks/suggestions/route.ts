import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../libs/supabase/src/client';
import { mapSupabaseError } from '../../../../libs/shared/src/utils/errors';

const SCHEMA_VERSION = '1.2';

// GET: Retrieve task suggestions
export async function GET(request: NextRequest) {
  const supabase = createClient();

  try {
    // Retrieve suggestions from task_similarity_suggestions table
    const { data, error } = await supabase
      .from('task_similarity_suggestions')
      .select('*')
      .limit(10);

    if (error) {
      throw error;
    }

    // Telemetry
    console.log('OTEL span:', {
      trace_id: 'generated-trace-id',
      actor_id: 'current-user-id',
      company_id: 'current-company-id',
      feature_flag_state: {},
      endpoint: '/api/tasks/suggestions',
      method: 'GET',
    });

    return NextResponse.json({
      data: {
        suggestions: data,
      },
      meta: {
        schema_version: SCHEMA_VERSION,
        heuristic_version: 'combine.v3',
      },
    });
  } catch (error) {
    const { status, error: apiError } = mapSupabaseError(error);
    return NextResponse.json({ error: apiError }, { status });
  }
}

// POST: Request task suggestions based on filters
export async function POST(request: NextRequest) {
  const supabase = createClient();

  try {
    const body = await request.json();
    const { filters } = body;

    // Call Supabase function to generate suggestions
    const { data, error } = await supabase.rpc('generate_task_suggestions', {
      filters,
    });

    if (error) {
      throw error;
    }

    // Telemetry
    console.log('OTEL span:', {
      trace_id: 'generated-trace-id',
      actor_id: 'current-user-id',
      company_id: 'current-company-id',
      feature_flag_state: {},
      endpoint: '/api/tasks/suggestions',
      method: 'POST',
    });

    return NextResponse.json({
      data: {
        suggestions: data,
      },
      meta: {
        schema_version: SCHEMA_VERSION,
        heuristic_version: 'combine.v3',
        sla: 1000, // example
      },
    });
  } catch (error) {
    const { status, error: apiError } = mapSupabaseError(error);
    return NextResponse.json({ error: apiError }, { status });
  }
}
