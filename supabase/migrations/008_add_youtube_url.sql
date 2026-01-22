-- Add youtube_url column to setlist_songs table
-- This allows each song in a setlist to have its own YouTube link

ALTER TABLE setlist_songs ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Add index for better performance when querying with youtube_url
CREATE INDEX IF NOT EXISTS idx_setlist_songs_youtube_url ON setlist_songs(youtube_url) WHERE youtube_url IS NOT NULL;
