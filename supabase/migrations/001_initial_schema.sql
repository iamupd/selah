-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  key TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create setlists table
CREATE TABLE IF NOT EXISTS setlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create setlist_songs table
CREATE TABLE IF NOT EXISTS setlist_songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setlist_id UUID NOT NULL REFERENCES setlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  song_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(setlist_id, song_order)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
CREATE INDEX IF NOT EXISTS idx_songs_key ON songs(key);
CREATE INDEX IF NOT EXISTS idx_setlists_date ON setlists(date);
CREATE INDEX IF NOT EXISTS idx_setlist_songs_setlist_id ON setlist_songs(setlist_id);
CREATE INDEX IF NOT EXISTS idx_setlist_songs_song_id ON setlist_songs(song_id);

-- Enable Row Level Security (RLS)
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlist_songs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for songs" ON songs
  FOR SELECT USING (true);

CREATE POLICY "Public read access for setlists" ON setlists
  FOR SELECT USING (true);

CREATE POLICY "Public read access for setlist_songs" ON setlist_songs
  FOR SELECT USING (true);

-- Create policies for insert (you can restrict this later with authentication)
CREATE POLICY "Public insert access for songs" ON songs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public insert access for setlists" ON setlists
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public insert access for setlist_songs" ON setlist_songs
  FOR INSERT WITH CHECK (true);
