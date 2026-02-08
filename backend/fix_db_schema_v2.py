import os
import sys
from sqlalchemy import create_engine, text

# Add current dir to path to import app if needed
sys.path.append(os.getcwd())

from backend.app.database import SQLALCHEMY_DATABASE_URL

def fix_schema():
    print(f"Connecting to DB: {SQLALCHEMY_DATABASE_URL}")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # Try adding verification_token separately
    try:
        with engine.connect() as conn:
            print("Attempting to add verification_token...")
            conn.execute(text("ALTER TABLE users ADD COLUMN verification_token VARCHAR"))
            conn.commit()
            print("Added verification_token column successfully.")
    except Exception as e:
        print(f"Error adding verification_token (maybe exists): {e}")

    # Try adding email_verified separately
    try:
        with engine.connect() as conn:
            print("Attempting to add email_verified...")
            conn.execute(text("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE"))
            conn.commit()
            print("Added email_verified column successfully.")
    except Exception as e:
        print(f"Error adding email_verified (maybe exists): {e}")

if __name__ == "__main__":
    fix_schema()
