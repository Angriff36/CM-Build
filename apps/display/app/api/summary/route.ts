import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../../libs/supabase/src/client';
import { mapSupabaseError } from '../../../../../libs/shared/src/utils/errors';

const SCHEMA_VERSION = '1.2';

// GET: Get display summary
export async function GET(request: NextRequest) {
  const supabase = createClient();

  try {
    const url = new URL(request.url);
    const since = url.searchParams.get('since');
    const eventScope = url.searchParams.get('event_scope');
    const stationScope = url.searchParams.get('station_scope');
    const agg = url.searchParams.get('agg') || 'live';

    // Query materialized view
    const { data, error } = await supabase
      .from('display_summary_view')
      .select('*')
      .gte('captured_at', since || new Date().toISOString())
      .eq('event_scope', eventScope)
      .eq('station_scope', stationScope)
      .eq('agg', agg);

    if (error) {
      throw error;
    }

    // Telemetry
    console.log('OTEL span:', {
      trace_id: 'generated-trace-id',
      actor_id: 'current-user-id',
      company_id: 'current-company-id',
      feature_flag_state: {},
      endpoint: '/api/display/summary',
      method: 'GET',
    });

    return NextResponse.json({
      data: {
        cards: data?.cards || [],
        assignments: data?.assignments || [],
      },
      meta: {
        schema_version: SCHEMA_VERSION,
        captured_at: data?.captured_at || new Date().toISOString(),
        staleness_ms: 0,
        realtime_channel: 'company:{company_id}:display_snapshots',
      },
    });
  } catch (error) {
    const { status, error: apiError } = mapSupabaseError(error);
    return NextResponse.json({ error: apiError }, { status });
  }
}
