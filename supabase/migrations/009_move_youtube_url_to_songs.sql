-- Move youtube_url from setlist_songs to songs table
-- This allows each song to have a single YouTube link that can be reused across setlists

-- Add youtube_url column to songs table
ALTER TABLE songs ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Migrate existing youtube_url data from setlist_songs to songs
-- If a song has multiple youtube_urls in different setlists, use the first non-null one
UPDATE songs
SET youtube_url = (
  SELECT youtube_url
  FROM setlist_songs
  WHERE setlist_songs.song_id = songs.id
    AND setlist_songs.youtube_url IS NOT NULL
    AND setlist_songs.youtube_url != ''
  LIMIT 1
)
WHERE id IN (
  SELECT DISTINCT song_id
  FROM setlist_songs
  WHERE youtube_url IS NOT NULL
    AND youtube_url != ''
);

-- Remove youtube_url column from setlist_songs (optional, can keep for backward compatibility)
-- ALTER TABLE setlist_songs DROP COLUMN IF EXISTS youtube_url;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_songs_youtube_url ON songs(youtube_url) WHERE youtube_url IS NOT NULL;
