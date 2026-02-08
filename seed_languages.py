
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend directory to path to import models
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import models
from app.database import Base

# Database URL
DATABASE_URL = "postgresql://postgres.oytdebklocpsuncaqkkg:6sHFSHFpeIPZg9tX@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_languages():
    db = SessionLocal()
    languages = [
        {"code": "en", "name": "English"},
        {"code": "tr", "name": "Turkish"},
        {"code": "es", "name": "Spanish"},
        {"code": "fr", "name": "French"},
        {"code": "jp", "name": "Japanese"},
        {"code": "de", "name": "German"},
    ]

    print("Seeding Languages...")
    for lang in languages:
        existing = db.query(models.Language).filter(models.Language.code == lang["code"]).first()
        if not existing:
            new_lang = models.Language(code=lang["code"], name=lang["name"])
            db.add(new_lang)
            db.commit()
            db.refresh(new_lang)
            print(f"Created: {new_lang.name} (ID: {new_lang.id})")
        else:
            print(f"Exists: {existing.name} (ID: {existing.id})")
    
    db.close()

if __name__ == "__main__":
    seed_languages()
