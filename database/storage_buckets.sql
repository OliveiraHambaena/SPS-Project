-- Create storage bucket for course images
INSERT INTO storage.buckets (id, name, public)
VALUES ('courses', 'Course Images', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Create policy to allow authenticated users to upload course images
CREATE POLICY "Authenticated users can upload course images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'courses');

-- Create policy to allow users to update their own course images
CREATE POLICY "Users can update their own course images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow users to delete their own course images
CREATE POLICY "Users can delete their own course images"
ON storage.objects
FOR DELETE
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow public access to view course images
CREATE POLICY "Course images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'courses');

-- Create policy to allow authenticated users to create folders in the courses bucket
CREATE POLICY "Authenticated users can create folders in courses bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'courses' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Add comment to bucket
COMMENT ON TABLE storage.buckets IS 'Storage buckets for files and images';
