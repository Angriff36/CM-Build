import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../libs/supabase/src/client';
import { mapSupabaseError } from '../../../../libs/shared/src/utils/errors';

const SCHEMA_VERSION = '1.2';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('event_id');
  const status = searchParams.get('status');

  try {
    let query = supabase.from('tasks').select(`
      id,
      name,
      quantity,
      unit,
      status,
      priority,
      assigned_user_id,
      event_id,
      instructions_ref,
      created_at,
      recipes (
        id,
        name,
        ingredients,
        steps
      )
    `);

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Telemetry
    console.log('OTEL span:', {
      trace_id: 'generated-trace-id', // TODO: use proper tracing
      actor_id: 'current-user-id', // TODO: get from auth
      company_id: 'current-company-id', // TODO: get from auth
      feature_flag_state: {},
      endpoint: '/api/tasks',
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
