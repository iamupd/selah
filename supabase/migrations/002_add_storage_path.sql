-- Add storage_path column to songs table for reliable file deletion
-- This stores the filename in Supabase Storage (e.g., "uuid-filename.png")

ALTER TABLE songs ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Create index for storage_path lookups
CREATE INDEX IF NOT EXISTS idx_songs_storage_path ON songs(storage_path);

-- Update policy for update operations
CREATE POLICY "Public update access for songs" ON songs
  FOR UPDATE USING (true) WITH CHECK (true);

-- Update policy for delete operations  
CREATE POLICY "Public delete access for songs" ON songs
  FOR DELETE USING (true);
