import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../../../../libs/supabase/src/client';
import { mapSupabaseError } from '../../../../../../../libs/shared/src/utils/errors';

const SCHEMA_VERSION = '1.2';

// POST: Rollback combine
export async function POST(request: NextRequest) {
  const supabase = createClient();

  try {
    const body = await request.json();
    const { group_id } = body;

    // Call rollback RPC
    const { data, error } = await supabase.rpc('rollback_combine', {
      group_id,
    });

    if (error) {
      throw error;
    }

    // Emit realtime event
    await supabase.channel(`company:${data.company_id}:tasks`).send({
      type: 'broadcast',
      event: 'group_rolled_back',
      payload: { group_id },
    });

    // Telemetry
    console.log('OTEL span:', {
      trace_id: 'generated-trace-id',
      actor_id: 'current-user-id',
      company_id: data.company_id,
      feature_flag_state: {},
      endpoint: '/api/tasks/combine/rollback',
      method: 'POST',
    });

    return NextResponse.json({
      data: {
        tasks: data,
      },
      meta: {
        schema_version: SCHEMA_VERSION,
        audit_reference_id: 'audit-id',
      },
    });
  } catch (error) {
    const { status, error: apiError } = mapSupabaseError(error);
    return NextResponse.json({ error: apiError }, { status });
  }
}
