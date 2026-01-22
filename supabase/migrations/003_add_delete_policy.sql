-- Add DELETE policy for songs table
CREATE POLICY "Public delete access for songs" ON songs
  FOR DELETE USING (true);

-- Add UPDATE policy for songs table
CREATE POLICY "Public update access for songs" ON songs
  FOR UPDATE USING (true);
