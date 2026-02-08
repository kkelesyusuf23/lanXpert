import os
import sys
from sqlalchemy import create_engine, text

# Add current dir to path to import app if needed, but we just need DB URL
sys.path.append(os.getcwd())

from app.database import SQLALCHEMY_DATABASE_URL

def fix_schema():
    print(f"Connecting to DB: {SQLALCHEMY_DATABASE_URL}")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    with engine.connect() as conn:
        print("Attempting to add missing columns...")
        
        # Add email_verified
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE"))
            print("Added email_verified column")
        except Exception as e:
            print(f"email_verified column might already exist or error: {e}")
            
        # Add verification_token
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN verification_token VARCHAR"))
            print("Added verification_token column")
        except Exception as e:
            print(f"verification_token column might already exist or error: {e}")
            
        # Add phone_verified
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE"))
            print("Added phone_verified column")
        except Exception as e:
            print(f"phone_verified column might already exist or error: {e}")
            
        conn.commit()
        print("Schema update attempt complete.")

if __name__ == "__main__":
    fix_schema()
