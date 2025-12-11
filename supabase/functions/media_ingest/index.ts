import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Interface for media asset
interface MediaAsset {
  id: string;
  company_id: string;
  url: string;
  type: string;
  thumbnail_url?: string;
  duration?: number;
  status: string;
  storage_path: string;
  checksum?: string;
}

// Transcoding function placeholder - in real implementation, use ffmpeg-wasm or external service
async function transcodeVideo(
  file: Uint8Array,
  fileName: string,
): Promise<{ transcoded: Uint8Array; thumbnail: Uint8Array; duration: number }> {
  // Placeholder: simulate transcoding
  // In production, use ffmpeg-wasm or call a service like Cloudinary/FFmpeg
  console.log(`Transcoding ${fileName}...`);

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return mock data
  return {
    transcoded: file, // In reality, this would be the transcoded video
    thumbnail: new Uint8Array(1024), // Mock thumbnail
    duration: 120, // Mock duration in seconds
  };
}

async function generateThumbnail(file: Uint8Array): Promise<Uint8Array> {
  // Placeholder for thumbnail generation
  console.log('Generating thumbnail...');
  return new Uint8Array(1024); // Mock thumbnail data
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for internal operations
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      },
    );

    // Parse the storage webhook payload
    const payload = await req.json();
    const { eventType, bucketId, object } = payload;

    if (eventType !== 'OBJECT_CREATED') {
      return new Response(JSON.stringify({ message: 'Event not supported' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const filePath = object.key; // Storage path
    const fileSize = object.size;

    // Extract company_id from path (assuming path structure: company_id/filename)
    const pathParts = filePath.split('/');
    const companyId = pathParts[0];
    if (!companyId) {
      throw new Error('Invalid file path: missing company_id');
    }

    // Find the corresponding media_asset entry (should be created by sign API)
    const { data: mediaAsset, error: findError } = await supabaseClient
      .from('media_assets')
      .select('*')
      .eq('company_id', companyId)
      .eq('storage_path', filePath)
      .eq('status', 'pending')
      .single();

    if (findError || !mediaAsset) {
      console.error('Media asset not found or not pending:', findError);
      return new Response(JSON.stringify({ error: 'Media asset not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Update status to processing
    await supabaseClient
      .from('media_assets')
      .update({ status: 'processing' })
      .eq('id', mediaAsset.id);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from(bucketId)
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error('Failed to download file');
    }

    const fileBytes = new Uint8Array(await fileData.arrayBuffer());
    const fileType = mediaAsset.type;

    let transcodedData: Uint8Array | null = null;
    let thumbnailData: Uint8Array | null = null;
    let duration: number | null = null;

    if (fileType.startsWith('video/')) {
      // Transcode video and generate thumbnail
      const result = await transcodeVideo(fileBytes, filePath);
      transcodedData = result.transcoded;
      thumbnailData = result.thumbnail;
      duration = result.duration;
    } else if (fileType.startsWith('image/')) {
      // For images, just generate thumbnail
      thumbnailData = await generateThumbnail(fileBytes);
    }

    // Upload transcoded video if applicable
    let finalUrl = mediaAsset.url;
    if (transcodedData) {
      const transcodedPath = filePath.replace(/\.[^/.]+$/, '_transcoded.mp4'); // Example
      const { error: uploadTranscodedError } = await supabaseClient.storage
        .from(bucketId)
        .upload(transcodedPath, transcodedData, {
          contentType: 'video/mp4',
          upsert: true,
        });

      if (uploadTranscodedError) {
        console.error('Failed to upload transcoded video:', uploadTranscodedError);
      } else {
        const { data: transcodedUrlData } = supabaseClient.storage
          .from(bucketId)
          .getPublicUrl(transcodedPath);
        finalUrl = transcodedUrlData.publicUrl;
      }
    }

    // Upload thumbnail
    let thumbnailUrl: string | null = null;
    if (thumbnailData) {
      const thumbnailPath = filePath.replace(/\.[^/.]+$/, '_thumb.jpg');
      const { error: uploadThumbError } = await supabaseClient.storage
        .from(bucketId)
        .upload(thumbnailPath, thumbnailData, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (!uploadThumbError) {
        const { data: thumbUrlData } = supabaseClient.storage
          .from(bucketId)
          .getPublicUrl(thumbnailPath);
        thumbnailUrl = thumbUrlData.publicUrl;
      }
    }

    // Update media_asset with processed data
    const updateData: Partial<MediaAsset> = {
      status: 'ready',
      url: finalUrl,
    };

    if (thumbnailUrl) updateData.thumbnail_url = thumbnailUrl;
    if (duration) updateData.duration = duration;

    const { error: updateError } = await supabaseClient
      .from('media_assets')
      .update(updateData)
      .eq('id', mediaAsset.id);

    if (updateError) {
      throw updateError;
    }

    // Emit realtime event via pg_notify (clients listen via supabase.on('postgres_changes'))
    await supabaseClient.rpc('pg_notify', {
      channel: `company:${companyId}:media_assets`,
      payload: JSON.stringify({
        type: 'media_processed',
        entity_id: mediaAsset.id,
        data: updateData,
        timestamp: new Date().toISOString(),
      }),
    });

    console.log(`Media asset ${mediaAsset.id} processed successfully`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Media ingest error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
