import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../libs/supabase/src/client';
import { mapSupabaseError } from '../../../../libs/shared/src/utils/errors';

const SCHEMA_VERSION = '1.0';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  try {
    let query = supabase.from('events').select(`
      id,
      name,
      scheduled_at,
      location,
      notes,
      status,
      tasks (
        status,
        count: id
      )
    `);

    if (startDate) {
      query = query.gte('scheduled_at', startDate);
    }

    if (endDate) {
      query = query.lte('scheduled_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Aggregate status counts
    const eventsWithCounts = data.map((event) => {
      const statusCounts = event.tasks.reduce((acc: Record<string, number>, task: any) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {});
      return {
        ...event,
        status_counts: statusCounts,
        tasks: undefined, // remove raw tasks
      };
    });

    // Telemetry
    console.log('OTEL span:', {
      trace_id: 'generated-trace-id',
      actor_id: 'current-user-id',
      company_id: 'current-company-id',
      feature_flag_state: {},
      endpoint: '/api/events',
      method: 'GET',
    });

    return NextResponse.json({
      data: eventsWithCounts,
      meta: {
        schema_version: SCHEMA_VERSION,
      },
    });
  } catch (error) {
    const { status, error: apiError } = mapSupabaseError(error);
    return NextResponse.json({ error: apiError }, { status });
  }
}
