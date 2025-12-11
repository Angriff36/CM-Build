import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../../libs/supabase/src/client';
import { mapSupabaseError } from '../../../../../libs/shared/src/utils/errors';

const SCHEMA_VERSION = '1.2';

// POST: Bulk assign tasks
export async function POST(request: NextRequest) {
  const supabase = createClient();

  try {
    const body = await request.json();
    const { assignments, reason, idempotencyKey } = body;

    // Call bulk_assign RPC
    const { data, error } = await supabase.rpc('bulk_assign_tasks', {
      assignments,
      reason,
      idempotency_key: idempotencyKey,
    });

    if (error) {
      throw error;
    }

    // Emit realtime event
    await supabase.channel(`company:${data.company_id}:tasks`).send({
      type: 'broadcast',
      event: 'assignments_on_board',
      payload: data,
    });

    // Telemetry
    console.log('OTEL span:', {
      trace_id: 'generated-trace-id',
      actor_id: 'current-user-id',
      company_id: data.company_id,
      feature_flag_state: {},
      endpoint: '/api/tasks/bulk-assign',
      method: 'POST',
    });

    return NextResponse.json({
      data: {
        assignments: data,
      },
      meta: {
        schema_version: SCHEMA_VERSION,
        audit_reference_id: 'audit-id',
        realtime_channel: `company:${data.company_id}:tasks`,
      },
    });
  } catch (error) {
    const { status, error: apiError } = mapSupabaseError(error);
    return NextResponse.json({ error: apiError }, { status });
  }
}
