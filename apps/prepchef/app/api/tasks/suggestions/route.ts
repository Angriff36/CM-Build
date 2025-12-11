import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../libs/supabase/src/client';
import { mapSupabaseError } from '../../../../libs/shared/src/utils/errors';

const SCHEMA_VERSION = '1.0';

// GET: Retrieve task suggestions
export async function GET(request: NextRequest) {
  const supabase = createClient();

  try {
    // For now, return available tasks as suggestions
    const { data, error } = await supabase
      .from('tasks')
      .select('id, name, quantity, unit, priority')
      .eq('status', 'available')
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
      data,
      meta: {
        schema_version: SCHEMA_VERSION,
      },
    });
  } catch (error) {
    const { status, error: apiError } = mapSupabaseError(error);
    return NextResponse.json({ error: apiError }, { status });
  }
}

// POST: Perhaps create a task suggestion or combine
export async function POST(request: NextRequest) {
  // For now, return not implemented
  return NextResponse.json(
    {
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'POST /api/tasks/suggestions not yet implemented.',
      },
    },
    { status: 501 },
  );
}
