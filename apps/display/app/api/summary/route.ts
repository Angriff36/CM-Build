import { NextRequest, NextResponse } from 'next/server';

const SCHEMA_VERSION = '1.2';

// GET: Get display summary
export async function GET(request: NextRequest) {
  try {
    // For public display kiosk, return summary of active tasks
    // In production, this would query Supabase with service role

    const cards = [
      {
        type: 'active_tasks',
        count: 0,
        urgent: false,
      },
      {
        type: 'assigned_tasks',
        count: 0,
        urgent: false,
      },
      {
        type: 'completed_tasks',
        count: 0,
        urgent: false,
      },
    ];

    return NextResponse.json({
      cards,
      assignments: [],
      captured_at: new Date().toISOString(),
      staleness_ms: 0,
      realtime_channel: 'company:display_snapshots',
    });
  } catch (error) {
    console.error('Display summary error:', error);
    return NextResponse.json({ error: 'Failed to fetch display summary' }, { status: 500 });
  }
}
