import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../../libs/supabase/src/client';
import { mapSupabaseError } from '../../../../../libs/shared/src/utils/errors';

const SCHEMA_VERSION = '1.2';

// POST: Combine tasks
export async function POST(request: NextRequest) {
  const supabase = createClient();

  try {
    const body = await request.json();
    const { taskIds, approvedBy, heuristicsMetadata, idempotencyKey } = body;

    // Call combine_tasks RPC
    const { data, error } = await supabase.rpc('combine_tasks', {
      task_ids: taskIds,
      approved_by: approvedBy,
      heuristics_metadata: heuristicsMetadata,
      idempotency_key: idempotencyKey,
    });

    if (error) {
      throw error;
    }

    // Emit realtime event
    await supabase.channel(`company:${data.company_id}:tasks`).send({
      type: 'broadcast',
      event: 'combined_task_created',
      payload: { group_id: data.id, aggregated_quantity: data.aggregated_quantity },
    });

    // Telemetry
    console.log('OTEL span:', {
      trace_id: 'generated-trace-id',
      actor_id: 'current-user-id',
      company_id: data.company_id,
      feature_flag_state: {},
      endpoint: '/api/tasks/combine',
      method: 'POST',
    });

    return NextResponse.json({
      data: {
        combinedGroup: data,
        primaryTask: data.primary_task, // assume RPC returns this
      },
      meta: {
        schema_version: SCHEMA_VERSION,
        audit_reference_id: 'audit-id',
        realtime_events: ['tasks', 'display_snapshots'],
      },
    });
  } catch (error) {
    const { status, error: apiError } = mapSupabaseError(error);
    return NextResponse.json({ error: apiError }, { status });
  }
}
