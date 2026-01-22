-- Add role column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT '팀원' CHECK (role IN ('인도자', '팀원'));

-- Update existing records to have default role
UPDATE user_profiles SET role = '팀원' WHERE role IS NULL;
