
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Testing connection to: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'LOCAL'}")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("✅ Connection Successful!")
        
        # Check if tables exist (e.g., users)
        result = connection.execute(text("SELECT to_regclass('public.users')"))
        exists = result.scalar()
        if exists:
            print("✅ 'users' table found.")
        else:
            print("❌ 'users' table NOT found. Did you run the SQL script?")
            
except Exception as e:
    print(f"❌ Connection Failed: {e}")
