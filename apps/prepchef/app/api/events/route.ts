import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@codemachine/supabase';
import { mapSupabaseError } from '@codemachine/shared/utils/errors';

const SCHEMA_VERSION = '1.0';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  try {
    // First get events
    let eventsQuery = supabase.from('events').select(`
      id,
      name,
      scheduled_at,
      status
    `);

    if (startDate) {
      eventsQuery = eventsQuery.gte('scheduled_at', startDate);
    }

    if (endDate) {
      eventsQuery = eventsQuery.lte('scheduled_at', endDate);
    }

    const { data: events, error: eventsError } = await eventsQuery;

    if (eventsError) {
      throw eventsError;
    }

    // Then get tasks for each event
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('event_id, status, id')
      .in(
        'event_id',
        events.map((e) => e.id),
      );

    if (tasksError) {
      throw tasksError;
    }

    const data = events;

    // Aggregate status counts
    const eventsWithCounts = events.map((event) => {
      const eventTasks = tasks.filter((task) => task.event_id === event.id);
      const statusCounts = eventTasks.reduce((acc: Record<string, number>, task: any) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {});
      return {
        ...event,
        status_counts: statusCounts,
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
