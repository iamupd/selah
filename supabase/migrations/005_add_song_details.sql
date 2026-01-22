-- Add additional song information fields
ALTER TABLE songs ADD COLUMN IF NOT EXISTS song_form TEXT;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS bpm INTEGER;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS time_signature TEXT;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS description TEXT;
