import { NextRequest, NextResponse } from 'next/server';
import { mapSupabaseError } from '@codemachine/shared/utils/errors';

const SCHEMA_VERSION = '1.2';

// POST: Combine tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskIds, approvedBy, heuristicsMetadata, idempotencyKey } = body;

    // TODO: Implement combine_tasks RPC function
    throw new Error('combine_tasks RPC function not implemented yet');
  } catch (error) {
    const { status, error: apiError } = mapSupabaseError(error);
    return NextResponse.json({ error: apiError }, { status });
  }
}
