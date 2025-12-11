import { NextRequest, NextResponse } from 'next/server';
import { completeTask } from '../../../../../libs/supabase/src/rpc/tasks';
import { CompleteTaskRequestSchema } from '../../../../../libs/shared/src/dto/tasks';
import { mapSupabaseError } from '../../../../../libs/shared/src/utils/errors';

const SCHEMA_VERSION = '1.0';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const validation = CompleteTaskRequestSchema.safeParse({ task_id: params.id });

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

    const response = await completeTask(validation.data);

    // Telemetry
    console.log('OTEL span:', {
      trace_id: 'generated-trace-id',
      actor_id: 'current-user-id',
      company_id: 'current-company-id',
      feature_flag_state: {},
      endpoint: `/api/tasks/${params.id}/complete`,
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
