-- Add description column to setlists table
ALTER TABLE setlists ADD COLUMN IF NOT EXISTS description TEXT;
