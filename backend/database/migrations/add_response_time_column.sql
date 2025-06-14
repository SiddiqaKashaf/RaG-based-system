-- Add response_time_ms column to activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS response_time_ms INTEGER;

-- Add success column to activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT true;

-- Add error_message column to activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Update existing records to have default values
UPDATE activities 
SET response_time_ms = 0 
WHERE response_time_ms IS NULL;

UPDATE activities 
SET success = true 
WHERE success IS NULL; 