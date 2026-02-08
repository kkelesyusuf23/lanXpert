-- Add statistic columns to users table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'xp') THEN 
        ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0; 
    END IF; 

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'current_level') THEN 
        ALTER TABLE users ADD COLUMN current_level VARCHAR(50) DEFAULT 'Beginner'; 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'streak_days') THEN 
        ALTER TABLE users ADD COLUMN streak_days INTEGER DEFAULT 0; 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_activity_date') THEN 
        ALTER TABLE users ADD COLUMN last_activity_date DATE; 
    END IF;
END $$;
