-- =====================================================
-- SUPABASE STORAGE SETUP FOR WAR-PROOFS BUCKET
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Note: Storage buckets are created via Supabase Dashboard, not SQL.
-- Go to: Supabase Dashboard > Storage > New Bucket
-- Name: war-proofs
-- Public: Yes (checked)

-- However, we need RLS policies for the bucket:

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'war-proofs' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'war-proofs' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'war-proofs' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all files in the bucket
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'war-proofs');
