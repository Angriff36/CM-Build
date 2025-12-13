import { NextRequest, NextResponse } from 'next/server';
import { mapSupabaseError } from '@caterkingapp/shared/utils/errors';

const SCHEMA_VERSION = '1.2';

// POST: Rollback combine
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { group_id } = body;

    // TODO: Implement rollback_combine RPC function
    throw new Error('rollback_combine RPC function not implemented yet');
  } catch (error) {
    const { status, error: apiError } = mapSupabaseError(error);
    return NextResponse.json({ error: apiError }, { status });
  }
}
