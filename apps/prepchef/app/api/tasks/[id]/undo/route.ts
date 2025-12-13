import { NextRequest, NextResponse } from 'next/server';
import { undoTask } from '@caterkingapp/supabase/rpc/tasks';
import { UndoTaskRequestSchema } from '@caterkingapp/shared/dto/tasks';
import { mapSupabaseError } from '@caterkingapp/shared/utils/errors';

const SCHEMA_VERSION = '1.0';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const validation = UndoTaskRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload.',
            remediation: 'Check the request body against the schema.',
          },
        },
        { status: 422 },
      );
    }

    const response = await undoTask(validation.data);

    // Telemetry
    console.log('OTEL span:', {
      trace_id: 'generated-trace-id',
      actor_id: 'current-user-id',
      company_id: 'current-company-id',
      feature_flag_state: {},
      endpoint: `/api/tasks/${id}/undo`,
      method: 'POST',
    });

    return NextResponse.json({
      data: response,
      meta: {
        schema_version: SCHEMA_VERSION,
      },
    });
  } catch (error) {
    const { status, error: apiError } = mapSupabaseError(error);
    return NextResponse.json({ error: apiError }, { status });
  }
}
