from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

# Get DB URL
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found in env")
    exit(1)

# Fix libpq issue if needed (replace postgresql:// with postgresql+psycopg2:// if purely python)
# But standard string should work with recent sqla
print(f"Connecting to DB...")

engine = create_engine(DATABASE_URL)

sql_commands = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS current_level VARCHAR(50) DEFAULT 'Beginner';",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity_date DATE;"
]

with engine.connect() as conn:
    for cmd in sql_commands:
        try:
            print(f"Executing: {cmd}")
            conn.execute(text(cmd))
            conn.commit()
            print("Success")
        except Exception as e:
            print(f"Error executing {cmd}: {e}")
            
print("Migration complete.")
