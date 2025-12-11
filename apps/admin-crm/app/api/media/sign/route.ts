import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../libs/supabase/src/client';
import { mapSupabaseError } from '../../../../libs/shared/src/utils/errors';

const SCHEMA_VERSION = '1.0';
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_MIME_TYPES = [
  'video/mp4',
  'video/avi',
  'video/mov',
  'video/quicktime',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export async function POST(request: NextRequest) {
  const supabase = createClient();

  try {
    const body = await request.json();
    const { fileName, fileSize, mimeType, companyId } = body;

    // Validate inputs
    if (!fileName || !fileSize || !mimeType || !companyId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds limit' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user belongs to company and has permission (assume manager+ can upload)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .eq('company_id', companyId)
      .single();

    if (userError || !['manager', 'event_lead', 'owner'].includes(userData.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Generate storage path: companyId/filename
    const storagePath = `${companyId}/${Date.now()}-${fileName}`;

    // Insert pending media_asset
    const { data: mediaAsset, error: insertError } = await supabase
      .from('media_assets')
      .insert({
        company_id: companyId,
        url: '', // Will be set after upload
        type: mimeType,
        status: 'pending',
        storage_path: storagePath,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Generate signed upload URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('media') // Assume bucket name 'media'
      .createSignedUploadUrl(storagePath, {
        upsert: false, // Prevent overwrites
      });

    if (signedUrlError) {
      throw signedUrlError;
    }

    // Telemetry
    console.log('OTEL span:', {
      trace_id: 'generated-trace-id',
      actor_id: user.id,
      company_id: companyId,
      feature_flag_state: {},
      endpoint: '/api/media/sign',
      method: 'POST',
      media_asset_id: mediaAsset.id,
    });

    return NextResponse.json({
      data: {
        signedUrl: signedUrlData.signedUrl,
        path: signedUrlData.path,
        mediaAssetId: mediaAsset.id,
      },
      meta: {
        schema_version: SCHEMA_VERSION,
      },
    });
  } catch (error) {
    const { status, error: apiError } = mapSupabaseError(error);
    return NextResponse.json({ error: apiError }, { status });
  }
}
