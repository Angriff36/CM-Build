-- Migration: Create media storage bucket
-- Description: Creates the 'media' bucket for storing uploaded files, partitioned by company

-- Create the media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  false, -- Not public; use signed URLs
  524288000, -- 500MB limit
  ARRAY[
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/quicktime',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
);

-- RLS policies for media bucket
-- Allow authenticated users to upload to their company folder
CREATE POLICY "Users can upload to their company folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'media'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'company_id')
);

-- Allow users to view objects in their company folder
CREATE POLICY "Users can view their company media" ON storage.objects
FOR SELECT USING (
  bucket_id = 'media'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'company_id')
);

-- Allow service role to manage all media (for processing)
CREATE POLICY "Service role can manage all media" ON storage.objects
FOR ALL USING (
  bucket_id = 'media'
  AND auth.role() = 'service_role'
);

-- Down migration
-- DELETE FROM storage.objects WHERE bucket_id = 'media';
-- DELETE FROM storage.buckets WHERE id = 'media';